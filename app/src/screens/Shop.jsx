import { useGame } from '../game/store.jsx';
import { SHOP, SKILLS } from '../data/data.js';
import { Modal } from '../components/Ui.jsx';
import { sfx } from '../game/sfx.js';

// Boutique réduite du MVP : tout s'achète avec les primes gagnées en combat, jamais en euros.
export function Shop({ onClose }) {
  const { game, buy } = useGame();
  const owned = (it) => (it.kind === 'equip' ? game.equipment[it.id] : it.kind === 'upgrade' ? (game.equipment.salle || 0) >= it.max : false);
  return (
    <Modal title="BOUTIQUE" onClose={onClose}>
      <div style={{ fontSize: 12 }}>Solde : <span className="t">{game.primes} primes</span> · tout se paie avec les primes des combats.</div>
      {SHOP.map((it) => {
        const has = owned(it);
        return (
          <div key={it.id} className="box" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px' }}>
            <div style={{ flex: 1 }}>
              <div className="t" style={{ fontSize: 15 }}>{it.name}{it.id === 'supplement' && game.supplements > 0 ? ` (×${game.supplements})` : ''}{it.id === 'salle' && game.equipment.salle ? ` (${game.equipment.salle}/${it.max})` : ''}</div>
              <div style={{ fontSize: 12 }}>{it.desc}</div>
            </div>
            <button className="btn btn-ink" style={{ minWidth: 120, fontSize: 14 }} disabled={has || game.primes < it.price} onClick={() => { sfx.good(); buy(it.id); }}>
              {has ? 'ACQUIS' : `${it.price} PRIMES`}
            </button>
          </div>
        );
      })}
    </Modal>
  );
}

export function Skills({ onClose }) {
  const { game, update } = useGame();
  return (
    <Modal title="COMPÉTENCES" onClose={onClose}>
      <div style={{ fontSize: 12 }}>Niveau {game.level} · <span className="t">{game.skillPoints} point{game.skillPoints > 1 ? 's' : ''}</span> à dépenser. L’XP de combat donne des points ; choisis ton style.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {SKILLS.map((s) => {
          const has = !!game.skills[s.id];
          return (
            <div key={s.id} className={has ? '' : 'tone'} style={{ border: '3px solid var(--ink)', background: has ? 'var(--lime)' : 'var(--panel)', color: has ? '#111' : 'var(--ink)', padding: 10, display: 'flex', flexDirection: 'column', gap: 6, transform: 'skewX(-4deg)' }}>
              <div className="t" style={{ fontSize: 18 }}>{s.name.toUpperCase()}</div>
              <div style={{ fontSize: 13, background: has ? 'transparent' : 'var(--panel)' }}>{s.perk}</div>
              <div style={{ fontSize: 12, flex: 1, background: has ? 'transparent' : 'var(--panel)' }}>{s.desc}</div>
              <button className="btn btn-accent" style={{ fontSize: 13 }} disabled={has || game.skillPoints < 1} onClick={() => { sfx.good(); update((g) => { g.skills[s.id] = true; g.skillPoints -= 1; }); }}>
                {has ? 'ACQUIS' : 'DÉBLOQUER (1 pt)'}
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11 }}>Les paliers suivants de chaque style arrivent avec l’arbre de compétences complet (hors MVP).</div>
    </Modal>
  );
}
