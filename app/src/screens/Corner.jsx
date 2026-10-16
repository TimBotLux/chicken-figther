import { useRef, useState } from 'react';
import { Coach } from '../components/Characters.jsx';
import { STAR, useRaf } from '../components/Ui.jsx';

// Entre les rounds : 15 secondes au coin pour choisir une action parmi trois.
const CHOICES = [
  { id: 'soigner', title: 'SOIGNER', text: '+25 % de vie', tone: 'tone-accent', bg: 'var(--panel)', iconFill: 'var(--accent)', icon: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z' },
  { id: 'recuperer', title: 'RÉCUPÉRER', text: '+40 % d’endurance', tone: 'tone-cyan', bg: 'var(--panel)', iconFill: 'var(--cyan)', icon: 'M13 2L4 14h7l-1 8 9-12h-7z' },
  { id: 'coach', title: 'ÉCOUTER LE COACH', text: 'Télégraphes plus longs au prochain round', tone: '', bg: 'var(--lime)', iconFill: 'var(--panel)', icon: 'M4 5h16v11H9l-5 4z' },
];

export default function Corner({ eng, opp, onChoose }) {
  const [left, setLeft] = useState(15000);
  const [done, setDone] = useState(false);
  const chosen = useRef(false);
  const choose = (c) => {
    if (chosen.current) return;
    chosen.current = true;
    setDone(true);
    onChoose(c);
  };
  useRaf((dt) => {
    setLeft((l) => Math.max(0, l - dt));
    if (left - dt <= 0) choose(null);
  }, !done);

  const last = eng.scores[eng.scores.length - 1];
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, padding: 8, background: 'var(--paper)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="topbar" style={{ padding: '0 8px 0 16px', gap: 14 }}>
        <div className="t" style={{ fontSize: 26, color: 'var(--accent)', transform: 'skewX(-8deg)' }}>AU COIN !</div>
        <div className="sub" style={{ fontSize: 15 }}>
          Fin du round {eng.round} · contre {opp.short}{last ? ` · juges : ${last.p}–${last.e}` : ''}
        </div>
        <div style={{ position: 'relative', width: 56, height: 56, marginTop: 4, filter: 'var(--glow-cyan)' }}>
          <svg aria-hidden="true" viewBox="0 0 70 70" style={{ position: 'absolute', inset: 0, width: 56, height: 56 }}><polygon points={STAR} fill="var(--cyan)" stroke="var(--panel)" strokeWidth="3" strokeLinejoin="round" /></svg>
          <div className="t" style={{ position: 'absolute', left: 0, top: 19, width: 56, textAlign: 'center', fontSize: 16, color: '#111' }}>0:{String(Math.ceil(left / 1000)).padStart(2, '0')}</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
        <div style={{ width: 350, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative', border: '3px solid var(--ink)', overflow: 'hidden', background: 'repeating-conic-gradient(from 0deg at 22% 62%, var(--ink) 0deg 0.7deg, var(--panel) 0.7deg 6deg)' }}>
            <div style={{ position: 'absolute', left: 12, bottom: 12, filter: 'drop-shadow(4px 4px 0 var(--ink))' }}>
              <Coach size={124} bg="#7FE8FF" />
            </div>
            <div className="bubble" style={{ position: 'absolute', left: 146, top: 10, width: 166 }}>{opp.tip}</div>
            <svg aria-hidden="true" viewBox="0 0 40 40" style={{ position: 'absolute', left: 128, top: 104, width: 40, height: 40 }}><path d="M36 2 L 4 36 L 22 4 Z" fill="var(--panel)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" /><path d="M22 2 L 36 2" stroke="var(--panel)" strokeWidth="5" /></svg>
            <div className="t vertical" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30, background: 'var(--ink)', color: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, letterSpacing: 2 }}>COACH ERGOT</div>
          </div>
          <div style={{ height: 62, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
            <div className="box" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div className="t" style={{ fontSize: 22 }}>{eng.stats.landed}</div><div style={{ fontSize: 12 }}>coups touchés</div></div>
            <div style={{ border: '3px solid var(--ink)', background: 'var(--accent)', color: 'var(--on-accent)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div className="t" style={{ fontSize: 22 }}>{eng.stats.perfect}</div><div style={{ fontSize: 12 }}>esquives parfaites</div></div>
            <div className="box tone" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div className="t" style={{ fontSize: 22 }}>{eng.stats.kdGiven}</div><div style={{ fontSize: 12, background: 'var(--panel)', alignSelf: 'center', padding: '0 4px' }}>knock-down{eng.stats.kdGiven > 1 ? 's' : ''}</div></div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '0 10px' }}>
          {CHOICES.map((c) => (
            <button key={c.id} className={c.tone} disabled={done} onClick={() => choose(c.id)} style={{ flex: 1, border: '3px solid var(--ink)', backgroundColor: c.bg, transform: 'skewX(-8deg)', display: 'flex', alignItems: 'center', padding: 0, cursor: 'pointer', color: 'var(--ink)' }}>
              <div style={{ transform: 'skewX(8deg)', display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', width: '100%' }}>
                <div style={{ width: 44, height: 44, flexShrink: 0, background: 'var(--panel)', border: '3px solid var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill={c.iconFill} stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round"><path d={c.icon} /></svg>
                </div>
                <div style={{ flex: 1, textAlign: 'left', background: 'var(--panel)', border: '2.5px solid var(--ink)', padding: '2px 10px' }}>
                  <div className="t" style={{ fontSize: 18, lineHeight: 1.2 }}>{c.title}</div>
                  <div style={{ fontSize: 13 }}>{c.text}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
