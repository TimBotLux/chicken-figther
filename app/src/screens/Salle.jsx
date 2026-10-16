import { useState } from 'react';
import { useGame } from '../game/store.jsx';
import { ECONOMY, MINIGAMES, STATS } from '../data/data.js';
import { applySession, currentCategory, fmtKg, healthySessions, nextOpponent, palierOf, payForSession, sessionCost, statTotal, weighIn } from '../game/rules.js';
import Poulet from '../components/Poulet.jsx';
import { BackIcon, Bolt, Popups, usePopups } from '../components/Ui.jsx';
import { sfx } from '../game/sfx.js';

export function WeightBox({ game, cat, compact }) {
  const st = weighIn(game.weight, cat);
  const msg = {
    ok: 'Pesée OK si tu t’arrêtes là',
    lourd: 'Trop lourd ! Corde à sauter pour redescendre',
    leger: 'Trop léger : soulève de la fonte pour prendre du muscle',
  }[st];
  return (
    <div className="double" style={{ padding: compact ? '2px 8px' : '4px 8px', background: st === 'ok' ? 'transparent' : 'var(--accent)', color: st === 'ok' ? 'var(--ink)' : 'var(--on-accent)' }}>
      <div className="t" style={{ fontSize: 13 }}>{fmtKg(game.weight)} KG · {cat.short.replace('POIDS ', '')} {fmtKg(cat.min)}–{fmtKg(cat.max)} KG</div>
      <div style={{ fontSize: 12 }}>{msg}</div>
    </div>
  );
}

export default function Salle() {
  const { game, update, go, setModal } = useGame();
  const [confirm, setConfirm] = useState(null);
  const [popups, addPopup] = usePopups();
  const cat = currentCategory(game);
  const opp = nextOpponent(game);
  const pal = palierOf(game.stats);
  const max = healthySessions(game);
  const left = Math.max(0, max - game.cycle.sessions);
  const cost = sessionCost(game);
  const tired = game.cycle.sessions >= max;
  const total = statTotal(game.stats);

  const start = (mg, mode) => {
    if (game.primes < cost) return;
    if (tired && confirm?.id !== mg.id) { setConfirm({ id: mg.id, mode }); return; }
    setConfirm(null);
    sfx.click();
    if (mode === 'sim') {
      update((g) => { payForSession(g); applySession(g, mg, ECONOMY.simRatio); });
      const gain = Math.round(Math.max(0.3, ECONOMY.maxGain * ECONOMY.simRatio) * (game.supplementActive ? 1.5 : 1) * 10) / 10;
      sfx.good();
      addPopup({ text: `+${String(gain).replace('.', ',')}`, sub: `${STATS.find((s) => s.key === mg.stat).name} (simulation 70 %)`, x: 380, y: 150, size: 44, color: mg.color, ms: 1400 });
      return;
    }
    update((g) => payForSession(g));
    go('minigame', { id: mg.id, n: Date.now() });
  };

  return (
    <div className="screen">
      <div className="topbar" style={{ paddingLeft: 2 }}>
        <button className="icon-btn" aria-label="Retour à la carte" onClick={() => go('carte')}><BackIcon /></button>
        <div className="title" style={{ paddingLeft: 0 }}>LA SALLE</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} aria-label={`Énergie ${left} sur ${max}`}>
          <div className="t" style={{ fontSize: 13, marginRight: 6 }}>ÉNERGIE</div>
          {Array.from({ length: max }, (_, i) => <Bolt key={i} fill={i < left ? 'var(--lime)' : 'none'} />)}
          <div className="t" style={{ fontSize: 13, marginLeft: 4 }}>{left}/{max}</div>
        </div>
        <div className="chip">{game.primes} PRIMES</div>
        <button className="btn" style={{ fontSize: 14 }} onClick={() => setModal('shop')}>BOUTIQUE</button>
        <button className="btn btn-accent" style={{ fontSize: 15, borderColor: 'var(--panel)' }} disabled={!opp} onClick={() => opp && go('pesee', { oppId: opp.id })}>PESÉE</button>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
        <div className="box" style={{ width: 252, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="speedlines" style={{ width: 104, height: 146, flexShrink: 0, border: '3px solid var(--ink)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              <Poulet palier={pal.n} size={130} />
              <div className="t" style={{ position: 'absolute', left: 0, top: 0, padding: '0 6px', background: 'var(--lime)', color: '#111', borderRight: '2px solid var(--ink)', borderBottom: '2px solid var(--ink)', fontSize: 11 }}>PALIER {pal.n}/5</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
              {STATS.map((s) => (
                <div key={s.key} title={s.effect} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>{s.name}</span><span className="t">{Math.floor(game.stats[s.key])}</span></div>
                  <div className="gauge" style={{ height: 8, borderWidth: 2 }}><i style={{ width: `${Math.min(100, game.stats[s.key] * 4)}%`, background: s.color }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.3 }}>
            {pal.name} · total {total}{pal.n < 5 ? ` · palier suivant à ${[40, 80, 140, 220][pal.n - 1]}` : ''}
            {game.fatigue > 0 && <><br /><span style={{ color: 'var(--accent)' }}>Fatigue : −{Math.round(game.fatigue * 100)} % d’endurance au prochain combat</span></>}
          </div>
          <div style={{ flex: 1 }} />
          {game.supplements > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={game.supplementActive} onChange={(e) => update((g) => { g.supplementActive = e.target.checked; })} style={{ width: 20, height: 20 }} />
              Boire un shake (+50 %) · {game.supplements} en stock
            </label>
          )}
          <WeightBox game={game} cat={cat} />
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, padding: '0 8px' }}>
          {MINIGAMES.map((mg) => {
            const stat = STATS.find((s) => s.key === mg.stat);
            const canSim = !!game.simUnlocked[mg.id];
            const broke = game.primes < cost;
            const ask = confirm?.id === mg.id;
            return (
              <div key={mg.id} className="box" style={{ transform: 'skewX(-4deg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className={mg.id === 'bag' ? '' : mg.id === 'bench' ? 'tone-accent' : 'tone-lime'} style={{ height: 86, position: 'relative', borderBottom: '3px solid var(--ink)', backgroundColor: 'var(--panel)', backgroundImage: mg.id === 'bag' ? 'repeating-conic-gradient(from 0deg at 30% 50%, var(--ink) 0deg 0.8deg, var(--cyan) 0.8deg 7deg)' : undefined, overflow: 'hidden' }}>
                  <svg aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: 20, background: 'var(--panel)', border: '2.5px solid var(--ink)', padding: 3 }}><path d={mg.icon} /></svg>
                  <div className="sfx-text" aria-hidden="true" style={{ position: 'absolute', right: 10, top: 8, transform: 'rotate(-8deg)', fontSize: 34, color: mg.color }}>{mg.sfx}</div>
                  <div className="gloss" aria-hidden="true" style={{ position: 'absolute', right: 12, top: 50, fontSize: 11 }}>{mg.gloss}</div>
                  <div className="t" style={{ position: 'absolute', right: 0, bottom: 0, padding: '0 8px', background: 'var(--ink)', color: 'var(--panel)', fontSize: 12 }}>+ {stat.name.toUpperCase()}</div>
                </div>
                <div style={{ padding: '6px 12px 6px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1, transform: 'skewX(4deg)' }}>
                  <div className="t" style={{ fontSize: 15 }}>{mg.title}</div>
                  <div style={{ fontSize: 12 }}>{mg.kind} · {mg.duration} s</div>
                  <div style={{ fontSize: 12 }}>{cost === 0 ? 'Gratuit (1re séance)' : `${cost} primes`}{tired ? ' · fatigue' : ''}</div>
                  <div style={{ flex: 1 }} />
                  {ask ? (
                    <div style={{ fontSize: 11, lineHeight: 1.25, background: 'var(--accent)', color: 'var(--on-accent)', padding: 4, border: '2px solid var(--ink)' }}>
                      Énergie épuisée : −10 % d’endurance au prochain combat.
                      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                        <button className="btn" style={{ minHeight: 32, fontSize: 12, flex: 1, padding: 0 }} onClick={() => start(mg, confirm.mode)}>OK</button>
                        <button className="btn" style={{ minHeight: 32, fontSize: 12, flex: 1, padding: 0 }} onClick={() => setConfirm(null)}>Non</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="btn btn-ink" style={{ fontSize: 17 }} disabled={broke} onClick={() => start(mg, 'play')}>JOUER</button>
                      <button className="link" disabled={!canSim || broke} title={canSim ? '' : 'Réussis ce mini-jeu une fois pour débloquer la simulation'} onClick={() => start(mg, 'sim')}>
                        {canSim ? 'Simulation rapide (70 %)' : 'Simulation : réussis-le une fois'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {game.primes < cost && (
        <div className="tag" style={{ position: 'absolute', left: 280, bottom: 14, background: 'var(--accent)', zIndex: 3 }}>
          Plus assez de primes : va à la pesée, ou rejoue un challenger battu en exhibition depuis la carte.
        </div>
      )}
      <Popups items={popups} />
    </div>
  );
}
