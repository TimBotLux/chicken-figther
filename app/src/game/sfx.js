// Petits sons synthétisés (pas de fichiers audio) : impacts cartoon, télégraphes, cloche.
let ctx = null;
let enabled = true;

export const setSoundEnabled = (on) => { enabled = on; };

const ac = () => {
  if (!enabled) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
};

function tone(freq, dur, { type = 'square', vol = 0.12, slide = 0, delay = 0 } = {}) {
  const c = ac();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, vol = 0.25, filter = 1200) {
  const c = ac();
  if (!c) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = c.createBufferSource();
  s.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = filter;
  const g = c.createGain();
  g.gain.value = vol;
  s.connect(f).connect(g).connect(c.destination);
  s.start();
}

export const sfx = {
  hit: () => { noise(0.12, 0.35, 900); tone(140, 0.1, { type: 'sine', vol: 0.2, slide: -80 }); },
  bigHit: () => { noise(0.25, 0.45, 700); tone(110, 0.25, { type: 'sine', vol: 0.3, slide: -70 }); },
  block: () => { noise(0.06, 0.2, 3000); tone(420, 0.05, { vol: 0.06 }); },
  whiff: () => noise(0.08, 0.08, 4000),
  telegraph: () => tone(520, 0.12, { vol: 0.07, slide: 300 }),
  perfect: () => { tone(880, 0.09, { type: 'triangle', vol: 0.14 }); tone(1320, 0.14, { type: 'triangle', vol: 0.12, delay: 0.07 }); },
  bell: () => { tone(1250, 0.6, { type: 'sine', vol: 0.15 }); tone(1870, 0.5, { type: 'sine', vol: 0.06 }); },
  ok: () => tone(660, 0.07, { type: 'triangle', vol: 0.1 }),
  good: () => { tone(660, 0.06, { type: 'triangle', vol: 0.1 }); tone(990, 0.08, { type: 'triangle', vol: 0.1, delay: 0.05 }); },
  miss: () => tone(160, 0.15, { type: 'sawtooth', vol: 0.06, slide: -60 }),
  special: () => { tone(300, 0.35, { vol: 0.12, slide: 900 }); noise(0.3, 0.4, 1500); },
  tired: () => tone(200, 0.2, { type: 'triangle', vol: 0.08, slide: -100 }),
  click: () => tone(900, 0.03, { type: 'triangle', vol: 0.06 }),
};

export const vibrate = (ms, on) => {
  if (!on) return;
  try { navigator.vibrate?.(ms); } catch { /* non supporté */ }
};
