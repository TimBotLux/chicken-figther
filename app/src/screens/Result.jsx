import { useGame } from '../game/store.jsx';
import { PALIERS } from '../data/data.js';
import { palierOf, xpForLevel } from '../game/rules.js';
import Poulet from '../components/Poulet.jsx';
import { Coach } from '../components/Characters.jsx';
import { Burst } from '../components/Ui.jsx';

export default function Result({ summary: s }) {
  const { game, go, setModal } = useGame();
  const pal = palierOf(game.stats);
  const fmt = (n) => String(Math.round(n * 10) / 10).replace('.', ',');

  return (
    <div className="screen">
      <div className="topbar" style={{ padding: '0 16px' }}>
        <div className="title" style={{ fontSize: 26, paddingLeft: 0, color: s.win ? 'var(--lime)' : 'var(--accent)' }}>{s.win ? 'VICTOIRE !' : 'DÉFAITE…'}</div>
        <div className="sub" style={{ fontSize: 15 }}>{s.method} · contre {s.opp.short}{s.exhibition ? ' (exhibition)' : ''}</div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
        <div className="box rise" style={{ width: 330, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div className="t" style={{ fontSize: 16 }}>PRIMES</div>
          {s.lines.map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>{l}</span><span className="t" style={{ color: v < 0 ? 'var(--accent)' : 'var(--ink)' }}>{v > 0 ? '+' : ''}{v}</span></div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '3px solid var(--ink)', paddingTop: 4 }}><span className="t" style={{ fontSize: 14 }}>TOTAL</span><span className="t" style={{ fontSize: 14 }}>{s.prime} · solde {game.primes}</span></div>
          <div className="t" style={{ fontSize: 16, marginTop: 4 }}>PROGRESSION</div>
          <div style={{ fontSize: 13 }}>+{s.xp} XP · niveau {game.level} ({game.xp}/{xpForLevel(game.level)})</div>
          {s.levelUps > 0 && <div className="tag" style={{ background: 'var(--lime)', alignSelf: 'flex-start' }}>NIVEAU SUPÉRIEUR ! +{s.levelUps} point de compétence</div>}
          <div style={{ fontSize: 13 }}>Expérience du ring : +{fmt(s.ringGain.resistance)} résistance, +{fmt(s.ringGain.technique)} technique</div>
          <div style={{ fontSize: 13 }}>L’énergie de la salle est rechargée.</div>
          {s.scores?.length > 0 && <div style={{ fontSize: 12 }}>Cartes des juges : {s.scores.map((x) => `${x.p}-${x.e}`).join(' · ')}</div>}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            {game.skillPoints > 0 && <button className="btn btn-lime" style={{ flex: 1, fontSize: 13 }} onClick={() => setModal('skills')}>COMPÉTENCES</button>}
            <button className="btn btn-accent" style={{ flex: 1 }} onClick={() => go('carte')}>CONTINUER</button>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', border: '3px solid var(--ink)', overflow: 'hidden', background: s.win ? 'repeating-conic-gradient(from 0deg at 50% 50%, var(--ink) 0deg 0.8deg, var(--lime) 0.8deg 7deg)' : 'repeating-conic-gradient(from 0deg at 50% 50%, var(--ink) 0deg 0.8deg, var(--panel) 0.8deg 7deg)' }}>
          {s.belt ? (
            <>
              <div style={{ position: 'absolute', left: 30, bottom: -30 }}><Poulet palier={pal.n} size={250} /></div>
              <div className="rise" style={{ position: 'absolute', right: 20, top: 30, width: 250, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <svg aria-hidden="true" width="210" height="90" viewBox="0 0 70 32"><rect x="1.5" y="10" width="67" height="12" fill={s.belt.beltColor} stroke="var(--ink)" strokeWidth="2" /><ellipse cx="35" cy="16" rx="15" ry="13" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2" /><path d="M35 8 L37 14 L43 14 L38 18 L40 24 L35 20 L30 24 L32 18 L27 14 L33 14 Z" fill="var(--lime)" stroke="var(--ink)" strokeWidth="1" /></svg>
                <div className="sfx-text" style={{ fontSize: 30, color: 'var(--lime)', textAlign: 'center' }}>{s.belt.belt.toUpperCase()} !</div>
                {s.unlocked && <div className="box" style={{ padding: '4px 10px', fontSize: 13, textAlign: 'center' }}>{s.unlocked.mvp ? `${s.unlocked.name} débloqué : fourchette ${String(s.unlocked.min).replace('.', ',')}–${String(s.unlocked.max).replace('.', ',')} kg. Prends du muscle !` : 'Fin du MVP : les catégories suivantes arrivent en production.'}</div>}
              </div>
            </>
          ) : s.newPalier ? (
            <>
              <div style={{ position: 'absolute', left: 20, bottom: -26, opacity: 0.55, filter: 'grayscale(0.6)' }}><Poulet palier={s.palierBefore} size={210} /></div>
              <div className="sfx-text" style={{ position: 'absolute', left: 196, top: 150, fontSize: 40 }}>→</div>
              <div className="rise" style={{ position: 'absolute', left: 240, bottom: -30 }}><Poulet palier={s.newPalier} size={260} /></div>
              <Burst size={150} fill="var(--accent)" style={{ position: 'absolute', right: 10, top: 10, transform: 'rotate(8deg)' }} textStyle={{ fontSize: 17, color: 'var(--on-accent)', lineHeight: 1.1 }}>NOUVEAU<br />PALIER !<br />{PALIERS[s.newPalier - 1].name.toUpperCase()}</Burst>
              <div className="gloss" style={{ position: 'absolute', right: 16, bottom: 12 }}>+1,5 kg de muscle</div>
            </>
          ) : s.win ? (
            <>
              <div style={{ position: 'absolute', left: 120, bottom: -30 }}><Poulet palier={pal.n} size={260} /></div>
              <div className="sfx-text" style={{ position: 'absolute', right: 30, top: 30, fontSize: 56, transform: 'rotate(10deg)' }}>コケコッコー！</div>
              <div className="gloss" style={{ position: 'absolute', right: 40, top: 96 }}>COCORICO !</div>
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', left: 16, bottom: 16 }}><Coach size={120} bg="#FFC93C" /></div>
              <div className="bubble" style={{ position: 'absolute', left: 150, top: 24, width: 280 }}>
                On ne gagne pas à tous les coups, gamin. Ta 1re séance de salle est gratuite, et tu peux rejouer un challenger battu en exhibition pour quelques primes.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
