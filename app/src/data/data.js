// Données de jeu (PRD v2.3). Valeurs d'équilibrage indicatives, regroupées ici
// pour rester éditables comme le seraient les ScriptableObjects / JSON du PRD.

export const STATS = [
  { key: 'force', name: 'Force', color: 'var(--accent)', effect: 'Dégâts des coups' },
  { key: 'vitesse', name: 'Vitesse', color: 'var(--cyan)', effect: 'Vitesse des coups et des esquives' },
  { key: 'endurance', name: 'Endurance', color: 'var(--lime)', effect: "Taille et récupération de la barre d'endurance" },
  { key: 'resistance', name: 'Résistance', color: 'var(--accent)', effect: 'Réduction des dégâts, résistance au KO' },
  { key: 'technique', name: 'Technique', color: 'var(--cyan)', effect: 'Fenêtre de contre plus large, coups critiques' },
];

// 5 paliers de morphologie : total des 5 statistiques (indicatif).
export const PALIERS = [
  { n: 1, name: 'Maigrichon', min: 0 },
  { n: 2, name: 'Sec', min: 40 },
  { n: 3, name: 'Athlétique', min: 80 },
  { n: 4, name: 'Musclé', min: 140 },
  { n: 5, name: 'Bodybuildé', min: 220 },
];

// Catégories : limites de la boxe pro, fourchette de pesée dans le jeu.
export const CATEGORIES = [
  { id: 'mouche', name: 'Poids mouche', short: 'POIDS MOUCHE', kg: '≤ 50,8 KG', min: 49.0, max: 50.8, scaleMin: 47, scaleMax: 53, belt: 'Ceinture de Grain', beltColor: '#C9A227', mvp: true, opponents: ['souris', 'moineau', 'hamster', 'rat'], primeMult: 1 },
  { id: 'plume', name: 'Poids plume', short: 'POIDS PLUME', kg: '≤ 57,2 KG', min: 55.3, max: 57.2, scaleMin: 53.5, scaleMax: 59, belt: 'Ceinture de Plume', beltColor: '#FFFFFF', mvp: true, opponents: ['lapin', 'canard', 'ecureuil', 'cocorico'], primeMult: 1.5 },
  { id: 'leger', name: 'Poids léger', short: 'POIDS LÉGER', kg: '≤ 61,2 KG', min: 59.0, max: 61.2, belt: 'Ceinture de Paille', beltColor: '#E8C55A', mvp: false, preview: ['Chat', 'Belette', 'Raton laveur', 'Renard « Le Rusé »'] },
  { id: 'moyen', name: 'Poids moyen', short: 'POIDS MOYEN', kg: '≤ 72,6 KG', min: 69.9, max: 72.6, belt: 'Ceinture de Foin', beltColor: '#9DB36A', mvp: false, preview: ['Chien', 'Chèvre', 'Blaireau', 'Bouc « Têtu »'] },
  { id: 'milourd', name: 'Poids mi-lourd', short: 'MI-LOURD', kg: '≤ 79,4 KG', min: 76.2, max: 79.4, belt: 'Ceinture du Fer à cheval', beltColor: '#8E919B', mvp: false, preview: ['Lama', 'Sanglier', 'Loup', 'Kangourou « Rebond »'] },
  { id: 'lourd', name: 'Poids lourd', short: 'POIDS LOURD', kg: '+ 90,7 KG', min: 90.7, max: Infinity, belt: "Ceinture de l'Épi d'Or", beltColor: '#D4A100', mvp: false, preview: ['Ours', 'Gorille', 'Cheval de trait', 'Taureau « El Toro »'] },
];

// Attaques adverses. guard : garde qui bloque ; dodge : sens d'esquive valable.
// hookL vient de la gauche de l'écran → esquive à droite.
export const ATTACKS = {
  jab: { label: 'DIRECT', dmg: 6, guard: 'high', dodge: 'any', side: 'center', hint: 'Garde haute ou esquive' },
  hookL: { label: 'CROCHET', dmg: 9, guard: 'high', dodge: 'right', side: 'left', hint: 'Esquive à droite →' },
  hookR: { label: 'CROCHET', dmg: 9, guard: 'high', dodge: 'left', side: 'right', hint: '← Esquive à gauche' },
  body: { label: 'AU CORPS', dmg: 8, guard: 'low', dodge: 'any', side: 'center', hint: 'Garde basse ou esquive' },
  upper: { label: 'UPPERCUT', dmg: 11, guard: null, dodge: 'any', side: 'center', hint: 'Esquive ou recule !' },
  charge: { label: 'CHARGE', dmg: 14, guard: null, dodge: 'any', side: 'center', hint: 'Imparable : esquive !' },
};

// Adversaires du MVP (mouche et plume) + Coach Ergot pour le sparring guidé.
// tele : durée du télégraphe en ms (Normal) ; idle : attente entre deux attaques.
export const OPPONENTS = {
  coach: {
    id: 'coach', name: 'COACH ERGOT', short: 'Coach Ergot', look: 'coach', champion: false, rounds: 1,
    hp: 120, dmg: 0.4, tele: 900, idle: [1400, 2000], block: 0, combo: 0, getUps: 9, weight: 52.0, prime: 0, xp: 20, size: 1,
    attacks: { jab: 1 }, tip: "Regarde ses épaules : elles annoncent le coup.",
  },
  souris: {
    id: 'souris', name: 'SOURIS', short: 'la Souris', look: 'souris', champion: false, rounds: 3,
    hp: 230, dmg: 0.8, tele: 760, idle: [1100, 1900], block: 0.25, combo: 0.15, getUps: 1, weight: 49.6, prime: 80, xp: 40, size: 0.92,
    attacks: { jab: 3, hookL: 1, hookR: 1 }, signature: ['jab', 'jab', 'jab'], sigName: 'Rafale de couics',
    tip: 'Elle lance trois directs à la suite. Garde haute, puis riposte !',
  },
  moineau: {
    id: 'moineau', name: 'MOINEAU', short: 'le Moineau', look: 'moineau', champion: false, rounds: 3,
    hp: 260, dmg: 0.9, tele: 700, idle: [1000, 1700], block: 0.3, combo: 0.2, getUps: 1, weight: 50.1, prime: 100, xp: 50, size: 0.95,
    attacks: { jab: 2, hookL: 2, hookR: 2 }, signature: ['hookL', 'hookR'], sigName: 'Battement d’ailes',
    tip: 'Ses crochets arrivent par paires : gauche puis droite. Esquive des deux côtés.',
  },
  hamster: {
    id: 'hamster', name: 'HAMSTER', short: 'le Hamster', look: 'hamster', champion: false, rounds: 3,
    hp: 290, dmg: 1, tele: 680, idle: [1000, 1600], block: 0.35, combo: 0.2, getUps: 1, weight: 50.5, prime: 120, xp: 60, size: 1,
    attacks: { jab: 2, body: 3, hookL: 1, hookR: 1 }, signature: ['body', 'body', 'upper'], sigName: 'La roue infernale',
    tip: 'Il frappe au corps : garde basse. Après deux coups au corps, recule, l’uppercut arrive !',
  },
  rat: {
    id: 'rat', name: 'RAT « RATTRAPAGE »', short: 'Rat « Rattrapage »', look: 'rat', champion: true, rounds: 5,
    hp: 440, dmg: 1.1, tele: 600, idle: [800, 1400], block: 0.4, combo: 0.35, getUps: 2, weight: 50.7, prime: 250, xp: 120, size: 1,
    attacks: { jab: 2, hookL: 2, hookR: 2, body: 1, upper: 1 }, signature: ['hookL', 'hookR', 'hookL', 'upper'], sigName: 'Rattrapage express',
    tip: 'Il baisse sa garde après deux crochets. Esquive, puis contre !',
  },
  lapin: {
    id: 'lapin', name: 'LAPIN', short: 'le Lapin', look: 'lapin', champion: false, rounds: 3,
    hp: 340, dmg: 1.15, tele: 640, idle: [900, 1500], block: 0.35, combo: 0.25, getUps: 1, weight: 56.4, prime: 90, xp: 70, size: 1.05,
    attacks: { jab: 3, upper: 2, hookL: 1, hookR: 1 }, signature: ['jab', 'upper'], sigName: 'Bond lapin',
    tip: 'Il sautille avant son uppercut. La garde ne suffit pas : esquive ou recule.',
  },
  canard: {
    id: 'canard', name: 'CANARD', short: 'le Canard', look: 'canard', champion: false, rounds: 3,
    hp: 370, dmg: 1.2, tele: 620, idle: [900, 1500], block: 0.45, combo: 0.25, getUps: 1, weight: 56.8, prime: 110, xp: 80, size: 1.05,
    attacks: { jab: 2, body: 2, charge: 1, hookL: 1, hookR: 1 }, signature: ['body', 'charge'], sigName: 'Coin-coin bulldozer',
    tip: 'Sa charge est imparable. Quand il baisse la tête, esquive sur le côté.',
  },
  ecureuil: {
    id: 'ecureuil', name: 'ÉCUREUIL', short: "l'Écureuil", look: 'ecureuil', champion: false, rounds: 3,
    hp: 390, dmg: 1.2, tele: 560, idle: [700, 1300], block: 0.4, combo: 0.35, getUps: 1, weight: 57.0, prime: 130, xp: 90, size: 1.05,
    attacks: { jab: 2, hookL: 2, hookR: 2, upper: 1 }, signature: ['hookR', 'hookL', 'hookR'], sigName: 'Noisettes en rafale',
    tip: 'Très rapide mais il s’essouffle : après sa rafale, il reste ouvert.',
  },
  cocorico: {
    id: 'cocorico', name: 'COQ « COCORICO »', short: 'Coq « Cocorico »', look: 'cocorico', champion: true, rounds: 5,
    hp: 560, dmg: 1.3, tele: 540, idle: [700, 1200], block: 0.45, combo: 0.4, getUps: 2, weight: 57.1, prime: 260, xp: 160, size: 1.08,
    attacks: { jab: 2, hookL: 2, hookR: 2, body: 1, upper: 2 }, signature: ['jab', 'hookL', 'upper', 'hookR'], sigName: 'Miroir moqueur',
    tip: 'Il copie tes coups. Varie : feinte au corps, puis crochet.',
  },
};

export const MINIGAMES = [
  { id: 'bench', stat: 'force', title: 'DÉVELOPPÉ COUCHÉ', kind: 'Rythme', duration: 30, sfx: 'グッ', gloss: 'HAN !', color: 'var(--accent)', icon: 'M6 12h12M3 9v6M6 7v10M18 7v10M21 9v6', weight: (q) => 0.2 + 0.4 * q, help: 'Tape au moment où le disque passe sur la barre. Le rythme fait la force !' },
  { id: 'bag', stat: 'vitesse', title: 'SAC DE FRAPPE', kind: 'Séquences de gestes', duration: 30, sfx: 'バシッ', gloss: 'PAF !', color: 'var(--lime)', icon: 'M12 2v3M8 5h8v11a4 4 0 0 1-8 0z', weight: () => 0.1, help: 'Reproduis la séquence : tap, glisser ←, →, ↑. Plus vite, plus de points.' },
  { id: 'rope', stat: 'endurance', title: 'CORDE À SAUTER', kind: 'Timing', duration: 30, sfx: 'タッ', gloss: 'HOP !', color: 'var(--cyan)', icon: 'M5 3v6M19 3v6M5 9c0 11 14 11 14 0', weight: (q) => -(0.3 + 0.3 * q), help: 'Tape quand la corde passe sous les pattes. Fait aussi perdre du poids.' },
];

export const SHOP = [
  { id: 'gants', name: 'Gants rembourrés', price: 150, desc: '+5 % de dégâts sur chaque coup', kind: 'equip' },
  { id: 'short', name: 'Short de compétition', price: 120, desc: "+10 d'endurance maximale en combat", kind: 'equip' },
  { id: 'supplement', name: 'Shake protéiné', price: 40, desc: 'La prochaine séance rapporte +50 %', kind: 'conso' },
  { id: 'salle', name: 'Banc neuf pour la salle', price: 300, desc: '+1 séance « saine » par cycle (max 5)', kind: 'upgrade', max: 2 },
];

export const SKILLS = [
  { id: 'cogneur', name: 'Cogneur', perk: 'Poing lourd', desc: '+10 % de dégâts sur tous les coups' },
  { id: 'esquiveur', name: 'Esquiveur', perk: 'Réflexes de basse-cour', desc: "Fenêtre d'esquive parfaite +40 ms" },
  { id: 'contreur', name: 'Contreur', perk: 'Riposte éclair', desc: 'Fenêtre de contre +0,4 s et contres +25 %' },
];

export const DIFFICULTY = {
  facile: { label: 'Facile', tele: 1.4, dmg: 0.7, idle: 1.15, perfect: 200 },
  normal: { label: 'Normal', tele: 1, dmg: 1, idle: 1, perfect: 150 },
  difficile: { label: 'Difficile', tele: 0.75, dmg: 1.15, idle: 0.75, perfect: 110 },
};

export const ECONOMY = {
  startPrimes: 100,
  sessionCost: [30, 40],      // par catégorie (mouche, plume)
  healthySessions: 3,
  fatiguePerSession: 0.1,
  defeatPrimeRatio: 0.3,
  exhibitionPrime: 25,
  overweightFine: 0.5,
  overweightStamina: 0.15,
  underweightResistance: 0.15,
  simRatio: 0.7,
  maxGain: 4,
};
