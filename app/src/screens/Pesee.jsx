import { useGame } from '../game/store.jsx';
import { OPPONENTS } from '../data/data.js';
import { categoryOfOpponent, fmtKg, palierOf, weighIn } from '../game/rules.js';
import Poulet from '../components/Poulet.jsx';
import { Fighter } from '../components/Characters.jsx';
import { sfx } from '../game/sfx.js';

const NARRATION = {
  rat: '« Rattrapage » n’a jamais perdu une revanche. Ce soir, il défend la Ceinture de Grain… et il a déjà réservé ta place à l’infirmerie.',
  cocorico: '« Cocorico » se moque de toi depuis ton premier combat. Champion poids plume, il a ton bec, tes gants… et toute ton arrogance.',
};

export default function Pesee({ oppId, exhibition }) {
  const { game, go } = useGame();
  const opp = OPPONENTS[oppId];
  const cat = categoryOfOpponent(oppId);
  const w = game.weight;
  const st = exhibition ? 'ok' : weighIn(w, cat);
  const lo = cat.scaleMin ?? cat.min - 2;
  const hi = cat.scaleMax ?? cat.max + 2;
  const pct = (x) => Math.max(0, Math.min(100, ((x - lo) / (hi - lo)) * 100));
  const stamp = { ok: 'VALIDÉ !', lourd: 'TROP LOURD !', leger: 'TROP LÉGER !' }[st];
  const consequence = exhibition
    ? 'Combat d’exhibition : pas de pesée officielle, petite prime.'
    : {
      ok: 'Dans la fourchette : aucun malus.',
      lourd: `Au-dessus de ${fmtKg(cat.max)} kg : −50 % sur la prime et −15 % d’endurance.`,
      leger: `Sous ${fmtKg(cat.min)} kg : −15 % de résistance pour ce combat.`,
    }[st];

  return (
    <div className="screen">
      <div className="topbar" style={{ padding: '0 16px' }}>
        <div className="title" style={{ fontSize: 26, paddingLeft: 0 }}>LA PESÉE !</div>
        <div className="sub" style={{ fontSize: 15 }}>
          {cat.name} (limite {fmtKg(cat.max)} kg) · {exhibition ? 'exhibition' : opp.champion ? `combat pour la ${cat.belt}` : `${opp.rounds} rounds`}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', border: '3px solid var(--ink)', overflow: 'hidden', minHeight: 0 }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, clipPath: 'polygon(0 0, 54% 0, 46% 100%, 0 100%)', background: 'repeating-conic-gradient(from 0deg at 20% 62%, var(--ink) 0deg 0.8deg, var(--panel) 0.8deg 6deg)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, clipPath: 'polygon(54% 0, 100% 0, 100% 100%, 46% 100%)', backgroundColor: 'var(--accent)', backgroundImage: 'radial-gradient(rgba(0,0,0,0.45) 1.6px, transparent 1.8px)', backgroundSize: '7px 7px' }} />
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}><path d="M54 0 L46 100" stroke="var(--ink)" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 6 }} /></svg>

        <div style={{ position: 'absolute', left: 70, bottom: -34 }}><Poulet palier={palierOf(game.stats).n} size={220} /></div>
        <div style={{ position: 'absolute', right: 70, bottom: -34 }}><Fighter look={opp.look} size={220 * opp.size} /></div>

        <div className="box shadow-accent" style={{ position: 'absolute', left: 10, top: 10 }}>
          <div className="t" style={{ background: 'var(--ink)', color: 'var(--panel)', fontSize: 12, padding: '0 8px' }}>POULET</div>
          <div className="t" style={{ fontSize: 24, padding: '0 10px', lineHeight: 1.3 }}>{fmtKg(w)} kg</div>
        </div>
        <div className="t vertical" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 34, background: 'var(--ink)', color: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, letterSpacing: 2 }}>
          {opp.name} · {fmtKg(opp.weight)} KG
        </div>
        <div className="sfx-text" aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 36, textAlign: 'center', fontSize: 72, color: 'var(--lime)', textShadow: '-3px -3px 0 var(--ink), 3px -3px 0 var(--ink), -3px 3px 0 var(--ink), 3px 3px 0 var(--ink), 6px 6px 0 var(--cyan)', transform: 'rotate(-6deg)' }}>VS</div>
        <div className="sfx-text vertical" aria-hidden="true" style={{ position: 'absolute', left: 470, top: 18, fontSize: 26, letterSpacing: -2, color: 'var(--cyan)' }}>ゴゴゴゴ</div>
        {opp.champion && !exhibition && NARRATION[opp.id] && (
          <div className="box rise" style={{ position: 'absolute', left: 250, top: 120, width: 210, padding: '6px 10px', fontSize: 12, lineHeight: 1.35, borderWidth: 3, boxShadow: '3px 3px 0 var(--ink)' }}>
            {NARRATION[opp.id]}
          </div>
        )}
      </div>

      <div style={{ height: 94, flexShrink: 0, display: 'flex', gap: 8 }}>
        <div className="box" style={{ flex: 1, padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span>{fmtKg(lo)} kg</span><span>{cat.name} : {fmtKg(cat.min)} – {fmtKg(cat.max)} kg</span><span>{fmtKg(hi)} kg</span>
          </div>
          <div style={{ position: 'relative', height: 22, border: '3px solid var(--ink)', background: 'var(--panel)' }}>
            <div style={{ position: 'absolute', left: `${pct(cat.min)}%`, width: `${pct(cat.max) - pct(cat.min)}%`, top: 0, bottom: 0, backgroundColor: 'var(--cyan)', backgroundImage: 'radial-gradient(var(--tone) 1px, transparent 1.2px)', backgroundSize: '5px 5px' }} />
            <div style={{ position: 'absolute', left: `${pct(cat.max)}%`, top: 0, bottom: 0, width: 3, background: 'var(--accent)' }} />
            <div style={{ position: 'absolute', left: `${pct(w)}%`, top: -9, width: 5, height: 34, marginLeft: -2, background: 'var(--ink)' }} />
          </div>
          <div style={{ fontSize: 13 }}>{consequence}</div>
        </div>
        <div className="box" style={{ width: 170, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="t" style={{ border: `4px solid ${st === 'ok' ? 'var(--ink)' : 'var(--accent)'}`, color: st === 'ok' ? 'var(--ink)' : 'var(--accent)', padding: '2px 10px', fontSize: 20, lineHeight: 1.2, transform: 'rotate(-8deg)', animation: 'stampIn 0.35s ease-out' }}>{stamp}</div>
        </div>
        <div style={{ width: 170, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-accent" style={{ flex: 1, fontSize: 20, boxShadow: '3px 3px 0 var(--lime)' }} onClick={() => { sfx.bell(); go('combat', { oppId, exhibition: !!exhibition, weigh: st, n: Date.now() }); }}>AU RING !</button>
          <button className="btn" style={{ minHeight: 34, height: 34, fontSize: 13, fontFamily: 'var(--text)' }} onClick={() => go(exhibition ? 'carte' : 'salle')}>{exhibition ? 'Retour à la carte' : 'Retour à la salle'}</button>
        </div>
      </div>
    </div>
  );
}
