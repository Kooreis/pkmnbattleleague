"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var scripts_exports = {};
__export(scripts_exports, {
  Scripts: () => Scripts
});
module.exports = __toCommonJS(scripts_exports);
const Scripts = {
  inherit: "gen2",
  gen: 2,
  pokemon: {
    inherit: true,
    getStat(statName, unboosted, unmodified, fastReturn) {
      if (statName === "hp")
        throw new Error("Please read `maxhp` directly");
      let stat = this.storedStats[statName];
      if (!unboosted) {
        let boost = this.boosts[statName];
        if (boost > 6)
          boost = 6;
        if (boost < -6)
          boost = -6;
        if (boost >= 0) {
          const boostTable = [1, 1.5, 2, 2.5, 3, 3.5, 4];
          stat = Math.floor(stat * boostTable[boost]);
        } else {
          const numerators = [100, 66, 50, 40, 33, 28, 25];
          stat = Math.floor(stat * numerators[-boost] / 100);
        }
      }
      if (this.status === "par" && statName === "spe") {
        stat = Math.floor(stat / 4);
      }
      if (!unmodified) {
        if (this.status === "brn" && statName === "atk") {
          stat = Math.floor(stat / 2);
        }
      }
      stat = this.battle.clampIntRange(stat, 1, 999);
      if (fastReturn)
        return stat;
      if (!unboosted) {
        if (statName === "def" && this.side.sideConditions["reflect"] || statName === "spd" && this.side.sideConditions["lightscreen"]) {
          if (this.side.active.length === 1) {
            stat *= 2;
          } else {
            stat *= 1.5;
          }
        }
      }
      if (["Cubone", "Marowak"].includes(this.baseSpecies.name) && this.item === "thickclub" && statName === "atk" || this.baseSpecies.name === "Pikachu" && this.item === "lightball" && statName === "spa") {
        stat *= 2;
      } else if (this.baseSpecies.name === "Ditto" && this.item === "metalpowder" && ["def", "spd"].includes(statName)) {
        stat = Math.floor(stat * 1.5);
      }
      return stat;
    }
  },
  actions: {
    inherit: true,
    getDamage(source, target, move, suppressMessages) {
      if (typeof move === "string") {
        move = this.dex.getActiveMove(move);
      } else if (typeof move === "number") {
        move = {
          basePower: move,
          type: "???",
          category: "Physical",
          willCrit: false,
          flags: {}
        };
      }
      if (!move.ignoreImmunity || move.ignoreImmunity !== true && !move.ignoreImmunity[move.type]) {
        if (!target.runImmunity(move.type, true)) {
          return false;
        }
      }
      if (move.ohko) {
        return target.maxhp;
      }
      if (move.damageCallback) {
        return move.damageCallback.call(this.battle, source, target);
      }
      if (move.damage === "level") {
        return source.level;
      }
      if (move.damage) {
        return move.damage;
      }
      move.category = this.battle.getCategory(move);
      if (!move.type)
        move.type = "???";
      const type = move.type;
      let basePower = move.basePower;
      if (move.basePowerCallback) {
        basePower = move.basePowerCallback.call(this.battle, source, target, move);
      }
      if (!basePower) {
        if (basePower === 0)
          return;
        return basePower;
      }
      basePower = this.battle.clampIntRange(basePower, 1);
      let critRatio = this.battle.runEvent("ModifyCritRatio", source, target, move, move.critRatio || 0);
      critRatio = this.battle.clampIntRange(critRatio, 0, 5);
      const critMult = [0, 17, 32, 64, 85, 128];
      let isCrit = move.willCrit || false;
      if (typeof move.willCrit === "undefined") {
        if (critRatio) {
          isCrit = this.battle.random(256) < critMult[critRatio];
        }
      }
      if (isCrit && this.battle.runEvent("CriticalHit", target, null, move)) {
        target.getMoveHitData(move).crit = true;
      }
      if (basePower) {
        if (move.isConfusionSelfHit) {
          move.type = move.baseMoveType;
          basePower = this.battle.runEvent("BasePower", source, target, move, basePower, true);
          move.type = "???";
        } else {
          basePower = this.battle.runEvent("BasePower", source, target, move, basePower, true);
        }
        if (basePower && move.basePowerModifier) {
          basePower *= move.basePowerModifier;
        }
      }
      if (!basePower)
        return 0;
      basePower = this.battle.clampIntRange(basePower, 1);
      let level = source.level;
      if (move.allies) {
        this.battle.add("-activate", source, "move: Beat Up", "[of] " + move.allies[0].name);
        level = move.allies[0].level;
      }
      const attacker = move.overrideOffensivePokemon === "target" ? target : source;
      const defender = move.overrideDefensivePokemon === "source" ? source : target;
      const isPhysical = move.category === "Physical";
      const atkType = move.overrideOffensiveStat || (isPhysical ? "atk" : "spa");
      const defType = move.overrideDefensiveStat || (isPhysical ? "def" : "spd");
      let unboosted = false;
      let noburndrop = false;
      if (isCrit) {
        if (!suppressMessages)
          this.battle.add("-crit", target);
        if (attacker.boosts[atkType] <= defender.boosts[defType]) {
          unboosted = true;
          noburndrop = true;
        }
      }
      let attack = attacker.getStat(atkType, unboosted, noburndrop);
      let defense = defender.getStat(defType, unboosted);
      if (move.allies) {
        attack = move.allies[0].species.baseStats.atk;
        move.allies.shift();
        defense = defender.species.baseStats.def;
      }
      if (move.ignoreOffensive) {
        this.battle.debug("Negating (sp)atk boost/penalty.");
        attack = attacker.getStat(atkType, true, true);
      }
      if (move.ignoreDefensive) {
        this.battle.debug("Negating (sp)def boost/penalty.");
        defense = target.getStat(defType, true, true);
      }
      if (move.id === "present") {
        const typeIndexes = {
          Normal: 0,
          Fighting: 1,
          Flying: 2,
          Poison: 3,
          Ground: 4,
          Rock: 5,
          Bug: 7,
          Ghost: 8,
          Steel: 9,
          Fire: 20,
          Water: 21,
          Grass: 22,
          Electric: 23,
          Psychic: 24,
          Ice: 25,
          Dragon: 26,
          Dark: 27
        };
        attack = 10;
        const attackerLastType = attacker.getTypes().slice(-1)[0];
        const defenderLastType = defender.getTypes().slice(-1)[0];
        defense = typeIndexes[attackerLastType] || 1;
        level = typeIndexes[defenderLastType] || 1;
        this.battle.hint("Gen 2 Present has a glitched damage calculation using the secondary types of the Pokemon for the Attacker's Level and Defender's Defense.", true);
      }
      if (attack >= 256 || defense >= 256) {
        if (attack >= 1024 || defense >= 1024) {
          this.battle.hint("In Gen 2, a stat will roll over to a small number if it is larger than 1024.");
        }
        attack = this.battle.clampIntRange(Math.floor(attack / 4) % 256, 1);
        defense = this.battle.clampIntRange(Math.floor(defense / 4) % 256, 1);
      }
      if (move.selfdestruct && defType === "def") {
        defense = this.battle.clampIntRange(Math.floor(defense / 2), 1);
      }
      let damage = level * 2;
      damage = Math.floor(damage / 5);
      damage += 2;
      damage *= basePower;
      damage *= attack;
      damage = Math.floor(damage / defense);
      damage = Math.floor(damage / 50);
      if (isCrit)
        damage *= 2;
      damage = Math.floor(this.battle.runEvent("ModifyDamage", attacker, defender, move, damage));
      damage = this.battle.clampIntRange(damage, 1, 997);
      damage += 2;
      if (type === "Water" && this.battle.field.isWeather("raindance") || type === "Fire" && this.battle.field.isWeather("sunnyday")) {
        damage = Math.floor(damage * 1.5);
      } else if ((type === "Fire" || move.id === "solarbeam") && this.battle.field.isWeather("raindance") || type === "Water" && this.battle.field.isWeather("sunnyday")) {
        damage = Math.floor(damage / 2);
      }
      if (type !== "???" && source.hasType(type)) {
        damage += Math.floor(damage / 2);
      }
      const totalTypeMod = target.runEffectiveness(move);
      if (totalTypeMod > 0) {
        if (!suppressMessages)
          this.battle.add("-supereffective", target);
        damage *= 2;
        if (totalTypeMod >= 2) {
          damage *= 2;
        }
      }
      if (totalTypeMod < 0) {
        if (!suppressMessages)
          this.battle.add("-resisted", target);
        damage = Math.floor(damage / 2);
        if (totalTypeMod <= -2) {
          damage = Math.floor(damage / 2);
        }
      }
      const { targets } = source.getMoveTargets(move, target);
      if (targets.length > 1)
        move.spreadHit = true;
      if (move.spreadHit && move.target === "allAdjacentFoes") {
        const spreadModifier = move.spreadModifier || 0.5;
        this.battle.debug(`Spread modifier: ${spreadModifier}`);
        damage = this.battle.modify(damage, spreadModifier);
      }
      if (!move.noDamageVariance && damage > 1) {
        damage *= this.battle.random(217, 256);
        damage = Math.floor(damage / 255);
      }
      if (basePower && !Math.floor(damage)) {
        return 1;
      }
      return damage;
    }
  }
};
//# sourceMappingURL=scripts.js.map
