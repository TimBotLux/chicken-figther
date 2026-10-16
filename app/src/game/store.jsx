import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, ECONOMY, OPPONENTS, SHOP } from '../data/data.js';
import { categoryOfOpponent, palierOf, xpForLevel } from './rules.js';

const SETTINGS_KEY = 'cc.settings';
const SLOT_KEY = (n) => `cc.slot.${n}`;

export const DEFAULT_SETTINGS = {
  theme: 'auto', // auto | clair | sombre
  difficulty: 'normal',
  assist: false,
  gaucher: false,
  showZones: true,
  sound: true,
  music: true,
  fullscreen: true, // plein écran automatique sur téléphone
  musicVolume: 0.5,
  vibration: true,
  shake: true,
  latency: 0, // ms, mesurée par le calibrage
};

export const newGame = () => ({
  v: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  stats: { force: 6, vitesse: 8, endurance: 6, resistance: 5, technique: 4 },
  weight: 49.4,
  primes: ECONOMY.startPrimes,
  xp: 0,
  level: 1,
  skillPoints: 0,
  skills: {},
  reputation: 0,
  catIndex: 0,
  beaten: {},
  belts: [],
  cycle: { sessions: 0 },
  fatigue: 0,
  simUnlocked: {},
  equipment: { gants: false, short: false, salle: 0 },
  supplements: 0,
  supplementActive: false,
  palierSeen: 1,
  tutorialDone: false,
  fights: 0,
  pendingFight: null,
});

const read = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* stockage indisponible : la partie continue sans sauvegarde */
  }
};

export const readSlots = () => [1, 2, 3].map((n) => ({ n, game: read(SLOT_KEY(n), null) }));

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);

export function GameProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...read(SETTINGS_KEY, {}) }));
  const [slot, setSlot] = useState(null);
  const [game, setGame] = useState(null);
  const [route, setRoute] = useState({ name: 'title' });
  const [modal, setModal] = useState(null);
  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => write(SETTINGS_KEY, settings), [settings]);
  useEffect(() => {
    if (slot && game) write(SLOT_KEY(slot), { ...game, updatedAt: Date.now() });
  }, [slot, game]);

  const update = useCallback((fn) => {
    setGame((g) => {
      const next = structuredClone(g);
      fn(next);
      return next;
    });
  }, []);

  const go = useCallback((name, params = {}) => setRoute({ name, ...params }), []);

  const loadSlot = useCallback((n) => {
    let g = read(SLOT_KEY(n), null);
    if (!g) g = newGame();
    else g = { ...newGame(), ...g };
    setSlot(n);
    setGame(g);
    setRoute(g.tutorialDone ? { name: 'carte' } : { name: 'tuto' });
  }, []);

  const deleteSlot = useCallback((n) => write(SLOT_KEY(n), null), []);

  // Applique l'issue d'un combat et renvoie le résumé affiché à l'écran de résultat.
  const resolveFight = useCallback((r) => {
    const g = structuredClone(gameRef.current);
    {
      const opp = OPPONENTS[r.oppId];
      const cat = categoryOfOpponent(opp.id) || CATEGORIES[0];
      const palierBefore = palierOf(g.stats).n;
      const lines = [];
      let prime = 0;
      if (r.exhibition) {
        prime = r.win ? ECONOMY.exhibitionPrime : Math.round(ECONOMY.exhibitionPrime * ECONOMY.defeatPrimeRatio);
        lines.push([`Prime d'exhibition${r.win ? '' : ' (défaite)'}`, prime]);
      } else {
        const base = Math.round(opp.prime * (cat.primeMult || 1));
        prime = r.win ? base : Math.round(base * ECONOMY.defeatPrimeRatio);
        lines.push([r.win ? 'Prime de victoire' : 'Prime réduite (30 %)', prime]);
      }
      if (r.weigh === 'lourd') {
        const fine = -Math.round(prime * ECONOMY.overweightFine);
        lines.push(['Amende de pesée (−50 %)', fine]);
        prime += fine;
      }
      const xp = Math.round(opp.xp * (r.win ? 1 : 0.5) * (r.exhibition ? 0.4 : 1));
      g.primes += prime;
      g.xp += xp;
      let levelUps = 0;
      while (g.xp >= xpForLevel(g.level)) {
        g.xp -= xpForLevel(g.level);
        g.level += 1;
        g.skillPoints += 1;
        levelUps += 1;
      }
      // L'expérience du ring fait progresser résistance et technique (mini-jeux hors MVP).
      const ringGain = { resistance: r.win ? 1.5 : 1, technique: 0.5 + Math.min(1.5, (r.perfect || 0) * 0.25) };
      g.stats.resistance += ringGain.resistance;
      g.stats.technique += ringGain.technique;
      // Un combat recharge l'énergie de la salle et efface la fatigue.
      g.cycle = { sessions: 0 };
      g.fatigue = 0;
      g.fights += 1;
      g.pendingFight = null;
      let belt = null;
      let unlocked = null;
      if (r.win && !r.exhibition) {
        g.reputation += opp.champion ? 60 : 15;
        g.beaten[opp.id] = true;
        if (opp.champion) {
          belt = cat;
          if (!g.belts.includes(cat.id)) g.belts.push(cat.id);
          const nextCat = CATEGORIES[g.catIndex + 1];
          if (nextCat) {
            g.catIndex += 1;
            unlocked = nextCat;
          }
        }
      }
      const palierAfter = palierOf(g.stats).n;
      if (palierAfter > g.palierSeen) {
        // Prendre du muscle fait prendre du poids.
        g.weight += 1.5 * (palierAfter - g.palierSeen);
      }
      const newPalier = palierAfter > g.palierSeen ? palierAfter : null;
      g.palierSeen = Math.max(g.palierSeen, palierAfter);
      gameRef.current = g;
      setGame(g);
      return { ...r, opp, prime, lines, xp, levelUps, ringGain, belt, unlocked, newPalier, palierBefore };
    }
  }, []);

  const buy = useCallback((id) => {
    const item = SHOP.find((s) => s.id === id);
    update((g) => {
      if (g.primes < item.price) return;
      if (item.kind === 'equip') {
        if (g.equipment[id]) return;
        g.equipment[id] = true;
      } else if (item.kind === 'upgrade') {
        if ((g.equipment.salle || 0) >= item.max) return;
        g.equipment.salle = (g.equipment.salle || 0) + 1;
      } else {
        g.supplements += 1;
      }
      g.primes -= item.price;
    });
  }, [update]);

  const value = useMemo(
    () => ({ settings, setSettings, slot, game, update, route, go, modal, setModal, loadSlot, deleteSlot, resolveFight, buy, setGame, setSlot }),
    [settings, slot, game, update, route, go, modal, loadSlot, deleteSlot, resolveFight, buy],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
