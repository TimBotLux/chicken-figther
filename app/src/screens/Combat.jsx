import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/store.jsx';
import { ATTACKS, OPPONENTS } from '../data/data.js';
import { palierOf } from '../game/rules.js';
import { FightEngine, TUTORIAL } from '../game/engine.js';
import Poulet from '../components/Poulet.jsx';
import { Coach, Fighter } from '../components/Characters.jsx';
import { Burst, Gauge, Popups, STAR, usePopups, useRaf } from '../components/Ui.jsx';
import { sfx, vibrate } from '../game/sfx.js';
import { isTouchDevice } from '../game/fullscreen.js';
import Corner from './Corner.jsx';
import Arena, { arenaFor } from '../components/Arena.jsx';
import { categoryOfOpponent } from '../game/rules.js';

const HIT_TEXT = {
  jab: ['バシッ', 'PAF !'],
  crochet: ['ドン！', 'BAM !'],
  uppercut: ['ガッ！', 'POW !'],
  special: ['ズドン！！', 'COUP DE BEC !'],
};
const stageScale = () => Number(document.querySelector('.stage')?.dataset.scale || 1);

export default function Combat({ oppId, exhibition = false, weigh = 'ok', resume = false, tutorial = false }) {
  const { game, settings, update, go, resolveFight, setModal, modal } = useGame();
  const opp = OPPONENTS[oppId];
  const engRef = useRef(null);
  if (!engRef.current) {
    const snap = resume ? game.pendingFight?.snapshot : null;
    engRef.current = new FightEngine({ opp, game, settings, weigh, tutorial, snapshot: snap });
    if (snap) engRef.current.phase = 'corner';
  }
  const eng = engRef.current;
  if (import.meta.env.DEV) window.__eng = eng;
  const [, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [popups, pop] = usePopups();
  const [shakeKey, setShakeKey] = useState(0);
  const [flash, setFlash] = useState(0);
  const [over, setOver] = useState(null);
  const slowUntil = useRef(0);
  const freezeUntil = useRef(0); // arrêt sur image à l'impact (hitstop)
  const [cam, setCam] = useState({ key: 0, z: 1, ox: 50, oy: 40 });
  const [frame, setFrame] = useState(null);
  const [vignette, setVignette] = useState(0);
  const [particles, setParticles] = useState([]);
  const fxId = useRef(0);
  const fxOn = settings.shake;
  const hypeUntil = useRef(0);
  const enemyX = useRef(0); // décalage horizontal actuel de l'adversaire (pour placer les impacts)
  const arena = oppId === 'coach' ? 'salle' : arenaFor(categoryOfOpponent(oppId)?.id); // réglage « secousses et ralentis »
  // Arrêt sur image + zoom de caméra vers le point d'impact.
  const punchCam = (z, x, y, freeze) => {
    freezeUntil.current = performance.now() + freeze;
    if (fxOn) setCam((c) => ({ key: c.key + 1, z, ox: (x / 844) * 100, oy: (y / 390) * 100 }));
  };
  // Case d'impact manga : lignes de vitesse plein écran + onomatopée géante.
  const impactFrame = (x, y, text, sub, color) => {
    const id = ++fxId.current;
    setFrame({ id, x, y, text, sub, color });
    setTimeout(() => setFrame((f) => (f?.id === id ? null : f)), 420);
  };
  // Éclats : étoiles quand l'adversaire est touché, plumes quand c'est le coq.
  const burst = (x, y, n, kind) => {
    const items = Array.from({ length: n }, () => {
      const a = Math.random() * Math.PI * 2;
      const d = 60 + Math.random() * 90;
      return { id: ++fxId.current, x, y, kind, dx: Math.cos(a) * d, dy: Math.sin(a) * d - (kind === 'plume' ? 30 : 0), rot: (Math.random() - 0.5) * 540, c: ['var(--lime)', 'var(--accent)', 'var(--cyan)', 'var(--panel)'][Math.floor(Math.random() * 4)] };
    });
    setParticles((p) => [...p.slice(-24), ...items]);
    const ids = new Set(items.map((i) => i.id));
    setTimeout(() => setParticles((p) => p.filter((i) => !ids.has(i.id))), 650);
  };
  const lastHit = useRef(null);
  const lastBlock = useRef(-9999);
  const [touches, setTouches] = useState([]);
  const touchId = useRef(0);
  const addTouch = (x, y, side) => {
    const id = ++touchId.current;
    setTouches((t) => [...t.slice(-4), { id, x, y, side }]);
    setTimeout(() => setTouches((t) => t.filter((v) => v.id !== id)), 450);
  };
  const pointers = useRef(new Map());
  const palier = palierOf(game.stats).n;
  const gaucher = settings.gaucher;
  const isPaused = paused || modal === 'options';

  // Pause automatique dès que le jeu passe en arrière-plan.
  useEffect(() => {
    const onVis = () => { if (document.hidden) setPaused(true); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('blur', onVis); };
  }, []);

  const handleEvents = () => {
    for (const ev of eng.drain()) {
      switch (ev.type) {
        case 'telegraph':
          sfx.telegraph();
          vibrate(25, settings.vibration);
          break;
        case 'hit': {
          const [jp, fr] = ev.counter ? ['カウンター！', 'CONTRE !'] : HIT_TEXT[ev.kind];
          const big = ev.kind === 'special' || ev.counter;
          lastHit.current = { arm: eng.player.action?.arm, kind: ev.kind };
          vibrate(big ? 35 : 12, settings.vibration);
          (big ? sfx.bigHit : sfx.hit)();
          if (ev.kind === 'special') sfx.special();
          {
            const arm = lastHit.current.arm;
            const ix = (ev.kind === 'special' ? 422 : arm === 'l' ? 385 : 460) + enemyX.current;
            const iy = ev.kind === 'uppercut' ? 100 : 130;
            const heavy = big || ev.crit || ev.kind === 'uppercut' || ev.kind === 'crochet';
            punchCam(big ? 1.12 : heavy ? 1.06 : 1.03, ix, iy, big ? 170 : heavy ? 90 : 55);
            burst(ix, iy, big ? 12 : heavy ? 7 : 4, 'etoile');
            if (big || ev.crit) hypeUntil.current = performance.now() + 1500;
            if (big || ev.crit) impactFrame(ix, iy, jp, ev.crit && !big ? `${fr} CRITIQUE !` : fr, ev.kind === 'special' ? 'var(--accent)' : 'var(--lime)');
          }
          if (ev.combo >= 3) pop({ text: `COMBO ×${ev.combo}`, x: 140, y: 250, size: 26, color: 'var(--lime)', r: -10 });
          if (big && settings.shake) setShakeKey((k) => k + 1);
          break;
        }
        case 'blocked':
          lastBlock.current = eng.now;
          sfx.block();
          break;
        case 'phit':
          sfx.bigHit();
          // Vibration proportionnelle au coup encaissé.
          vibrate(Math.round(Math.min(220, 80 + ev.dmg * 10)), settings.vibration);
          setVignette((v) => v + 1);
          if (settings.shake) setShakeKey((k) => k + 1);
          punchCam(1.05, 422, 330, 110);
          burst(422, 300, 8, 'plume');
          break;
        case 'pblock':
          sfx.block();
          vibrate(30, settings.vibration);
          burst(422, 280, 3, 'etoile');
          break;
        case 'perfect':
          sfx.perfect();
          vibrate([20, 30, 20], settings.vibration);
          if (settings.shake) slowUntil.current = performance.now() + 350;
          impactFrame(422, 160, 'パーフェクト', 'ESQUIVE PARFAITE ! CONTRE !', 'var(--lime)');
          break;
        case 'avoid':
          sfx.whiff();
          break;
        case 'tired':
          sfx.tired();
          pop({ text: 'ハァハァ', sub: 'ÉPUISÉ', x: 40, y: 90, size: 24, color: 'var(--cyan)' });
          break;
        case 'knockdown':
          sfx.bigHit();
          vibrate(ev.who === 'player' ? [200, 80, 300] : 120, settings.vibration);
          punchCam(1.16, 422, ev.who === 'player' ? 330 : 140, 260);
          burst(422, ev.who === 'player' ? 300 : 140, 16, ev.who === 'player' ? 'plume' : 'etoile');
          hypeUntil.current = performance.now() + 2500;
          impactFrame(422, 170, 'ダウン！', 'KNOCK-DOWN !', 'var(--accent)');
          if (settings.shake) setShakeKey((k) => k + 1);
          break;
        case 'enraged':
          pop({ text: 'ゴゴゴ', sub: 'ENRAGÉ ! il accélère', x: 520, y: 70, size: 40, color: 'var(--accent)', ms: 1600 });
          break;
        case 'signature':
          pop({ text: '!!', sub: ev.name, x: 560, y: 90, size: 30, color: 'var(--lime)', ms: 1300 });
          break;
        case 'bell':
          sfx.bell();
          break;
        case 'corner':
          if (!tutorial) {
            update((g) => { g.pendingFight = { oppId, exhibition, weigh, snapshot: eng.snapshot() }; });
          }
          break;
        case 'over':
          setTimeout(() => setOver(ev), 900);
          break;
        case 'tutstep':
          sfx.ok();
          break;
        default:
          break;
      }
    }
  };

  useRaf((dt) => {
    if (isPaused) return;
    if (performance.now() < freezeUntil.current) { setTick((t) => (t + 1) % 1e6); return; }
    const slow = performance.now() < slowUntil.current ? 0.3 : 1;
    eng.update(dt * slow * (import.meta.env.DEV ? window.__speed || 1 : 1));
    handleEvents();
    setTick((t) => (t + 1) % 1e6);
  }, true);

  // ----- Entrées tactiles : moitié gauche défense, moitié droite attaque (inversées pour les gauchers).
  const sideOf = (x) => {
    const left = x < 422;
    return (left !== gaucher) ? 'def' : 'atk';
  };
  const toStage = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const s = stageScale();
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  };
  const onDown = (e) => {
    if (isPaused || over) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (eng.phase === 'kd_player') { eng.tapGetUp(); sfx.click(); return; }
    const p = toStage(e);
    const side = sideOf(p.x);
    const ptr = { side, x0: p.x, y0: p.y, t0: performance.now(), done: false, guard: false };
    addTouch(p.x, p.y + 70, side);
    pointers.current.set(e.pointerId, ptr);
    if (side === 'def') {
      eng.setGuard('high');
      ptr.guard = true;
    } else {
      ptr.timer = setTimeout(() => {
        if (!ptr.done && Math.hypot(ptr.dx || 0, ptr.dy || 0) < 12) { ptr.done = true; eng.punch('jab'); }
      }, 90);
    }
  };
  const onMove = (e) => {
    const ptr = pointers.current.get(e.pointerId);
    if (!ptr) return;
    const p = toStage(e);
    const dx = p.x - ptr.x0;
    const dy = p.y - ptr.y0;
    ptr.dx = dx; ptr.dy = dy;
    const dt = performance.now() - ptr.t0;
    if (ptr.side === 'def') {
      if (!ptr.done && dt < 230 && (Math.abs(dx) > 30 || dy > 30)) {
        ptr.done = true;
        eng.setGuard(null);
        let dir;
        if (Math.abs(dx) > Math.abs(dy)) dir = dx < 0 ? 'left' : 'right';
        else dir = 'back';
        eng.dodge(dir);
      } else if (!ptr.done && dt >= 230) {
        eng.setGuard(dy > 26 ? 'low' : 'high');
      }
    } else if (!ptr.done && (Math.abs(dx) > 28 || dy < -28)) {
      ptr.done = true;
      clearTimeout(ptr.timer);
      eng.punch(-dy > Math.abs(dx) ? 'uppercut' : 'crochet');
    }
  };
  const onUp = (e) => {
    const ptr = pointers.current.get(e.pointerId);
    if (!ptr) return;
    pointers.current.delete(e.pointerId);
    if (ptr.side === 'def') {
      const stillGuarding = [...pointers.current.values()].some((x) => x.side === 'def' && !x.done);
      if (!stillGuarding) eng.setGuard(null);
    } else if (!ptr.done) {
      clearTimeout(ptr.timer);
      ptr.done = true;
      eng.punch('jab');
    }
  };

  // ----- Clavier (tests sur ordinateur) et manette émulée.
  useEffect(() => {
    const held = new Set();
    const down = (e) => {
      if (e.repeat) return;
      if (e.code === 'Escape' || e.code === 'KeyP') { setPaused((p) => !p); return; }
      if (eng.phase === 'kd_player') { eng.tapGetUp(); return; }
      const k = e.code;
      held.add(k);
      if (k === 'KeyA' || k === 'ArrowLeft') eng.dodge('left');
      else if (k === 'KeyD' || k === 'ArrowRight') eng.dodge('right');
      else if (k === 'KeyS' || k === 'ArrowDown') eng.dodge('back');
      else if (k === 'KeyW' || k === 'ShiftLeft') eng.setGuard('high');
      else if (k === 'KeyX') eng.setGuard('low');
      else if (k === 'KeyJ') eng.punch('jab');
      else if (k === 'KeyK') eng.punch('crochet');
      else if (k === 'KeyL' || k === 'ArrowUp') eng.punch('uppercut');
      else if (k === 'Space') { e.preventDefault(); eng.punch('special'); }
    };
    const up = (e) => {
      held.delete(e.code);
      if (['KeyW', 'ShiftLeft', 'KeyX'].includes(e.code)) {
        if (held.has('KeyW') || held.has('ShiftLeft')) eng.setGuard('high');
        else if (held.has('KeyX')) eng.setGuard('low');
        else eng.setGuard(null);
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [eng]);

  const finish = () => {
    if (tutorial) {
      update((g) => { g.tutorialDone = true; });
      go('carte');
      return;
    }
    const summary = resolveFight({ oppId, exhibition, weigh, win: over.win, method: over.method, perfect: eng.stats.perfect, landed: eng.stats.landed, rounds: eng.round, scores: eng.scores });
    go('result', { summary });
  };

  const abandon = () => {
    setPaused(false);
    if (tutorial) { finish(); return; }
    eng.finish(false, 'ABANDON');
  };

  // ----- Rendu
  const pl = eng.player;
  const e = eng.enemy;
  const now = eng.now;
  const A = e.attack ? ATTACKS[e.attack] : null;
  const act = pl.action && now < pl.action.until ? pl.action : null;
  const telegraphing = e.state === 'tele';
  const inPerfect = telegraphing && e.impactAt - now <= eng.mods.perfect;
  const justStruck = (e.state === 'recover' || e.state === 'gap' || e.state === 'stun') && now - e.impactAt < 160;

  let eT = '';
  let eAnim = 'bob 1.2s ease-in-out infinite';
  if (e.state === 'tele' && A) {
    const p = Math.min(1, (now - e.teleStart) / Math.max(1, e.impactAt - e.teleStart));
    const k = 0.4 + 0.6 * p;
    eT = {
      left: `translateX(${-14 * k}px) rotate(${-9 * k}deg)`,
      right: `translateX(${14 * k}px) rotate(${9 * k}deg)`,
      center: e.attack === 'body' ? `translateY(${12 * k}px) scaleY(${1 - 0.05 * k})` : e.attack === 'upper' ? `translateY(${16 * k}px)` : e.attack === 'charge' ? `scale(${1 - 0.08 * k}) translateY(${-8 * k}px)` : `translateY(${-8 * k}px) scale(${1 - 0.03 * k})`,
    }[A.side];
    eAnim = 'none';
  }
  if (justStruck) { eT = 'translateY(34px) scale(1.12)'; eAnim = 'none'; }
  if (e.state === 'stun') eAnim = 'wobble 0.35s ease-in-out infinite';
  if (e.state === 'down' || (eng.phase === 'over' && eng.result?.win)) { eT = 'translateY(120px) rotate(-75deg)'; eAnim = 'none'; }
  const eHit = now < e.flashUntil;
  const lh = lastHit.current;
  if (eHit && lh && e.state !== 'down' && e.state !== 'tele' && !justStruck) {
    // Gant gauche (à gauche de l'écran) : la tête part vers la droite, et inversement.
    const dir = lh.arm === 'l' ? 1 : -1;
    eT = lh.kind === 'uppercut' ? 'translateY(-14px) rotate(0deg) scale(1.02)'
      : lh.kind === 'special' ? 'translateY(-10px) scale(0.92)'
      : lh.kind === 'crochet' ? `translateX(${dir * 20}px) rotate(${dir * 8}deg)`
      : `translateX(${dir * 10}px) rotate(${dir * 3}deg) scale(0.98)`;
    eAnim = 'none';
  }
  // Gants de l'adversaire : armé pendant le télégraphe, bras tendu à l'impact,
  // garde serrée quand il bloque, bras ballants quand il est sonné.
  // l = gant à gauche de l'écran. Unités du dessin 240×300.
  const G = (x, y, r = 0, k = 1) => ({ x, y, r, k });
  let fist = null;
  if (e.state === 'tele' && A) {
    const p = Math.min(1, (now - e.teleStart) / Math.max(1, e.impactAt - e.teleStart));
    fist = {
      hookL: { l: G(-28 * p, -16 * p, -30 * p) },
      hookR: { r: G(28 * p, -16 * p, 30 * p) },
      jab: { r: G(10 * p, -12 * p, 0, 1 - 0.08 * p) },
      body: { l: G(-12 * p, 22 * p) },
      upper: { r: G(12 * p, 42 * p, 25 * p) },
      charge: { l: G(-18 * p, -22 * p), r: G(18 * p, -22 * p) },
    }[e.attack];
  } else if ((e.state === 'recover' || e.state === 'gap' || e.state === 'stun') && now - e.impactAt < 280 && e.attack) {
    fist = {
      hookL: { l: G(62, 34, 35, 1.5) },
      hookR: { r: G(-62, 34, -35, 1.5) },
      jab: { r: G(-40, 40, 0, 1.6) },
      body: { l: G(38, 55, 0, 1.4) },
      upper: { r: G(-38, 10, -25, 1.5) },
      charge: { l: G(36, 36, 0, 1.4), r: G(-36, 36, 0, 1.4) },
    }[e.attack];
  } else if (e.state === 'stun' || e.state === 'down') {
    fist = { l: G(-12, 55, -25), r: G(12, 55, 25) };
  } else if (now - lastBlock.current < 240) {
    fist = { l: G(32, -42, 0, 1.05), r: G(-32, -42, 0, 1.05) };
  }
  const impact = eHit && lh ? { x: (lh.kind === 'special' ? 380 : lh.arm === 'l' ? 350 : 420) + enemyX.current, y: lh.kind === 'uppercut' ? 70 : 100 } : null;

  // Jeu de jambes : l'adversaire tourne autour du coq, avance pour frapper, recule quand il encaisse ;
  // le coq sautille et pivote pour lui faire face ; la caméra suit (parallaxe du décor).
  const sway = Math.sin(now / 1150) * 40 + Math.sin(now / 470) * 7;
  let ex = sway;
  let near = 1;
  if (telegraphing) near = 1 + 0.08 * Math.min(1, (now - e.teleStart) / Math.max(1, e.impactAt - e.teleStart));
  if (justStruck) near = 1.1;
  if (eHit) near = 0.94;
  if (e.state === 'stun') ex = sway * 0.3;
  const hop = eng.phase === 'fight' ? -Math.abs(Math.sin(now / 165)) * 5 : 0;
  const px = ex * 0.3;
  const dodgeX = act?.type === 'dodge' ? (act.dir === 'left' ? -120 : act.dir === 'right' ? 120 : 0) : 0;
  const camShift = -(px + dodgeX) * 0.45 - ex * 0.2;
  const hype = performance.now() < hypeUntil.current;
  enemyX.current = ex + camShift * 0.55;

  let pT = '';
  if (act?.type === 'dodge') pT = { left: 'translateX(-120px) rotate(-14deg)', right: 'translateX(120px) rotate(14deg)', back: 'translateY(46px) scale(0.9)' }[act.dir];
  else if (act?.type === 'punch') pT = act.kind === 'uppercut' ? 'translateY(-14px)' : act.kind === 'special' ? 'translateY(-22px) scale(0.97)' : `translateY(-8px) translateX(${act.arm === 'l' ? 8 : -8}px) rotate(${act.arm === 'l' ? 3 : -3}deg)`;
  else if (act?.type === 'stagger') pT = 'translateY(16px) rotate(5deg)';
  else if (pl.guard === 'low') pT = 'translateY(10px)';
  if (eng.phase === 'kd_player' || (eng.phase === 'over' && !eng.result?.win)) pT = 'translateY(150px) rotate(70deg)';

  const scale = opp.size || 1;
  const mm = Math.floor(eng.time / 60000);
  const ss = Math.ceil((eng.time % 60000) / 1000);
  const timeLabel = ss === 60 ? `${mm + 1}:00` : `${mm}:${String(ss).padStart(2, '0')}`;
  const tutStep = tutorial ? TUTORIAL[eng.tut.step] : null;
  const specialPct = pl.special;
  const specialLeft = gaucher ? 16 : 730;
  const defense = { title: 'DÉFENSE', lines: ['Maintenir : garde haute', 'Maintenir + glisser ↓ : garde basse', 'Glisser ← / → : esquive', 'Glisser ↓ : recul'] };
  const attack = { title: 'ATTAQUE', lines: ['Tap : jab / direct', 'Glisser ↔ : crochet', 'Glisser ↑ : uppercut'] };
  const zones = gaucher ? [attack, defense] : [defense, attack];

  return (
    <div className="screen" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Caméra : petit zoom vers le point d'impact (arrêt sur image géré dans la boucle) */}
      <div key={`cam-${cam.key}`} className={cam.key ? 'cam-punch' : ''} style={{ position: 'absolute', inset: 0, '--z': cam.z, transformOrigin: `${cam.ox}% ${cam.oy}%` }}>
      <div key={`shake-${shakeKey}`} className={shakeKey ? 'shake' : ''} style={{ position: 'absolute', inset: 0, background: 'var(--paper)' }}>
        <Arena theme={arena} shift={camShift} hype={hype} />
        {/* Adversaire : le cadrage recule pour les plus gros */}
        <div style={{ position: 'absolute', left: 422 - 110 * scale, top: 325 - 275 * scale, transformOrigin: '50% 100%', transform: `translateX(${ex + camShift * 0.55}px) scale(${near})`, transition: 'transform 0.12s ease-out' }}>
        <div style={{ transformOrigin: '50% 100%', transform: eT, animation: eAnim, transition: justStruck ? 'transform 0.06s' : 'transform 0.1s', filter: `${eHit ? 'brightness(1.9) ' : ''}${telegraphing ? 'drop-shadow(0 0 8px var(--accent))' : ''}` || 'none' }}>
          <Fighter look={opp.look} size={275 * scale} fist={fist} />
        </div>
        </div>
        {e.state === 'stun' && (
          <div className="sfx-text" aria-hidden="true" style={{ position: 'absolute', left: 360, top: 40, fontSize: 26, color: 'var(--lime)' }}>ふらふら ★</div>
        )}
        {e.enraged && <div aria-hidden="true" className="sfx-text vertical" style={{ position: 'absolute', left: 540, top: 64, fontSize: 28, letterSpacing: -2, color: 'var(--accent)' }}>ゴゴゴ</div>}

        {/* Télégraphe : animation + son + vibration */}
        {telegraphing && A && (
          <>
            <Burst size={84} fill={A.guard === null ? 'var(--accent)' : 'var(--lime)'} style={{ position: 'absolute', left: (A.side === 'left' ? 262 : A.side === 'right' ? 500 : 380) + enemyX.current, top: 128 }} textStyle={{ fontSize: 26, color: A.guard === null ? '#111' : 'var(--accent)' }}>
              {A.side === 'left' ? '→' : A.side === 'right' ? '←' : e.attack === 'body' ? '↓' : '!!'}
            </Burst>
          </>
        )}
        {settings.assist && inPerfect && (
          <div className="sfx-text blink" style={{ position: 'absolute', left: 0, right: 0, top: 172, textAlign: 'center', fontSize: 36, color: 'var(--lime)' }}>{A?.hint?.includes('←') ? '← ESQUIVE !' : A?.hint?.includes('→') ? 'ESQUIVE ! →' : 'ESQUIVE !'}</div>
        )}

        {/* Le coq, vu de dos */}
        <div style={{ position: 'absolute', left: 300, top: 230, transform: `translate(${px + camShift * 0.8}px, ${hop}px)` }}>
        <div style={{ transformOrigin: '50% 80%', transform: pT, transition: 'transform 0.09s ease-out', filter: act?.type === 'stagger' ? 'drop-shadow(0 0 10px var(--accent))' : 'none' }}>
          <Poulet
            palier={palier} pose="dos" size={300}
            strike={act?.type === 'punch' ? { kind: act.kind, arm: act.arm } : null}
            guard={act ? null : pl.guard}
            gloves={game.equipment?.gants ? '#FF2E88' : '#D7262B'} pants={game.equipment?.short ? '#2B3A55' : '#35303A'} />
        </div>
        </div>
        {impact && (
          <Burst size={64} fill="var(--panel)" style={{ position: 'absolute', left: impact.x, top: impact.y, pointerEvents: 'none' }} textStyle={{ fontSize: 14, color: 'var(--accent)' }}>
            {lh.kind === 'special' ? 'BEC!' : 'POW'}
          </Burst>
        )}
      </div>
      </div>
      {flash > 0 && <div key={`flash-${flash}`} aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'var(--accent)', opacity: 0, animation: 'pop 0.3s ease-out reverse', pointerEvents: 'none' }} />}

      {/* HUD minimal, hors des zones de gestes */}
      <div className="box" style={{ position: 'absolute', left: 12, top: 10, width: 250, padding: '5px 10px 8px', boxShadow: '4px 4px 0 var(--accent)', display: 'flex', flexDirection: 'column', gap: 4, zIndex: 3 }}>
        <div className="t" style={{ fontSize: 16, display: 'flex', justifyContent: 'space-between' }}>
          <span>POULET</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--text)' }}>{pl.kdTotal > 0 ? `${pl.kdTotal} KD` : ''}</span>
        </div>
        {/* Libellés à côté des barres : la couleur ne porte jamais seule l'information (PRD) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="t" style={{ width: 78, flexShrink: 0, whiteSpace: 'nowrap', fontSize: 10, color: 'var(--accent)' }}>VIE</span>
          <div style={{ width: 140 }}><Gauge pct={(pl.hp / pl.maxHp) * 100} color="var(--accent)" height={11} label="Vie du poulet" /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="t" style={{ width: 78, flexShrink: 0, whiteSpace: 'nowrap', fontSize: 10, color: 'var(--cyan)' }}>ENDURANCE</span>
          <div style={{ width: 140 }}><Gauge pct={(pl.sta / pl.maxSta) * 100} color="var(--cyan)" height={11} label="Endurance" /></div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 352, top: 6, width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3 }}>
        <div className="t" style={{ padding: '1px 10px', background: 'var(--lime)', color: '#111', border: '2px solid var(--ink)', fontSize: 13, transform: 'skewX(-10deg)' }}>
          {tutorial ? 'SPARRING' : `ROUND ${eng.round} / ${eng.rounds}`}
        </div>
        {!tutorial && <div className="t" style={{ fontSize: 36, color: eng.time < 10000 ? 'var(--accent)' : 'var(--ink)', textShadow: '-2px -2px 0 var(--panel), 2px -2px 0 var(--panel), -2px 2px 0 var(--panel), 2px 2px 0 var(--panel)' }}>{timeLabel}</div>}
      </div>
      <div className="box" style={{ position: 'absolute', left: 532, top: 10, width: 246, padding: '5px 10px 8px', boxShadow: '4px 4px 0 var(--accent)', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', zIndex: 3 }}>
        <div className="t" style={{ fontSize: opp.name.length > 14 ? 14 : 16 }}>{opp.name}</div>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1 }}><Gauge pct={(e.hp / e.maxHp) * 100} color="var(--accent)" height={13} align="right" label={`Vie de ${opp.short}`} /></div>
          <span className="t" style={{ fontSize: 10, color: 'var(--accent)' }}>VIE</span>
        </div>
      </div>
      <button aria-label="Pause" onClick={() => setPaused(true)} style={{ position: 'absolute', left: 788, top: 12, width: 44, height: 44, border: '3px solid var(--ink)', background: 'var(--panel)', boxShadow: '3px 3px 0 var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, zIndex: 4 }}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="1" width="4" height="14" fill="var(--ink)" /><rect x="10" y="1" width="4" height="14" fill="var(--ink)" /></svg>
      </button>

      {/* Zones de gestes */}
      <div
        style={{ position: 'absolute', left: 0, top: 70, width: 844, height: 320, zIndex: 2, touchAction: 'none' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      >
        {settings.showZones && (tutorial || (eng.round === 1 && now < 7000)) && [0, 1].map((i) => (
          <div key={i} style={{ position: 'absolute', left: i ? 430 : 10, top: 12, width: 404, height: 300, border: '2.5px dashed var(--ink)', padding: '10px 12px', display: 'flex', flexDirection: 'column', alignItems: i ? 'flex-end' : 'flex-start', pointerEvents: 'none', opacity: tutorial ? 0.7 : Math.max(0, Math.min(1, (7000 - now) / 1500)) }}>
            {true && (
              <div className="double" style={{ background: 'var(--panel)', textAlign: i ? 'right' : 'left' }}>
                <div className="t" style={{ background: 'var(--ink)', color: 'var(--panel)', fontSize: 14, padding: '1px 10px' }}>{zones[i].title}</div>
                <div style={{ padding: '4px 10px 6px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {zones[i].lines.map((l) => <div key={l} style={{ fontSize: 12 }}>{l}</div>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Légende des commandes, en bas à gauche (à droite en mode gaucher, où se trouve le coup de bec).
          Gestes sur téléphone, touches du clavier sur ordinateur. Ne capte pas les doigts. */}
      {settings.showZones && !tutorial && !(eng.round === 1 && now < 7000) && (eng.phase === 'fight' || eng.phase === 'intro') && (
        <div aria-label="Commandes" style={{ position: 'absolute', left: gaucher ? 554 : 10, bottom: 8, width: 280, zIndex: 3, pointerEvents: 'none', background: 'var(--panel)', border: '2.5px solid var(--ink)', boxShadow: '3px 3px 0 var(--accent)', opacity: 0.88, fontSize: 11, lineHeight: 1.35 }}>
          {(isTouchDevice()
            ? [
              [gaucher ? 'DROITE' : 'GAUCHE', 'maintenir : garde · ↓ : garde basse'],
              ['', 'glisser ← → : esquive · ↓ vite : recul'],
              [gaucher ? 'GAUCHE' : 'DROITE', 'tap : jab · ↔ : crochet · ↑ : uppercut'],
              ['★', 'coup de bec (jauge pleine)'],
            ]
            : [
              ['A / D', 'esquive gauche / droite · S : recul'],
              ['W / X', 'garde haute / garde basse (maintenir)'],
              ['J K L', 'jab · crochet · uppercut'],
              ['ESPACE', 'coup de bec · ÉCHAP : pause'],
            ]
          ).map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', gap: 6, padding: '1px 6px', borderTop: i ? '1px solid var(--tone)' : 0 }}>
              <span className="t" style={{ minWidth: 52, fontSize: 10, color: 'var(--accent)' }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Coup de bec */}
      {specialPct >= 100 && <div className="tag" style={{ position: 'absolute', left: gaucher ? 80 : 770, top: 270, background: 'var(--cyan)', transform: 'rotate(8deg)', zIndex: 6, whiteSpace: 'nowrap' }}>PRÊT !</div>}
      <button
        aria-label={`Coup de bec, jauge ${Math.round(specialPct)} %`}
        onPointerDown={(ev) => { ev.stopPropagation(); eng.punch('special'); }}
        style={{ position: 'absolute', left: specialLeft, top: 284, width: 100, height: 100, border: 0, background: 'transparent', cursor: 'pointer', padding: 0, zIndex: 5, filter: specialPct >= 100 ? 'var(--glow-accent)' : 'none', animation: specialPct >= 100 ? 'glowPulse 0.8s ease-in-out infinite' : 'none' }}
      >
        <svg aria-hidden="true" viewBox="0 0 70 70" style={{ position: 'absolute', inset: 0, width: 100, height: 100 }}>
          <defs><clipPath id="sp-fill"><rect x="0" y={70 - (70 * specialPct) / 100} width="70" height="70" /></clipPath></defs>
          <polygon points={STAR} fill="var(--panel)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
          <polygon points={STAR} fill="var(--accent)" clipPath="url(#sp-fill)" />
          <polygon points={STAR} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
        </svg>
        <span className="t" style={{ position: 'relative', display: 'block', fontSize: 14, lineHeight: 1.05, color: specialPct >= 100 ? 'var(--on-accent)' : 'var(--ink)' }}>COUP<br />DE BEC</span>
      </button>

      {touches.map((t) => (
        <div key={t.id} aria-hidden="true" className="touch-ring" style={{ left: t.x - 30, top: t.y - 30, borderColor: t.side === 'atk' ? 'var(--accent)' : 'var(--cyan)' }} />
      ))}
      {/* Vignette rouge quand le coq encaisse */}
      {vignette > 0 && <div key={`vig-${vignette}`} aria-hidden="true" className="hurt-vignette" />}
      {/* Éclats */}
      {particles.map((p) => (
        <div key={p.id} aria-hidden="true" className="particle" style={{ left: p.x, top: p.y, '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--rot': `${p.rot}deg` }}>
          {p.kind === 'plume'
            ? <svg width="22" height="12" viewBox="0 0 22 12"><path d="M1 6 C 6 0, 16 0, 21 6 C 16 12, 6 12, 1 6 Z" fill="#E08E4E" stroke="#2A1408" strokeWidth="1.5" /><path d="M3 6 L19 6" stroke="#2A1408" strokeWidth="1" /></svg>
            : <svg width="16" height="16" viewBox="0 0 70 70"><polygon points={STAR} fill={p.c} stroke="var(--ink)" strokeWidth="5" /></svg>}
        </div>
      ))}
      {/* Case d'impact manga */}
      {frame && (
        <div key={frame.id} aria-hidden="true" className="impact-frame">
          {/* Lignes de vitesse centrées sur l'impact, dégagées autour du point touché */}
          <div style={{ position: 'absolute', inset: 0, background: `repeating-conic-gradient(from 0deg at ${frame.x}px ${frame.y}px, var(--ink) 0deg 1.4deg, transparent 1.4deg 7deg)`, WebkitMaskImage: `radial-gradient(circle at ${frame.x}px ${frame.y}px, transparent 90px, #000 140px)`, maskImage: `radial-gradient(circle at ${frame.x}px ${frame.y}px, transparent 90px, #000 140px)` }} />
          <div className="sfx-text" style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontSize: 80, color: frame.color, transform: 'rotate(-6deg)' }}>{frame.text}</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 214, textAlign: 'center' }}><span className="gloss" style={{ fontSize: 18, fontFamily: 'var(--title)' }}>{frame.sub}</span></div>
        </div>
      )}
      <Popups items={popups} />

      {/* Tutoriel : Coach Ergot guide le sparring */}
      {tutorial && tutStep && (
        <div style={{ position: 'absolute', left: 12, top: 232, width: 300, display: 'flex', gap: 8, alignItems: 'flex-end', zIndex: 6, pointerEvents: 'none' }}>
          <Coach size={64} bg="#7FE8FF" />
          <div className="box rise" key={eng.tut.step} style={{ padding: '6px 10px', fontSize: 13, lineHeight: 1.35, boxShadow: '3px 3px 0 var(--lime)' }}>
            <div className="t" style={{ fontSize: 12, color: 'var(--accent)' }}>ÉTAPE {eng.tut.step + 1}/{TUTORIAL.length} · {eng.tut.n}/{tutStep.count}</div>
            {tutStep.text}
          </div>
        </div>
      )}
      {tutorial && !over && (
        <button className="link" style={{ position: 'absolute', left: 362, top: 30, width: 120, zIndex: 6, minHeight: 24 }} onClick={finish}>Passer le tutoriel</button>
      )}

      {eng.phase === 'intro' && (
        <div className="modal-back" style={{ background: 'transparent', pointerEvents: 'none' }}>
          <div className="rise" style={{ textAlign: 'center' }}>
            <div className="sfx-text" style={{ fontSize: 70, color: 'var(--lime)' }}>{now > eng.phaseUntil - 700 ? 'ファイト！' : tutorial ? 'SPARRING' : `ROUND ${eng.round}`}</div>
            <div className="gloss" style={{ display: 'inline-block', fontSize: 16 }}>{now > eng.phaseUntil - 700 ? 'FIGHT !' : opp.champion ? 'Combat de championnat' : 'Prêt ?'}</div>
          </div>
        </div>
      )}
      {eng.phase === 'kd_enemy' && (
        <div className="modal-back" style={{ background: 'transparent', pointerEvents: 'none' }}>
          <div className="sfx-text" style={{ fontSize: 90, color: 'var(--cyan)' }}>{Math.min(10, Math.floor((now - (eng.phaseUntil - 3200)) / 320) + 1)}</div>
        </div>
      )}
      {eng.phase === 'kd_player' && (
        <div className="modal-back" style={{ background: 'rgba(0,0,0,0.35)', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <div className="sfx-text" style={{ fontSize: 80, color: 'var(--accent)' }}>{Math.min(10, Math.floor((now - (eng.phaseUntil - 6000)) / 600) + 1)}</div>
            <div className="tag blink" style={{ background: 'var(--lime)', fontSize: 18 }}>TAPE VITE POUR TE RELEVER !</div>
            <div style={{ width: 260 }}><Gauge pct={(pl.taps / pl.tapsNeeded) * 100} color="var(--lime)" height={16} label="Se relever" /></div>
          </div>
        </div>
      )}
      {eng.phase === 'corner' && !isPaused && (
        <Corner eng={eng} opp={opp} onChoose={(c) => { eng.corner(c); sfx.bell(); }} />
      )}
      {over && (
        <div className="modal-back">
          <div className="rise" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <div className="sfx-text" style={{ fontSize: 76, color: over.win ? 'var(--lime)' : 'var(--accent)', transform: 'rotate(-6deg)' }}>{over.win ? (over.method.startsWith('KO') ? 'K.O. !!' : 'VICTOIRE !') : 'DÉFAITE…'}</div>
            <div className="gloss" style={{ fontSize: 16 }}>{over.method}</div>
            <button className="btn btn-accent" style={{ fontSize: 20, minWidth: 220 }} onClick={finish}>CONTINUER</button>
          </div>
        </div>
      )}
      {paused && !over && (
        <div className="modal-back">
          <div className="box shadow-accent rise" style={{ width: 320, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="t" style={{ fontSize: 26, color: 'var(--accent)', transform: 'skewX(-8deg)' }}>PAUSE</div>
            <button className="btn btn-accent" onClick={() => setPaused(false)}>REPRENDRE</button>
            <button className="btn" onClick={() => setModal('options')}>OPTIONS</button>
            <button className="btn" onClick={abandon}>{tutorial ? 'PASSER LE TUTORIEL' : 'ABANDONNER'}</button>
            <div style={{ fontSize: 11, lineHeight: 1.35 }}>Clavier : A/D ou ←/→ esquive · S/↓ recul · W garde haute · X garde basse · J jab · K crochet · L/↑ uppercut · Espace coup de bec</div>
          </div>
        </div>
      )}
    </div>
  );
}
