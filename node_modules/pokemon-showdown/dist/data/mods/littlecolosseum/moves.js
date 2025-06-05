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
var moves_exports = {};
__export(moves_exports, {
  Moves: () => Moves
});
module.exports = __toCommonJS(moves_exports);
const Moves = {
  surginglava: {
    accuracy: true,
    basePower: 0,
    category: "Status",
    shortDesc: "Raises the user's SpA & Spe by 1 stage.",
    name: "Surging Lava",
    pp: 20,
    priority: 0,
    flags: { snatch: 1, metronome: 1 },
    onPrepareHit(target, source, move) {
      this.attrLastMove("[still]");
      this.add("-anim", source, "Morning Sun", target);
    },
    boosts: {
      spa: 1,
      spe: 1
    },
    secondary: null,
    target: "self",
    type: "Fire",
    zMove: { effect: "clearnegativeboost" },
    contestType: "Cool"
  },
  // Unedited moves
  stealthrock: {
    num: 446,
    accuracy: true,
    basePower: 0,
    category: "Status",
    name: "Stealth Rock",
    pp: 20,
    priority: 0,
    flags: { reflectable: 1, snatch: 1 },
    sideCondition: "stealthrock",
    condition: {
      // this is a side condition
      onSideStart(side) {
        this.add("-sidestart", side, "move: Stealth Rock");
      },
      onSwitchIn(pokemon) {
        if (pokemon.hasItem("heavydutyboots") || pokemon.hasAbility("magmaticentrance") || pokemon.hasAbility("hover"))
          return;
        const typeMod = this.clampIntRange(pokemon.runEffectiveness(this.dex.getActiveMove("stealthrock")), -6, 6);
        this.damage(pokemon.maxhp * 2 ** typeMod / 8);
      }
    },
    secondary: null,
    target: "foeSide",
    type: "Rock",
    zMove: { boost: { def: 1 } },
    contestType: "Cool"
  },
  spikes: {
    num: 191,
    accuracy: true,
    basePower: 0,
    category: "Status",
    name: "Spikes",
    pp: 20,
    priority: 0,
    flags: { reflectable: 1, nonsky: 1, mustpressure: 1, snatch: 1 },
    sideCondition: "spikes",
    condition: {
      // this is a side condition
      onSideStart(side) {
        this.add("-sidestart", side, "Spikes");
        this.effectState.layers = 1;
      },
      onSideRestart(side) {
        if (this.effectState.layers >= 3)
          return false;
        this.add("-sidestart", side, "Spikes");
        this.effectState.layers++;
      },
      onSwitchIn(pokemon) {
        if (!pokemon.isGrounded())
          return;
        if (pokemon.hasItem("heavydutyboots") || pokemon.hasAbility("magmaticentrance"))
          return;
        const damageAmounts = [0, 3, 4, 6];
        this.damage(damageAmounts[this.effectState.layers] * pokemon.maxhp / 24);
      }
    },
    secondary: null,
    target: "foeSide",
    type: "Ground",
    zMove: { boost: { def: 1 } },
    contestType: "Clever"
  }
};
//# sourceMappingURL=moves.js.map
