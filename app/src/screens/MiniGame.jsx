import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/store.jsx';
import { MINIGAMES, STATS } from '../data/data.js';
import { applySession, palierOf } from '../game/rules.js';
import Poulet from '../components/Poulet.jsx';
import { Coach } from '../components/Characters.jsx';
import { Burst, Popups, usePopups, useRaf } from '../components/Ui.jsx';
import { sfx } from '../game/sfx.js';

// Convertit les coordonnées écran en coordonnées de la scène 844×390.
const stageScale = () => Number(document.querySelector('.stage')?.dataset.scale || 1);

// ---------------------------------------------------------------- Développé couché
function Bench({ active, score, pop, latency, palier }) {
  const t = useRef(0);
  const notes = useRef([]);
  const nextSpawn = useRef(600);
  const [, force] = useState(0);
  const lift = useRef(-9999);
  const failAt = useRef(-9999);
  const TRAVEL = 1500;
  const LINE = 170;

  const judge = () => {
    const now = t.current;
    let best = null;
    for (const n of notes.current) {
      if (n.done) continue;
      const d = Math.abs(now - n.at);
      if (d <= 210 + latency && (!best || d < Math.abs(now - best.at))) best = n;
    }
    if (!best) { sfx.miss(); failAt.current = now; score.current.misses += 1; pop({ text: 'ラ!', sub: 'trop tôt', x: 120, y: 120, size: 26, color: 'var(--cyan)' }); return; }
    const d = Math.abs(now - best.at) - latency * 0.5;
    best.done = true;
    if (d <= 70) { score.current.perfect += 1; sfx.good(); pop({ text: 'グッ！', sub: 'PARFAIT', x: 110, y: 90, color: 'var(--accent)' }); }
    else if (d <= 150) { score.current.good += 1; sfx.ok(); pop({ text: 'BIEN', x: 120, y: 100, size: 28, color: 'var(--lime)' }); }
    else { score.current.misses += 1; failAt.current = now; sfx.miss(); pop({ text: 'RATÉ', x: 120, y: 100, size: 24, color: 'var(--cyan)' }); }
    lift.current = now;
  };

  useRaf((dt) => {
    t.current += dt;
    const elapsed = t.current;
    const interval = Math.max(560, 900 - elapsed / 120);
    if (elapsed >= nextSpawn.current) {
      notes.current.push({ id: elapsed, at: elapsed + TRAVEL, done: false });
      nextSpawn.current += interval * (Math.random() < 0.2 ? 0.5 : 1);
    }
    for (const n of notes.current) {
      if (!n.done && elapsed > n.at + 220) { n.done = true; n.missed = true; score.current.misses += 1; failAt.current = elapsed; }
    }
    notes.current = notes.current.filter((n) => elapsed < n.at + 400);
    score.current.total = score.current.perfect + score.current.good + score.current.misses;
    score.current.quality = score.current.total ? (score.current.perfect + 0.6 * score.current.good) / Math.max(score.current.total, 20) : 0;
    force((x) => x + 1);
  }, active);

  useEffect(() => {
    if (!active) return undefined;
    const k = (e) => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); judge(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  // Le coq pousse la barre à chaque note réussie, puis la redescend sur la poitrine.
  const since = t.current - lift.current;
  const push = since < 140 ? since / 140 : since < 420 ? 1 - (since - 140) / 280 : 0;
  const gy = -95 - 60 * push; // hauteur des gants (unités du dessin)
  const wobble = t.current - failAt.current < 300 ? Math.sin(t.current / 30) * 8 : 0;
  const hands = { l: { x: 14, y: gy, r: wobble }, r: { x: -14, y: gy, r: -wobble } };
  const barTop = (240 + gy) * (170 / 300) - 8;
  return (
    <div style={{ position: 'absolute', inset: 0 }} onPointerDown={() => active && judge()}>
      <div style={{ position: 'absolute', left: 20, top: 90, width: 140, height: 180, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', transform: `scaleY(${1 - 0.03 * push})`, transformOrigin: '50% 100%', animation: push ? 'none' : 'bob 1.4s ease-in-out infinite' }}>
          <Poulet palier={palier} size={170} fist={hands} />
          <div aria-hidden="true" style={{ position: 'absolute', left: -24, right: -24, top: barTop, height: 12, background: 'var(--ink)', transform: `rotate(${wobble}deg)` }}>
            <div style={{ position: 'absolute', left: -6, top: -22, width: 20, height: 56, background: 'var(--accent)', border: '3px solid var(--ink)' }} />
            <div style={{ position: 'absolute', right: -6, top: -22, width: 20, height: 56, background: 'var(--accent)', border: '3px solid var(--ink)' }} />
          </div>
        </div>
      </div>
      <div className="box tone-accent" style={{ position: 'absolute', left: 140, right: 30, top: 150, height: 70 }} />
      <div style={{ position: 'absolute', left: LINE - 28, top: 140, width: 56, height: 90, border: '4px solid var(--ink)', background: 'var(--lime)', opacity: 0.85 }} />
      <div className="t" style={{ position: 'absolute', left: LINE - 40, top: 236, width: 80, textAlign: 'center', fontSize: 12 }}>TAPE ICI !</div>
      {notes.current.map((n) => {
        const x = LINE + ((n.at - t.current) / TRAVEL) * 600;
        return (
          <div key={n.id} style={{ position: 'absolute', left: x - 26, top: 159, width: 52, height: 52, borderRadius: '50%', border: '4px solid var(--ink)', background: n.done ? (n.missed ? 'var(--panel)' : 'var(--lime)') : 'var(--accent)', opacity: n.done ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--ink)' }} />
          </div>
        );
      })}
      <div className="t" style={{ position: 'absolute', right: 30, top: 236, fontSize: 14 }}>
        PARFAIT {score.current.perfect} · BIEN {score.current.good} · RATÉ {score.current.misses}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Sac de frappe
const GESTURES = { tap: '●', left: '←', right: '→', up: '↑' };
const randSeq = (n) => Array.from({ length: n }, () => Object.keys(GESTURES)[Math.floor(Math.random() * 4)]);

function Bag({ active, score, pop, palier }) {
  const [seq, setSeq] = useState(() => randSeq(3));
  const [idx, setIdx] = useState(0);
  const [hitAt, setHitAt] = useState(0);
  const [move, setMove] = useState({ g: null, at: 0, n: 0, err: false });
  const [, redraw] = useState(0);
  useEffect(() => {
    if (!move.g) return undefined;
    const tm = setTimeout(() => redraw((x) => x + 1), 210);
    return () => clearTimeout(tm);
  }, [move]);
  const done = useRef(0);
  const start = useRef(null);

  const input = (g) => {
    if (!active) return;
    if (g === seq[idx]) {
      sfx.hit();
      setHitAt(performance.now());
      setMove((m) => ({ g, at: performance.now(), n: m.n + 1, err: false }));
      score.current.gestures += 1;
      if (idx + 1 >= seq.length) {
        done.current += 1;
        sfx.good();
        pop({ text: 'バシッ！', sub: `SÉQUENCE ×${done.current}`, x: 470, y: 60, color: 'var(--lime)' });
        setSeq(randSeq(Math.min(6, 3 + Math.floor(done.current / 2))));
        setIdx(0);
      } else setIdx(idx + 1);
    } else {
      sfx.miss();
      setMove((m) => ({ g, at: performance.now(), n: m.n + 1, err: true }));
      score.current.errors += 1;
      pop({ text: 'OUPS', x: 560, y: 120, size: 26, color: 'var(--cyan)' });
      setIdx(0);
    }
    score.current.quality = Math.min(1, Math.max(0, score.current.gestures - score.current.errors * 2) / 20);
  };

  useEffect(() => {
    if (!active) return undefined;
    const k = (e) => {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', Space: 'tap', Enter: 'tap' };
      if (map[e.code]) { e.preventDefault(); input(map[e.code]); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const down = (e) => { start.current = { x: e.clientX, y: e.clientY }; };
  const up = (e) => {
    if (!start.current) return;
    const s = stageScale();
    const dx = (e.clientX - start.current.x) / s;
    const dy = (e.clientY - start.current.y) / s;
    start.current = null;
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) input('tap');
    else if (Math.abs(dx) > Math.abs(dy)) input(dx < 0 ? 'left' : 'right');
    else if (dy < 0) input('up');
  };

  const swing = performance.now() - hitAt < 180;
  // Gants : garde haute au repos ; jab alterné, crochets et uppercut vers le sac (à droite).
  const striking = move.g && performance.now() - move.at < 200;
  const G = (x, y, r = 0, k = 1) => ({ x, y, r, k });
  let hands = { l: G(22, -112), r: G(-6, -118) };
  if (striking && !move.err) {
    if (move.g === 'tap') hands = move.n % 2 ? { ...hands, r: G(70, -70, 0, 0.92) } : { ...hands, l: G(118, -78, 0, 0.92) };
    if (move.g === 'right') hands = { ...hands, r: G(66, -88, 40) };
    if (move.g === 'left') hands = { ...hands, l: G(126, -90, -35) };
    if (move.g === 'up') hands = { ...hands, r: G(58, -128, -25) };
  }
  const body = striking ? (move.err ? 'rotate(-6deg)' : 'translateX(10px) rotate(4deg)') : 'none';
  return (
    <div style={{ position: 'absolute', inset: 0 }} onPointerDown={down} onPointerUp={up}>
      <div style={{ position: 'absolute', left: 300, top: 40, width: 4, height: 40, background: 'var(--ink)' }} />
      <div style={{ position: 'absolute', left: 262, top: 76, width: 80, height: 170, borderRadius: '18px 18px 30px 30px', border: '4px solid var(--ink)', background: 'var(--accent)', transformOrigin: '50% -40px', transform: `rotate(${swing ? 8 : 0}deg)`, transition: 'transform 0.1s' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 40, height: 10, background: 'var(--ink)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, height: 10, background: 'var(--ink)' }} />
      </div>
      <div style={{ position: 'absolute', left: 110, top: 100, transform: body, transformOrigin: '50% 100%', transition: 'transform 90ms', animation: striking ? 'none' : 'bob 0.9s ease-in-out infinite' }}><Poulet palier={palier} size={190} fist={hands} /></div>
      <div style={{ position: 'absolute', left: 420, top: 110, display: 'flex', gap: 8 }}>
        {seq.map((g, i) => (
          <div key={i} className="t" style={{ width: 54, height: 54, border: '4px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: i < idx ? 'var(--lime)' : i === idx ? 'var(--panel)' : 'var(--panel)', color: i < idx ? '#111' : 'var(--ink)', boxShadow: i === idx ? '4px 4px 0 var(--accent)' : 'none', transform: i === idx ? 'translateY(-6px)' : 'none' }}>
            {GESTURES[g]}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 420, top: 186, fontSize: 13, lineHeight: 1.4 }}>
        ● tap · ← → glisser sur le côté · ↑ glisser vers le haut<br />
        Clavier : espace, flèches
      </div>
      <div className="t" style={{ position: 'absolute', right: 30, top: 236, fontSize: 14 }}>GESTES {score.current.gestures} · ERREURS {score.current.errors}</div>
    </div>
  );
}

// ---------------------------------------------------------------- Corde à sauter
function Rope({ active, score, pop, latency, palier }) {
  const t = useRef(0);
  const period = useRef(1150);
  const phaseStart = useRef(400);
  const pauseUntil = useRef(0);
  const jumpAt = useRef(-1000);
  const jumpKind = useRef('simple');
  const judgedCycle = useRef(-1);
  // Double saut : un passage annoncé à l'avance, où la corde tourne deux fois
  // pendant le saut. Il faut appuyer sur DOUBLE ! au lieu de SAUTE !.
  const doubleCycle = useRef(null);
  const nextDoubleAt = useRef(4);
  const [, force] = useState(0);
  const W = 120 + latency;

  const cycleInfo = () => {
    const local = t.current - phaseStart.current;
    const n = Math.floor(local / period.current);
    const bottom = phaseStart.current + n * period.current + period.current / 2;
    return { n, bottom, local };
  };

  const trip = (sub) => {
    score.current.trips += 1;
    score.current.streak = 0;
    sfx.miss();
    pop({ text: 'AÏE', sub, x: 200, y: 110, size: 28, color: 'var(--accent)' });
    pauseUntil.current = t.current + 700;
    phaseStart.current = t.current + 700;
    judgedCycle.current = -1;
    doubleCycle.current = null;
    nextDoubleAt.current = score.current.jumps + 4;
  };

  const jump = (kind = 'simple') => {
    if (!active || t.current < pauseUntil.current) return;
    const { n, bottom } = cycleInfo();
    // Le joueur peut taper un peu avant le passage (cycle courant) ou juste après.
    const prevBottom = bottom - period.current;
    const target = Math.abs(t.current - bottom) < Math.abs(t.current - prevBottom) ? { c: n, at: bottom } : { c: n - 1, at: prevBottom };
    if (judgedCycle.current === target.c) return;
    const isDouble = doubleCycle.current === target.c;
    const gap = Math.abs(t.current - target.at);
    if (gap <= W && (kind === 'double') === isDouble) {
      judgedCycle.current = target.c;
      jumpAt.current = t.current;
      jumpKind.current = kind;
      score.current.jumps += isDouble ? 2 : 1;
      score.current.streak += 1;
      if (isDouble) {
        score.current.doubles = (score.current.doubles || 0) + 1;
        doubleCycle.current = null;
        nextDoubleAt.current = score.current.jumps + 4 + Math.floor(Math.random() * 4);
        sfx.good();
        pop({ text: 'ダブル！', sub: 'DOUBLE SAUT ! +2', x: 480, y: 60, size: 40, color: 'var(--lime)' });
      } else sfx.ok();
      if (score.current.streak % 5 === 0) {
        // Accélère en gardant la phase courante de la corde.
        const frac = ((t.current - phaseStart.current) % period.current) / period.current;
        period.current = Math.max(560, period.current - 45);
        phaseStart.current = t.current - frac * period.current;
        judgedCycle.current = 0;
        if (!isDouble) pop({ text: 'タッ！', sub: `×${score.current.streak}`, x: 520, y: 70, color: 'var(--cyan)' });
      }
      // Annonce le prochain double saut pour le passage suivant.
      if (doubleCycle.current === null && score.current.jumps >= nextDoubleAt.current) {
        doubleCycle.current = judgedCycle.current + 1;
      }
    } else if (gap <= 400) {
      // Mauvais moment, ou mauvais bouton : le coq se prend la corde.
      judgedCycle.current = target.c;
      jumpAt.current = t.current;
      jumpKind.current = kind;
      if (gap <= W) trip(isDouble ? 'il fallait DOUBLE !' : 'trop haut : saut simple !');
      else trip(t.current < target.at ? 'trop tôt' : 'trop tard');
    }
    score.current.quality = Math.min(1, score.current.jumps / 26);
  };

  useRaf((dt) => {
    t.current += dt;
    if (t.current >= pauseUntil.current) {
      const { n, bottom } = cycleInfo();
      // Corde passée sans saut : le coq trébuche.
      const prev = bottom - period.current;
      if (t.current > prev + W && judgedCycle.current < n - 1 && n - 1 >= 0) {
        judgedCycle.current = n - 1;
        trip('pris dans la corde');
      }
    }
    force((x) => x + 1);
  }, active);

  useEffect(() => {
    if (!active) return undefined;
    const k = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); jump('simple'); }
      if (e.code === 'ArrowUp' || e.code === 'KeyD') { e.preventDefault(); jump('double'); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const paused = t.current < pauseUntil.current;
  const { n, local } = cycleInfo();
  const frac = paused ? 0 : (local % period.current) / period.current;
  const doubleNow = !paused && doubleCycle.current !== null && n === doubleCycle.current;
  const doubleSoon = doubleCycle.current !== null && !doubleNow;
  // Pendant un double saut, la corde fait deux tours et passe deux fois sous les pattes.
  const ang = doubleNow ? (frac * 2 + 0.5) * Math.PI * 2 : frac * Math.PI * 2;
  const ropeY = Math.cos(ang); // 1 en haut, -1 en bas
  const front = Math.sin(ang) <= 0;
  const airMs = jumpKind.current === 'double' ? 520 : 320;
  const air = Math.max(0, 1 - (t.current - jumpAt.current) / airMs);
  const jumpY = -Math.sin(air * Math.PI) * (jumpKind.current === 'double' ? 70 : 34);
  // Mains écartées sur les côtés, qui décrivent un petit cercle en faisant tourner la corde.
  const m = (palier - 1) / 4;
  const handX = 120 - (36 + 44 * m - 4) - (5 + 3 * m) + 1; // position du gant gauche (dessin)
  const spin = { x: Math.sin(ang) * 7, y: Math.cos(ang) * 7 };
  const hands = { l: { x: -40 + spin.x, y: -30 + spin.y }, r: { x: 40 - spin.x, y: -30 + spin.y } };
  const k = 200 / 300; // échelle du dessin du coq
  const ex = (gx) => 344 + gx * k;
  const ey = 96 + (240 - 30 + spin.y) * k + jumpY;
  const lx = ex(handX - 40 + spin.x);
  const rx = ex(240 - handX + 40 - spin.x);
  const ropePath = `M${lx} ${ey} Q ${(lx + rx) / 2} ${139 - ropeY * 255 + jumpY * 0.5} ${rx} ${ey}`;
  const ropeColor = doubleNow ? 'var(--lime)' : 'var(--cyan)';
  const btn = (kind, label, fill, right, hint) => (
    <button
      aria-label={kind === 'double' ? 'Double saut' : 'Sauter'}
      disabled={!active}
      onPointerDown={(e) => { e.stopPropagation(); jump(kind); }}
      style={{ position: 'absolute', right, top: 262, width: 112, height: 112, border: 0, padding: 0, background: 'transparent', cursor: 'pointer', touchAction: 'none', filter: hint ? 'var(--glow-accent)' : 'none', animation: hint ? 'glowPulse 0.5s ease-in-out infinite' : 'none' }}
    >
      <Burst size={112} fill={fill} textStyle={{ fontSize: 13, color: '#111', lineHeight: 1 }}>{label}</Burst>
    </button>
  );
  return (
    <div style={{ position: 'absolute', inset: 0 }} onPointerDown={() => jump('simple')}>
      <div className="box tone-lime" style={{ position: 'absolute', left: 300, right: 300, top: 300, height: 14 }} />
      {!front && <svg style={{ position: 'absolute', inset: 0 }} width="844" height="390" aria-hidden="true"><path d={ropePath} stroke="var(--ink)" strokeWidth="5" fill="none" /></svg>}
      <div style={{ position: 'absolute', left: 344, top: 96, transform: `translateY(${jumpY}px)` }}>
        <Poulet palier={palier} size={200} fist={hands} />
      </div>
      {front && (
        <svg style={{ position: 'absolute', inset: 0 }} width="844" height="390" aria-hidden="true">
          <path d={ropePath} stroke={ropeColor} strokeWidth={doubleNow ? 10 : 7} fill="none" />
          <path d={ropePath} stroke="var(--ink)" strokeWidth="2" fill="none" />
        </svg>
      )}
      {(doubleSoon || doubleNow) && (
        <div className="sfx-text blink" style={{ position: 'absolute', left: 300, right: 300, top: 70, textAlign: 'center', fontSize: 34, color: 'var(--lime)' }}>
          ダブル DOUBLE !
        </div>
      )}
      <div className="t" style={{ position: 'absolute', left: 30, top: 120, fontSize: 14, lineHeight: 1.4 }}>
        SAUTE ! quand la corde<br />passe sous les pattes.<br /><span style={{ color: 'var(--accent)' }}>DOUBLE ! quand c’est annoncé</span><br /><span style={{ fontFamily: 'var(--text)', fontSize: 12 }}>(corde verte : 2 tours, +2 sauts)</span>
      </div>
      <div className="t" style={{ position: 'absolute', right: 30, top: 236, fontSize: 14 }}>SAUTS {score.current.jumps} · SÉRIE {score.current.streak}</div>
      {btn('double', 'DOUBLE !', 'var(--lime)', 160, doubleSoon || doubleNow)}
      {btn('simple', 'SAUTE !', 'var(--cyan)', 40, false)}
    </div>
  );
}

const GAMES = { bench: Bench, bag: Bag, rope: Rope };

export default function MiniGame({ id }) {
  const { game, update, go, settings } = useGame();
  const mg = MINIGAMES.find((m) => m.id === id);
  const stat = STATS.find((s) => s.key === mg.stat);
  const [phase, setPhase] = useState('intro');
  const [count, setCount] = useState(3);
  const [left, setLeft] = useState(mg.duration * 1000);
  const [result, setResult] = useState(null);
  const [popups, pop] = usePopups();
  const score = useRef({ perfect: 0, good: 0, misses: 0, total: 0, gestures: 0, errors: 0, jumps: 0, trips: 0, streak: 0, quality: 0 });
  const palier = palierOf(game.stats).n;
  const firstTime = !game.simUnlocked[mg.id];

  useEffect(() => {
    if (phase !== 'count') return undefined;
    if (count <= 0) { setPhase('play'); sfx.bell(); return undefined; }
    sfx.click();
    const tm = setTimeout(() => setCount((c) => c - 1), 650);
    return () => clearTimeout(tm);
  }, [phase, count]);

  useRaf((dt) => {
    setLeft((l) => {
      const n = l - dt;
      if (n <= 0 && phase === 'play') {
        setPhase('done');
      }
      return Math.max(0, n);
    });
  }, phase === 'play');

  useEffect(() => {
    if (phase !== 'done') return;
    sfx.bell();
    const q = Math.max(0, Math.min(1, score.current.quality));
    const before = { stat: game.stats[mg.stat], weight: game.weight };
    const gain = Math.round(Math.max(0.3, 4 * q) * (game.supplementActive ? 1.5 : 1) * 10) / 10;
    const dw = Math.round(mg.weight(q) * 10) / 10;
    update((g) => { applySession(g, mg, q); });
    setResult({ q, gain, dw, before, unlocked: q >= 0.5 && firstTime });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const Game = GAMES[id];
  const grade = result ? (result.q >= 0.85 ? 'S' : result.q >= 0.65 ? 'A' : result.q >= 0.45 ? 'B' : 'C') : null;

  return (
    <div className="screen" style={{ padding: 0 }}>
      <div className="topbar" style={{ margin: 8, marginBottom: 0 }}>
        <div className="title">{mg.title}</div>
        <div className="sub">+ {stat.name} · {mg.kind}</div>
        <div className="t" style={{ fontSize: 28, color: left < 10000 ? 'var(--accent)' : 'var(--panel)', width: 80, textAlign: 'right' }}>{Math.ceil(left / 1000)} s</div>
        <div style={{ width: 120 }} aria-label="Qualité de la séance">
          <div className="gauge" style={{ borderColor: 'var(--panel)' }}><i style={{ width: `${score.current.quality * 100}%`, background: mg.color }} /></div>
        </div>
        {phase === 'play' && <button className="btn" style={{ fontSize: 12 }} onClick={() => setPhase('done')}>TERMINER</button>}
      </div>
      <div style={{ position: 'absolute', left: 8, right: 8, top: 66, bottom: 8, border: '3px solid var(--ink)', overflow: 'hidden', background: 'var(--panel)' }}>
        <div aria-hidden="true" className="sfx-text" style={{ position: 'absolute', right: 20, top: 10, fontSize: 64, color: mg.color, opacity: 0.25, transform: 'rotate(-8deg)' }}>{mg.sfx}</div>
        <div style={{ position: 'absolute', left: 0, top: -66, width: 844, height: 390 }}>
          <Game active={phase === 'play'} score={score} pop={pop} latency={settings.latency || 0} palier={palier} />
        </div>
        <Popups items={popups} />
      </div>

      {phase === 'intro' && (
        <div className="modal-back" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="box shadow-accent rise" style={{ width: 560, display: 'flex', gap: 12, padding: 12, alignItems: 'center' }}>
            <Coach size={110} bg="#7FE8FF" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="t" style={{ fontSize: 18 }}>COACH ERGOT</div>
              <div style={{ fontSize: 14, lineHeight: 1.35 }}>{mg.help}{firstTime ? ' Réussis-le une fois (qualité ≥ 50 %) pour débloquer la simulation rapide.' : ''}</div>
              <button className="btn btn-accent" onClick={() => setPhase('count')}>C’EST PARTI !</button>
            </div>
          </div>
        </div>
      )}
      {phase === 'count' && (
        <div className="modal-back" style={{ background: 'transparent', pointerEvents: 'none' }}>
          <div key={count} className="sfx-text rise" style={{ fontSize: 120, color: 'var(--lime)' }}>{count || 'GO!'}</div>
        </div>
      )}
      {phase === 'done' && result && (
        <div className="modal-back">
          <div className="box shadow-accent rise" style={{ width: 520, padding: 14, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ border: '5px solid var(--accent)', color: 'var(--accent)', padding: '4px 16px', transform: 'rotate(-8deg)', animation: 'stampIn 0.3s ease-out' }} className="t">
              <div style={{ fontSize: 56 }}>{grade}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="t" style={{ fontSize: 20 }}>SÉANCE TERMINÉE !</div>
              <div style={{ fontSize: 14 }}>Qualité : {Math.round(result.q * 100)} %</div>
              <div className="t" style={{ fontSize: 16, color: 'var(--accent)' }}>+{String(result.gain).replace('.', ',')} {stat.name.toUpperCase()}</div>
              <div style={{ fontSize: 13 }}>Poids : {result.dw >= 0 ? '+' : ''}{String(result.dw).replace('.', ',')} kg</div>
              {result.unlocked && <div className="tag" style={{ background: 'var(--lime)', alignSelf: 'flex-start' }}>Simulation rapide débloquée !</div>}
              <button className="btn btn-ink" onClick={() => go('salle')}>RETOUR À LA SALLE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
