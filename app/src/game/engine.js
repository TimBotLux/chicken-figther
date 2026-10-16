// Moteur de combat sur rail : le coq fait toujours face à l'adversaire, esquive à gauche /
// à droite ou recule. Toutes les fenêtres de timing sont en millisecondes, indépendantes
// de la fréquence d'images (PRD : « Fenêtres de timing »).
import { ATTACKS, DIFFICULTY, ECONOMY } from '../data/data.js';

const ROUND_MS = 60000;
const rand = (a, b) => a + Math.random() * (b - a);

const PUNCHES = {
  jab: { dmg: 3, cost: 4, cd: 260, label: 'JAB' },
  crochet: { dmg: 5, cost: 8, cd: 420, label: 'CROCHET' },
  uppercut: { dmg: 7, cost: 10, cd: 550, label: 'UPPERCUT' },
  special: { dmg: 20, cost: 0, cd: 700, label: 'COUP DE BEC' },
};

// Étapes du sparring guidé (tutoriel du PRD : coup, garde, esquive, esquive parfaite).
export const TUTORIAL = [
  { text: 'Tape sur la moitié DROITE de l’écran : jab ! Touche-moi 3 fois.', need: 'hits', count: 3 },
  { text: 'Glisse vers le haut à droite : UPPERCUT. Glisse sur le côté : CROCHET.', need: 'variety', count: 2 },
  { text: 'Maintiens le doigt à GAUCHE : garde haute. Bloque 2 de mes directs.', need: 'blocks', count: 2, attacks: ['jab'] },
  { text: 'Glisse vite à gauche ou à droite pour ESQUIVER mes crochets. Regarde d’où vient le coup !', need: 'dodges', count: 2, attacks: ['hookL', 'hookR'] },
  { text: 'Esquive AU DERNIER MOMENT : esquive parfaite ! Puis contre-attaque.', need: 'counter', count: 1, attacks: ['hookL', 'hookR', 'jab'] },
  { text: 'Ta jauge est pleine : lance le COUP DE BEC !', need: 'special', count: 1 },
];

export class FightEngine {
  constructor({ opp, game, settings, weigh = 'ok', tutorial = false, snapshot = null }) {
    this.opp = opp;
    this.tutorial = tutorial;
    this.diff = DIFFICULTY[settings.difficulty] || DIFFICULTY.normal;
    this.settings = settings;
    const s = game.stats;
    const skills = game.skills || {};
    this.mods = {
      dmg: (1 + s.force * 0.035) * (skills.cogneur ? 1.1 : 1) * (game.equipment?.gants ? 1.05 : 1),
      speed: Math.max(0.6, 1 - s.vitesse * 0.012),
      resist: Math.max(0.5, 1 - s.resistance * (weigh === 'leger' ? 1 - ECONOMY.underweightResistance : 1) * 0.012),
      crit: s.technique * 0.006,
      perfect: this.diff.perfect + s.technique * 2 + (skills.esquiveur ? 40 : 0) + (settings.latency || 0),
      counterMs: 850 + (skills.contreur ? 400 : 0),
      counterDmg: 1.25 * (skills.contreur ? 1.25 : 1),
    };
    let maxSta = 100 + s.endurance * 2 + (game.equipment?.short ? 10 : 0);
    maxSta *= 1 - (game.fatigue || 0);
    if (weigh === 'lourd') maxSta *= 1 - ECONOMY.overweightStamina;
    const maxHp = Math.round(100 + s.resistance * 3);
    this.regen = 9 + s.endurance * 0.3;

    this.now = 0;
    this.events = [];
    this.round = 1;
    this.rounds = opp.rounds;
    this.time = ROUND_MS;
    this.phase = 'intro';
    this.phaseUntil = 1600;
    this.teleMult = 1;
    this.player = { hp: maxHp, maxHp, sta: maxSta, maxSta, special: tutorial ? 0 : 0, guard: null, action: null, cdUntil: 0, kdRound: 0, kdTotal: 0, taps: 0, tapsNeeded: 0 };
    this.enemy = { hp: opp.hp, maxHp: opp.hp, state: 'idle', until: 1600 + 1200, attack: null, impactAt: 0, queue: [], enraged: false, kdRound: 0, kdTotal: 0, streak: 0, flashUntil: 0, comboN: 0 };
    this.stats = { landed: 0, perfect: 0, blocks: 0, kdGiven: 0 };
    this.roundDmg = { p: 0, e: 0 };
    this.scores = [];
    this.combo = { n: 0, last: -9999 };
    this.result = null;
    this.tut = { step: 0, n: 0, kinds: new Set(), counterArmed: false };
    if (snapshot) this.restore(snapshot);
  }

  emit(type, data = {}) { this.events.push({ type, ...data }); }
  drain() { const e = this.events; this.events = []; return e; }

  snapshot() {
    return {
      round: this.round, scores: this.scores, player: { hp: this.player.hp, sta: this.player.sta, special: this.player.special, kdTotal: this.player.kdTotal },
      enemy: { hp: this.enemy.hp, kdTotal: this.enemy.kdTotal, enraged: this.enemy.enraged }, stats: this.stats,
    };
  }

  restore(s) {
    this.round = s.round;
    this.scores = s.scores;
    Object.assign(this.player, s.player);
    Object.assign(this.enemy, s.enemy);
    this.stats = s.stats;
  }

  // ----- Entrées joueur ----------------------------------------------------
  busy() {
    const a = this.player.action;
    return a && this.now < a.until;
  }

  setGuard(level) {
    if (this.phase !== 'fight') { this.player.guard = null; return; }
    const a = this.player.action;
    if (level && a?.type === 'dodge' && this.now < a.until) return;
    this.player.guard = level;
  }

  dodge(dir) {
    if (this.phase !== 'fight') return;
    const a = this.player.action;
    if (a?.type === 'dodge' && this.now < a.until) return;
    const cost = dir === 'back' ? 4 : 6;
    if (this.player.sta < cost) { this.emit('tired'); return; }
    this.player.sta -= cost;
    this.player.guard = null;
    const dur = (dir === 'back' ? 460 : 380) * (0.8 + 0.2 * this.mods.speed);
    this.player.action = { type: 'dodge', dir, start: this.now, until: this.now + dur };
    this.emit('dodge', { dir });
  }

  punch(kind) {
    if (this.phase !== 'fight') return;
    const P = PUNCHES[kind];
    const pl = this.player;
    if (this.now < pl.cdUntil) return;
    if (kind === 'special') {
      if (pl.special < 100) return;
      pl.special = 0;
    } else if (pl.sta < P.cost) {
      this.emit('tired');
      return;
    } else {
      pl.sta -= P.cost;
    }
    pl.guard = null;
    pl.cdUntil = this.now + P.cd * this.mods.speed;
    pl.action = { type: 'punch', kind, start: this.now, until: this.now + 200, arm: (this.armToggle = !this.armToggle) ? 'l' : 'r' };
    if (this.tutorial) this.tut.kinds.add(kind);
    this.resolvePunch(kind);
  }

  resolvePunch(kind) {
    const e = this.enemy;
    const P = PUNCHES[kind];
    if (e.state === 'down') return;
    let mult = 1;
    let landed = true;
    let counter = false;
    if (kind !== 'special') {
      if (e.state === 'tele') landed = false; // il est armé : pas d'ouverture
      else if (e.state === 'idle') {
        // La garde monte quand on matraque : enchaîner sans ouverture rapporte peu.
        const block = this.tutorial ? 0 : Math.min(0.85, this.opp.block * (e.enraged ? 0.7 : 1) + 0.2 * e.streak);
        if (Math.random() < block) landed = false;
      } else if (e.state === 'stun') {
        counter = true;
        mult = this.mods.counterDmg * (kind === 'uppercut' ? 1.2 : 1);
      }
    } else if (e.state === 'stun') {
      counter = true;
      mult = this.mods.counterDmg;
    }
    // Matraquer en attente : la garde monte et l'adversaire finit par riposter.
    if (e.state === 'idle' && !this.tutorial) {
      e.streak += 1;
      if (e.streak >= 3 && Math.random() < 0.6) {
        e.streak = 0;
        this.startAttack('jab', 320, true);
      }
    }
    if (!landed) {
      this.emit('blocked', { kind });
      return;
    }
    const crit = Math.random() < this.mods.crit + (counter ? 0.15 : 0);
    let dmg = P.dmg * this.mods.dmg * mult * (crit ? 1.5 : 1) * rand(0.9, 1.1);
    if (this.tutorial) dmg *= 0.5;
    dmg = Math.round(dmg * 10) / 10;
    e.hp = Math.max(0, e.hp - dmg);
    e.flashUntil = this.now + 160;
    this.roundDmg.p += dmg;
    this.stats.landed += 1;
    this.player.special = Math.min(100, this.player.special + (kind === 'special' ? 0 : counter ? 14 : 7));
    this.combo.n = this.now - this.combo.last < 1300 ? this.combo.n + 1 : 1;
    this.combo.last = this.now;
    this.emit('hit', { kind, dmg, crit, counter, combo: this.combo.n });
    if (this.tutorial) {
      const st = TUTORIAL[this.tut.step];
      if (st?.need === 'hits') this.tutProgress();
      if (st?.need === 'variety' && (this.tut.kinds.has('crochet') || this.tut.kinds.has('uppercut')) && kind !== 'jab') this.tutProgress();
      if (st?.need === 'counter' && counter) this.tutProgress();
      if (st?.need === 'special' && kind === 'special') this.tutProgress();
    }
    if (this.opp.champion && !e.enraged && e.hp > 0 && e.hp < e.maxHp * 0.3) {
      e.enraged = true;
      this.emit('enraged');
    }
    if (e.hp <= 0) this.enemyDown();
  }

  tapGetUp() {
    if (this.phase !== 'kd_player') return;
    this.player.taps += 1;
    if (this.player.taps >= this.player.tapsNeeded) {
      const p = this.player;
      p.hp = Math.round(p.maxHp * Math.max(0.25, 0.5 - 0.1 * (p.kdTotal - 1)));
      p.sta = Math.max(p.sta, p.maxSta * 0.5);
      this.phase = 'fight';
      this.enemy.state = 'idle';
      this.enemy.until = this.now + 1200;
      this.emit('getup', { who: 'player' });
    }
  }

  // ----- Adversaire --------------------------------------------------------
  pickAttack() {
    const e = this.enemy;
    if (this.tutorial) {
      const st = TUTORIAL[this.tut.step];
      if (!st?.attacks) return null;
      return st.attacks[Math.floor(Math.random() * st.attacks.length)];
    }
    if (e.queue.length) return e.queue.shift();
    if (this.opp.signature && Math.random() < (e.enraged ? 0.35 : 0.2)) {
      e.queue = [...this.opp.signature];
      this.emit('signature', { name: this.opp.sigName });
      return e.queue.shift();
    }
    const entries = Object.entries(this.opp.attacks);
    let r = Math.random() * entries.reduce((s, [, w]) => s + w, 0);
    for (const [k, w] of entries) { r -= w; if (r <= 0) return k; }
    return entries[0][0];
  }

  teleMs(chain) {
    const base = this.opp.tele * this.diff.tele * this.teleMult * (this.enemy.enraged ? 0.8 : 1);
    return base * (chain ? 0.78 : 1) * (this.tutorial ? 1.6 : 1);
  }

  startAttack(kind, ms, quick = false) {
    const e = this.enemy;
    e.state = 'tele';
    e.attack = kind;
    e.impactAt = this.now + ms;
    e.until = e.impactAt;
    e.teleStart = this.now;
    this.emit('telegraph', { kind, quick });
  }

  resolveImpact() {
    const e = this.enemy;
    const pl = this.player;
    const A = ATTACKS[e.attack];
    const a = pl.action;
    let outcome = 'hit';
    if (a?.type === 'dodge' && this.now <= a.until + 20) {
      if (a.dir === 'back') outcome = 'avoid';
      else if (A.dodge === 'any' || A.dodge === a.dir) outcome = this.now - a.start <= this.mods.perfect ? 'perfect' : 'avoid';
    } else if (pl.guard && A.guard === pl.guard) outcome = 'block';

    if (outcome === 'hit' || outcome === 'block') {
      let dmg = A.dmg * this.opp.dmg * this.diff.dmg * this.mods.resist * rand(0.9, 1.1);
      if (outcome === 'block') dmg *= e.attack === 'jab' ? 0.1 : 0.25;
      if (this.tutorial) dmg *= 0.4;
      dmg = Math.round(dmg * 10) / 10;
      pl.hp = Math.max(this.tutorial ? Math.round(pl.maxHp * 0.3) : 0, pl.hp - dmg);
      this.roundDmg.e += dmg;
      if (outcome === 'block') { pl.sta = Math.max(0, pl.sta - 5); this.stats.blocks += 1; }
      pl.action = outcome === 'hit' ? { type: 'stagger', start: this.now, until: this.now + 350 } : pl.action;
      if (outcome === 'hit') pl.guard = null;
      this.combo.n = 0;
      this.emit(outcome === 'hit' ? 'phit' : 'pblock', { dmg, kind: e.attack });
      if (this.tutorial && outcome === 'block' && TUTORIAL[this.tut.step]?.need === 'blocks') this.tutProgress();
    } else {
      if (outcome === 'perfect') this.stats.perfect += 1;
      this.emit(outcome, { kind: e.attack });
      if (this.tutorial && TUTORIAL[this.tut.step]?.need === 'dodges') this.tutProgress();
    }

    if (pl.hp <= 0) { this.playerDown(); return; }

    if (outcome === 'perfect') {
      e.state = 'stun';
      e.queue = [];
      e.until = this.now + this.mods.counterMs;
      e.comboN = 0;
      return;
    }
    // Enchaînement : coup suivant avec un télégraphe plus court.
    const chain = e.queue.length > 0 || (!this.tutorial && e.comboN < 2 && Math.random() < this.opp.combo + (e.enraged ? 0.2 : 0));
    if (chain) {
      e.comboN += 1;
      e.state = 'gap';
      e.until = this.now + 160;
      return;
    }
    e.comboN = 0;
    e.state = 'recover';
    e.until = this.now + 500;
  }

  enemyDown() {
    const e = this.enemy;
    e.state = 'down';
    e.kdRound += 1;
    e.kdTotal += 1;
    e.queue = [];
    this.stats.kdGiven += 1;
    if (this.tutorial) {
      e.hp = e.maxHp * 0.6;
      e.state = 'idle';
      e.until = this.now + 1500;
      return;
    }
    this.phase = 'kd_enemy';
    this.phaseUntil = this.now + 3200;
    this.emit('knockdown', { who: 'enemy' });
    if (e.kdRound >= 3) this.finish(true, 'KO TECHNIQUE');
  }

  playerDown() {
    const p = this.player;
    p.kdRound += 1;
    p.kdTotal += 1;
    p.guard = null;
    p.action = null;
    this.phase = 'kd_player';
    this.phaseUntil = this.now + 6000;
    p.taps = 0;
    p.tapsNeeded = 10 + 6 * (p.kdTotal - 1);
    this.emit('knockdown', { who: 'player' });
    if (p.kdRound >= 3) this.finish(false, 'KO TECHNIQUE');
  }

  finish(win, method) {
    if (this.result) return;
    this.result = { win, method, rounds: this.round, stats: this.stats, scores: this.scores };
    this.phase = 'over';
    this.emit('over', this.result);
  }

  endRound() {
    const { p, e } = this.roundDmg;
    let sp = 10, se = 10;
    if (p > e * 1.05) se = 9; else if (e > p * 1.05) sp = 9;
    sp -= this.player.kdRound; se -= this.enemy.kdRound;
    this.scores.push({ p: Math.max(7, sp), e: Math.max(7, se) });
    this.emit('bell');
    if (this.round >= this.rounds) {
      const tp = this.scores.reduce((s, x) => s + x.p, 0);
      const te = this.scores.reduce((s, x) => s + x.e, 0);
      this.finish(tp > te, tp > te ? 'DÉCISION AUX POINTS' : tp === te ? 'MATCH NUL (DÉCISION)' : 'DÉCISION AUX POINTS');
      return;
    }
    this.phase = 'corner';
    this.emit('corner');
  }

  // Choix du coin : soigner, récupérer, écouter le coach.
  corner(choice) {
    const p = this.player;
    p.sta = Math.min(p.maxSta, p.sta + p.maxSta * 0.3);
    if (choice === 'soigner') p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.25);
    if (choice === 'recuperer') p.sta = Math.min(p.maxSta, p.sta + p.maxSta * 0.4);
    this.teleMult = choice === 'coach' ? 1.25 : 1;
    this.round += 1;
    this.time = ROUND_MS;
    this.roundDmg = { p: 0, e: 0 };
    this.player.kdRound = 0;
    this.enemy.kdRound = 0;
    this.player.guard = null;
    this.player.action = null;
    this.enemy.state = 'idle';
    this.enemy.queue = [];
    this.phase = 'intro';
    this.phaseUntil = this.now + 1400;
    this.enemy.until = this.phaseUntil + 1000;
  }

  tutProgress() {
    const st = TUTORIAL[this.tut.step];
    this.tut.n += 1;
    this.emit('tutstep');
    if (this.tut.n >= st.count) {
      this.tut.step += 1;
      this.tut.n = 0;
      this.enemy.state = 'idle';
      this.enemy.until = this.now + 1500;
      if (TUTORIAL[this.tut.step]?.need === 'special') this.player.special = 100;
      if (this.tut.step >= TUTORIAL.length) this.finish(true, 'SPARRING TERMINÉ');
    }
  }

  // ----- Boucle ------------------------------------------------------------
  update(dt) {
    dt = Math.min(dt, 200);
    this.now += dt;
    const pl = this.player;
    const e = this.enemy;

    if (this.phase === 'intro') {
      if (this.now >= this.phaseUntil) { this.phase = 'fight'; this.emit('bell'); this.emit('fight'); }
      return;
    }
    if (this.phase === 'kd_enemy') {
      if (this.now >= this.phaseUntil) {
        if (e.kdTotal > this.opp.getUps) this.finish(true, 'KO');
        else {
          e.hp = Math.round(e.maxHp * Math.max(0.25, 0.6 - 0.15 * (e.kdTotal - 1)));
          e.state = 'idle';
          e.until = this.now + 900;
          this.phase = 'fight';
          this.emit('getup', { who: 'enemy' });
        }
      }
      return;
    }
    if (this.phase === 'kd_player') {
      if (this.now >= this.phaseUntil) this.finish(false, 'KO');
      return;
    }
    if (this.phase !== 'fight') return;

    if (!this.tutorial) {
      this.time -= dt;
      if (this.time <= 0) { this.time = 0; this.endRound(); return; }
    }

    // Endurance : récupération plus lente sous la garde.
    const busy = this.busy();
    const regen = this.regen * (pl.guard ? 0.5 : 1) * (busy ? 0.3 : 1);
    pl.sta = Math.min(pl.maxSta, pl.sta + (regen * dt) / 1000);

    if (this.now < e.until) return;
    switch (e.state) {
      case 'idle':
      case 'gap': {
        const kind = this.pickAttack();
        if (!kind) { e.until = this.now + 500; e.state = 'idle'; break; }
        this.startAttack(kind, this.teleMs(e.state === 'gap'));
        break;
      }
      case 'tele':
        this.resolveImpact();
        break;
      case 'recover':
      case 'stun': {
        e.state = 'idle';
        e.streak = 0;
        const [a, b] = this.opp.idle;
        e.until = this.now + rand(a, b) * this.diff.idle * (e.enraged ? 0.6 : 1);
        break;
      }
      default:
        break;
    }
  }
}
