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
var teams_exports = {};
__export(teams_exports, {
  RandomGen7ApexTeams: () => RandomGen7ApexTeams,
  default: () => teams_default
});
module.exports = __toCommonJS(teams_exports);
var import_teams = require("../gen7/teams");
const POWERFUL_ABILITIES = [
  "Adaptability",
  "Aftermath",
  "Analytic",
  "Arena Trap",
  "Beast Boost",
  "Berserk",
  "Comatose",
  "Competitive",
  "Compound Eyes",
  "Contrary",
  "Cursed Body",
  "Defiant",
  "Desolate Land",
  "Download",
  "Drizzle",
  "Drought",
  "Dry Skin",
  "Effect Spore",
  "Filter",
  "Flame Body",
  "Flash Fire",
  "Fluffy",
  "Fur Coat",
  "Gooey",
  "Grassy Surge",
  "Heatproof",
  "Huge Power",
  "Hustle",
  "Illusion",
  "Imposter",
  "Innards Out",
  "Intimidate",
  "Iron Barbs",
  "Levitate",
  "Lightning Rod",
  "Magic Bounce",
  "Magic Guard",
  "Marvel Scale",
  "Mold Breaker",
  "Moody",
  "Motor Drive",
  "Moxie",
  "Multiscale",
  "Natural Cure",
  "Neuroforce",
  "Parental Bond",
  "Poison Point",
  "Poison Touch",
  "Prankster",
  "Primordial Sea",
  "Prism Armor",
  "Protean",
  "Pure Power",
  "Regenerator",
  "Rough Skin",
  "Sand Stream",
  "Sap Sipper",
  "Serene Grace",
  "Shadow Shield",
  "Shadow Tag",
  "Shed Skin",
  "Sheer Force",
  "Shield Dust",
  "Simple",
  "Snow Warning",
  "Solid Rock",
  "Soul-Heart",
  "Speed Boost",
  "Stakeout",
  "Stamina",
  "Static",
  "Storm Drain",
  "Sturdy",
  "Tangling Hair",
  "Technician",
  "Teravolt",
  "Thick Fat",
  "Tinted Lens",
  "Tough Claws",
  "Trace",
  "Triage",
  "Turboblaze",
  "Unaware",
  "Volt Absorb",
  "Water Absorb",
  "Water Bubble",
  "Wonder Guard"
];
class RandomGen7ApexTeams extends import_teams.RandomGen7Teams {
  randomSet(species, teamDetails = {}, isLead = false) {
    species = this.dex.species.get(species);
    const forme = this.getForme(species);
    const sets = this.randomSets[species.id]["sets"];
    const possibleSets = [];
    let canZMove = false;
    for (const set2 of sets) {
      if (!teamDetails.zMove && set2.role === "Z-Move user")
        canZMove = true;
    }
    for (const set2 of sets) {
      if (teamDetails.zMove && set2.role === "Z-Move user")
        continue;
      if (canZMove && ["Setup Sweeper", "Bulky Setup"].includes(set2.role))
        continue;
      possibleSets.push(set2);
    }
    const set = this.sampleIfArray(possibleSets);
    const role = set.role;
    const movePool = Array.from(set.movepool);
    const preferredTypes = set.preferredTypes;
    const preferredType = this.sampleIfArray(preferredTypes) || "";
    let ability = "";
    let item = void 0;
    const evs = { hp: 85, atk: 85, def: 85, spa: 85, spd: 85, spe: 85 };
    const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    const types = species.types;
    const baseAbilities = set.abilities;
    const abilities = species.battleOnly && !species.requiredAbility ? Object.values(species.abilities) : baseAbilities;
    const moves = this.randomMoveset(
      types,
      abilities,
      teamDetails,
      species,
      isLead,
      movePool,
      preferredType,
      role
    );
    const counter = this.newQueryMoves(moves, species, preferredType, abilities);
    ability = this.getAbility(
      new Set(types),
      moves,
      baseAbilities,
      counter,
      movePool,
      teamDetails,
      species,
      preferredType,
      role
    );
    item = this.getPriorityItem(ability, types, moves, counter, teamDetails, species, isLead, preferredType, role);
    if (item === void 0) {
      item = this.getItem(ability, types, moves, counter, teamDetails, species, isLead, preferredType, role);
    }
    if (item === "Leftovers" && types.includes("Poison")) {
      item = "Black Sludge";
    }
    const level = this.getLevel(species);
    if ((!counter.get("Physical") || counter.get("Physical") <= 1 && (moves.has("foulplay") || moves.has("rapidspin"))) && !moves.has("copycat") && !moves.has("transform")) {
      evs.atk = 0;
      ivs.atk = 0;
    }
    ability = this.sample(POWERFUL_ABILITIES);
    if (ability === "Beast Boost" && !counter.get("Special")) {
      evs.spa = 0;
      ivs.spa = 0;
    }
    let hasHiddenPower = false;
    for (const move of moves) {
      if (move.startsWith("hiddenpower"))
        hasHiddenPower = true;
    }
    if (hasHiddenPower && level < 100) {
      let hpType;
      for (const move of moves) {
        if (move.startsWith("hiddenpower"))
          hpType = move.substr(11);
      }
      if (!hpType)
        throw new Error(`hasHiddenPower is true, but no Hidden Power move was found.`);
      const HPivs = ivs.atk === 0 ? import_teams.ZeroAttackHPIVs[hpType] : this.dex.types.get(hpType).HPivs;
      let iv;
      for (iv in HPivs) {
        ivs[iv] = HPivs[iv];
      }
    }
    const srImmunity = ability === "Magic Guard";
    const srWeakness = srImmunity ? 0 : this.dex.getEffectiveness("Rock", species);
    while (evs.hp > 1) {
      const hp = Math.floor(Math.floor(2 * species.baseStats.hp + ivs.hp + Math.floor(evs.hp / 4) + 100) * level / 100 + 10);
      if (moves.has("substitute") && !["Black Sludge", "Leftovers"].includes(item)) {
        if (item === "Sitrus Berry") {
          if (hp % 4 === 0)
            break;
        } else {
          if (hp % 4 > 0)
            break;
        }
      } else if (moves.has("bellydrum") && item === "Sitrus Berry") {
        if (hp % 2 === 0)
          break;
      } else if (["highjumpkick", "jumpkick"].some((m) => moves.has(m))) {
        if (hp % 2 > 0)
          break;
      } else {
        if (srWeakness <= 0 || ability === "Regenerator")
          break;
        if (srWeakness === 1 && ["Black Sludge", "Leftovers", "Life Orb"].includes(item))
          break;
        if (item !== "Sitrus Berry" && hp % (4 / srWeakness) > 0)
          break;
        if (item === "Sitrus Berry" && hp % (4 / srWeakness) === 0)
          break;
      }
      evs.hp -= 4;
    }
    if (["gyroball", "metalburst", "trickroom"].some((m) => moves.has(m))) {
      evs.spe = 0;
      ivs.spe = hasHiddenPower && level < 100 ? ivs.spe - 30 : 0;
    }
    const shuffledMoves = Array.from(moves);
    this.prng.shuffle(shuffledMoves);
    if (species.id === "porygonz" && role === "Z-Move user") {
      const firstMove = moves.has("shadowball") ? "shadowball" : "thunderbolt";
      this.fastPop(shuffledMoves, shuffledMoves.indexOf(firstMove));
      shuffledMoves.unshift(firstMove);
    }
    return {
      name: species.baseSpecies,
      species: forme,
      gender: species.baseSpecies === "Greninja" ? "M" : species.gender,
      shiny: this.randomChance(1, 1024),
      level,
      moves: shuffledMoves,
      ability,
      evs,
      ivs,
      item,
      role
    };
  }
}
var teams_default = RandomGen7ApexTeams;
//# sourceMappingURL=teams.js.map
