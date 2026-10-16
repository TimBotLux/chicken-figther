import { CATEGORIES, OPPONENTS, PALIERS, ECONOMY, STATS } from '../data/data.js';

export const fmtKg = (w) => (w === Infinity ? '∞' : w.toFixed(1).replace('.', ','));

export const statTotal = (stats) => STATS.reduce((s, k) => s + Math.floor(stats[k.key]), 0);

export const palierOf = (stats) => {
  const t = statTotal(stats);
  let p = PALIERS[0];
  for (const x of PALIERS) if (t >= x.min) p = x;
  return p;
};

export const currentCategory = (g) => CATEGORIES[g.catIndex];

// Prochain adversaire de la catégorie en cours (null si la catégorie est bouclée).
export const nextOpponent = (g) => {
  const cat = currentCategory(g);
  if (!cat?.opponents) return null;
  const id = cat.opponents.find((o) => !g.beaten[o]);
  return id ? OPPONENTS[id] : null;
};

export const weighIn = (weight, cat) => {
  if (weight > cat.max) return 'lourd';
  if (weight < cat.min) return 'leger';
  return 'ok';
};

export const healthySessions = (g) => ECONOMY.healthySessions + (g.equipment.salle || 0);

export const sessionCost = (g) => (g.cycle.sessions === 0 ? 0 : ECONOMY.sessionCost[Math.min(g.catIndex, 1)]);

export const xpForLevel = (lvl) => 80 + (lvl - 1) * 60;

// Paie une séance (la 1re du cycle est gratuite) ; au-delà des séances saines : fatigue.
export function payForSession(g) {
  g.primes -= sessionCost(g);
  g.cycle.sessions += 1;
  if (g.cycle.sessions > healthySessions(g)) g.fatigue = Math.round((g.fatigue + ECONOMY.fatiguePerSession) * 100) / 100;
}

// Applique le gain d'une séance (quality ∈ [0, 1] ; simulation rapide = 70 %).
export function applySession(g, mg, quality) {
  const boost = g.supplementActive ? 1.5 : 1;
  const gain = Math.round(Math.max(0.3, ECONOMY.maxGain * quality) * boost * 10) / 10;
  const dw = Math.round(mg.weight(quality) * 10) / 10;
  g.stats[mg.stat] = Math.round((g.stats[mg.stat] + gain) * 10) / 10;
  g.weight = Math.round((g.weight + dw) * 10) / 10;
  if (g.supplementActive) { g.supplementActive = false; g.supplements -= 1; }
  if (quality >= 0.5) g.simUnlocked[mg.id] = true;
  return { gain, dw, boost: boost > 1 };
}

export const categoryOfOpponent = (id) => CATEGORIES.find((c) => c.opponents?.includes(id));
