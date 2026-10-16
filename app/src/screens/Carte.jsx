import { useState } from 'react';
import { useGame } from '../game/store.jsx';
import { CATEGORIES, OPPONENTS } from '../data/data.js';
import { nextOpponent } from '../game/rules.js';
import { Fighter } from '../components/Characters.jsx';
import { BackIcon, GearIcon } from '../components/Ui.jsx';

function BeltIcon({ color, plate }) {
  return (
    <svg aria-hidden="true" width="70" height="32" viewBox="0 0 70 32">
      <rect x="1.5" y="10" width="67" height="12" fill={color} stroke="var(--ink)" strokeWidth="2.5" />
      <ellipse cx="35" cy="16" rx="15" ry="13" fill={plate} stroke="var(--ink)" strokeWidth="2.5" />
    </svg>
  );
}

export default function Carte() {
  const { game, go, setModal } = useGame();
  const [view, setView] = useState(Math.min(game.catIndex, CATEGORIES.length - 1));
  const cat = CATEGORIES[view];
  const next = nextOpponent(game);
  const mvpDone = !CATEGORIES[game.catIndex].mvp;

  const catState = (i) => {
    const c = CATEGORIES[i];
    if (game.belts.includes(c.id)) return 'won';
    if (i === game.catIndex && c.mvp) return 'current';
    if (!c.mvp) return 'soon';
    return 'locked';
  };

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" aria-label="Retour au menu" onClick={() => go('title')}><BackIcon /></button>
        <div className="title" style={{ fontSize: 19 }}>LA ROUTE DES CEINTURES</div>
        <div style={{ flex: 1 }} />
        <div className="t" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{game.belts.length}/6 CEINTURES · RÉP. {game.reputation}</div>
        <button className="btn" style={{ fontSize: 12, position: 'relative', padding: '0 8px' }} onClick={() => setModal('skills')}>
          COMPÉTENCES
          {game.skillPoints > 0 && <span className="tag" style={{ position: 'absolute', right: -8, top: -10, background: 'var(--lime)', fontSize: 11 }}>+{game.skillPoints}</span>}
        </button>
        <button className="icon-btn" aria-label="Options" onClick={() => setModal('options')}><GearIcon /></button>
      </div>

      <div style={{ height: 128, flexShrink: 0, display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8 }}>
        {CATEGORIES.map((c, i) => {
          const st = catState(i);
          const sel = i === view;
          const clickable = st === 'won' || st === 'current' || st === 'soon';
          return (
            <button
              key={c.id}
              onClick={() => clickable && setView(i)}
              aria-pressed={sel}
              className={st === 'current' ? '' : 'tone'}
              style={{
                position: 'relative', border: sel ? '5px solid var(--accent)' : '3px solid var(--ink)', cursor: clickable ? 'pointer' : 'default',
                backgroundColor: 'var(--panel)', backgroundImage: st === 'current' ? 'repeating-conic-gradient(from 0deg at 50% 40%, var(--ink) 0deg 0.9deg, var(--lime) 0.9deg 7deg)' : undefined,
                padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textAlign: 'center', overflow: 'hidden', color: 'var(--ink)',
              }}
            >
              <BeltIcon color={c.beltColor} plate={st === 'won' ? 'var(--lime)' : st === 'current' ? 'var(--accent)' : 'var(--panel)'} />
              <div className="t" style={{ background: 'var(--panel)', padding: '0 4px', fontSize: 12 }}>{c.short}</div>
              <div className="t" style={{ background: 'var(--ink)', color: 'var(--panel)', padding: '0 5px', fontSize: 11, lineHeight: 1.35 }}>{c.kg}</div>
              <div style={{ background: 'var(--panel)', padding: '0 4px', fontSize: 11, lineHeight: 1.2 }}>{c.belt}</div>
              <div style={{ flex: 1 }} />
              <div className="t" style={{
                padding: '0 6px', fontSize: 11,
                background: st === 'current' ? 'var(--accent)' : st === 'won' ? 'var(--lime)' : 'var(--ink)',
                color: st === 'current' ? 'var(--on-accent)' : st === 'won' ? '#111' : 'var(--panel)',
              }}>
                {{ current: 'EN COURS', won: '✓ CEINTURE', locked: 'VERROUILLÉ', soon: 'BIENTÔT' }[st]}
              </div>
            </button>
          );
        })}
      </div>

      <div className="box" style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <div className="t" style={{ fontSize: 18 }}>{cat.short}</div>
          {game.pendingFight && (
            <button className="btn btn-lime" style={{ minHeight: 30, fontSize: 13 }} onClick={() => go('combat', { oppId: game.pendingFight.oppId, exhibition: game.pendingFight.exhibition, weigh: game.pendingFight.weigh, resume: true, n: Date.now() })}>
              ▶ REPRENDRE LE COMBAT (ROUND {game.pendingFight.snapshot.round + 1})
            </button>
          )}
          <div style={{ fontSize: 13 }}>
            {cat.opponents ? `${cat.opponents.filter((o) => game.beaten[o]).length} combats sur 4` : 'Hors MVP · arrive après le lancement'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, flex: 1, minHeight: 0 }}>
          {cat.opponents ? cat.opponents.map((id, i) => {
            const o = OPPONENTS[id];
            const beaten = !!game.beaten[id];
            const isNext = next?.id === id && view === game.catIndex;
            if (o.champion) {
              const known = beaten || isNext;
              return (
                <div key={id} className="tone" style={{ flex: 1.3, position: 'relative', border: `3px ${known ? 'solid' : 'dashed'} var(--ink)`, backgroundColor: isNext ? 'var(--accent)' : 'var(--panel)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px', overflow: 'hidden' }}>
                  <div style={{ width: 58, height: 72, flexShrink: 0, filter: known ? 'none' : 'brightness(0)' }}>
                    <Fighter look={o.look} size={72} />
                  </div>
                  <div>
                    <div className="t" style={{ background: 'var(--panel)', padding: '0 4px', fontSize: 14, lineHeight: 1.3 }}>{known ? o.name : 'CHAMPION ???'}</div>
                    <div style={{ background: 'var(--panel)', padding: '0 4px', fontSize: 12 }}>{beaten ? '✓ Ceinture gagnée' : isNext ? 'Combat pour la ceinture !' : 'Verrouillé'}</div>
                  </div>
                  <div className="sfx-text" aria-hidden="true" style={{ position: 'absolute', right: 6, top: 4, transform: 'rotate(10deg)', fontSize: 18, textShadow: '-1.5px -1.5px 0 var(--ink), 1.5px -1.5px 0 var(--ink), -1.5px 1.5px 0 var(--ink), 1.5px 1.5px 0 var(--ink)' }}>ドキドキ</div>
                </div>
              );
            }
            return (
              <button
                key={id}
                disabled={!beaten}
                title={beaten ? 'Rejouer en exhibition (petite prime)' : undefined}
                onClick={() => beaten && go('pesee', { oppId: id, exhibition: true })}
                className={isNext ? '' : 'tone-cyan'}
                style={{ flex: 1, border: '3px solid var(--ink)', backgroundColor: isNext ? 'var(--lime)' : 'var(--panel)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: beaten ? 'pointer' : 'default', color: 'var(--ink)', opacity: !beaten && !isNext ? 0.7 : 1, padding: 2 }}
              >
                <div style={{ width: 46, height: 58, overflow: 'hidden' }}><Fighter look={o.look} size={58} /></div>
                <div className="t" style={{ background: 'var(--panel)', padding: '0 6px', fontSize: 14, lineHeight: 1.3 }}>{o.name}</div>
                <div style={{ background: 'var(--ink)', color: 'var(--panel)', padding: '0 6px', fontSize: 11 }}>
                  {beaten ? '✓ Gagné · exhibition' : isNext ? 'Prochain' : `Combat ${i + 1}`}
                </div>
              </button>
            );
          }) : (
            <div className="tone" style={{ flex: 1, border: '3px dashed var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: 8, gap: 8 }}>
              {cat.preview.map((n) => (
                <div key={n} className="t" style={{ background: 'var(--panel)', border: '2px solid var(--ink)', padding: '4px 8px', fontSize: 13, textAlign: 'center' }}>{n}</div>
              ))}
            </div>
          )}
          {mvpDone ? (
            <div className="box" style={{ width: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 8, fontSize: 13, background: 'var(--lime)', color: '#111' }}>
              Fin du MVP : deux ceintures ! Les catégories 3 à 6 arrivent en production.
            </div>
          ) : (
            <button className="btn btn-accent" style={{ width: 150, fontSize: 17, boxShadow: '4px 4px 0 var(--cyan)', padding: '0 6px' }} onClick={() => go('salle')}>
              À LA SALLE !
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
