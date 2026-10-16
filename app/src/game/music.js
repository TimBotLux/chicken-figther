// Musique synthétisée en direct (Web Audio), sans fichier : rock / funk des années 80
// pour la salle (PRD « Audio »), un thème nerveux pour les combats et un thème
// d'entrée plus sombre pour les champions.

const n2f = (n) => 440 * 2 ** ((n - 69) / 12);
const MIN = [0, 3, 7, 12];
const MAJ = [0, 4, 7, 12];
const _ = null;

// Chaque morceau : tempo, accords (fondamentale MIDI + type), motifs sur 16 doubles-croches.
const TRACKS = {
  // Menu et carte : groove funk en mi mineur.
  menu: {
    bpm: 104, swing: 0.12,
    chords: [[40, MIN], [40, MIN], [43, MAJ], [45, MIN]],
    bass: [0, _, 12, _, _, 0, _, 10, _, 0, _, 12, _, 7, 10, _],
    kick: 'x.....x...x.....',
    snare: '....x.......x...',
    hat: 'xxxxxxxxxxxxxxxx',
    stab: '...x..x....x..x.',
    lead: null,
    leadWave: 'square', stabWave: 'sawtooth',
  },
  // Salle : rock d'entraînement années 80, ut mineur, basse en croches.
  salle: {
    bpm: 118, swing: 0,
    chords: [[36, MIN], [32, MAJ], [34, MAJ], [36, MIN]],
    bass: [0, _, 0, _, 0, _, 0, 12, 0, _, 0, _, 0, _, 7, 10],
    kick: 'x...x...x...x...',
    snare: '....x.......x..x',
    hat: 'x.x.x.x.x.x.x.x.',
    stab: 'x.......x.....x.',
    lead: [12, _, 15, _, 19, _, 15, _, 24, _, 19, _, 15, _, 12, _],
    leadWave: 'sawtooth', stabWave: 'square',
  },
  // Combat : ré mineur, rapide et pulsé.
  combat: {
    bpm: 140, swing: 0,
    chords: [[38, MIN], [38, MIN], [41, MAJ], [36, MAJ]],
    bass: [0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 12, 0, 10, _, 7, _],
    kick: 'x...x...x...x...',
    snare: '....x.......x...',
    hat: 'xxxxxxxxxxxxxxxx',
    stab: null,
    lead: [0, 7, 12, 7, 3, 7, 12, 15, 0, 7, 12, 7, 15, 12, 7, 3],
    leadWave: 'square', stabWave: 'square',
  },
  // Champions : mi phrygien, lourd et menaçant (« ゴゴゴ »).
  boss: {
    bpm: 150, swing: 0,
    chords: [[40, MIN], [41, MAJ], [40, MIN], [38, MIN]],
    bass: [0, 0, 0, 1, 0, 0, 12, 0, 0, 0, 0, 1, 0, 13, 12, 1],
    kick: 'x.x.x...x.x.x..x',
    snare: '....x.......x.x.',
    hat: 'x.xxx.xxx.xxx.xx',
    stab: 'x.......x.......',
    lead: [12, _, 13, _, 12, _, 7, _, 12, _, 13, _, 16, 15, 13, 12],
    leadWave: 'sawtooth', stabWave: 'sawtooth',
  },
};

let ctx = null;
let master = null;
let current = null;
let wanted = null;
let enabled = true;
let volume = 0.5;
let timer = null;
let step = 0;
let nextTime = 0;
let noiseBuf = null;

function ensureCtx() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
  master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);
  const len = ctx.sampleRate * 0.5;
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

function voice(t, freq, dur, { type = 'square', vol = 0.2, cutoff = 2400, detune = 0 } = {}) {
  const o = ctx.createOscillator();
  const f = ctx.createBiquadFilter();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  o.detune.value = detune;
  f.type = 'lowpass';
  f.frequency.setValueAtTime(cutoff, t);
  f.frequency.exponentialRampToValueAtTime(Math.max(200, cutoff * 0.3), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function kick(t) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(0.9, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.25);
}

function noiseHit(t, { dur, vol, hp }) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = hp;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  s.connect(f).connect(g).connect(master);
  s.start(t);
  s.stop(t + dur + 0.02);
}

function schedule(tr, s, t) {
  const sixteenth = 60 / tr.bpm / 4;
  const bar = Math.floor(s / 16) % tr.chords.length;
  const i = s % 16;
  const [root, chord] = tr.chords[bar];
  if (tr.kick[i] === 'x') kick(t);
  if (tr.snare[i] === 'x') { noiseHit(t, { dur: 0.16, vol: 0.45, hp: 1200 }); voice(t, 190, 0.08, { type: 'triangle', vol: 0.25, cutoff: 900 }); }
  if (tr.hat[i] === 'x') noiseHit(t, { dur: i % 4 === 2 ? 0.07 : 0.03, vol: i % 4 === 2 ? 0.16 : 0.09, hp: 7000 });
  const b = tr.bass[i];
  if (b !== null) voice(t, n2f(root + b), sixteenth * 1.6, { type: 'sawtooth', vol: 0.32, cutoff: 900 });
  if (tr.stab?.[i] === 'x') {
    for (const iv of chord.slice(0, 3)) voice(t, n2f(root + 24 + iv), sixteenth * 1.4, { type: tr.stabWave, vol: 0.07, cutoff: 3200, detune: 6 });
  }
  if (tr.lead) {
    const l = tr.lead[i];
    if (l !== null) {
      // Adapte l'arpège à l'accord du moment (tierce majeure ou mineure).
      const fix = chord === MAJ && (l % 12 === 3) ? 1 : 0;
      voice(t, n2f(root + 24 + l + fix), sixteenth * 0.9, { type: tr.leadWave, vol: 0.07, cutoff: 4000 });
    }
  }
}

function tick() {
  if (!ctx || !current) return;
  const tr = TRACKS[current];
  const sixteenth = 60 / tr.bpm / 4;
  while (nextTime < ctx.currentTime + 0.12) {
    const sw = step % 2 === 1 ? sixteenth * tr.swing : 0;
    schedule(tr, step, nextTime + sw);
    nextTime += sixteenth;
    step += 1;
  }
}

function fadeTo(v, sec = 0.4) {
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(v, t + sec);
}

function apply() {
  if (!enabled || !wanted || document.hidden) {
    if (ctx) fadeTo(0, 0.3);
    return;
  }
  if (!ensureCtx()) return;
  if (ctx.state === 'suspended') ctx.resume();
  if (current !== wanted) {
    current = wanted;
    step = 0;
    nextTime = ctx.currentTime + 0.15;
  }
  fadeTo(0.22 * volume, 0.6);
  if (!timer) timer = setInterval(tick, 25);
}

// Choisit le morceau à jouer (null pour couper).
export function playTrack(name) {
  wanted = name;
  apply();
}

export function setMusic(on, vol) {
  enabled = on;
  if (vol !== undefined) volume = vol;
  apply();
}

// Les navigateurs exigent un geste de l'utilisateur avant de produire du son.
if (typeof window !== 'undefined') {
  const unlock = () => apply();
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  document.addEventListener('visibilitychange', apply);
}
