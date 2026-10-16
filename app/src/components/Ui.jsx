import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const STAR = '69,35 53.5,42.7 59,59 42.7,53.5 35,69 27.3,53.5 11,59 16.5,42.7 1,35 16.5,27.3 11,11 27.3,16.5 35,1 42.7,16.5 59,11 53.5,27.3';

export function Burst({ size = 84, fill = 'var(--lime)', stroke = 'var(--ink)', children, style, textStyle }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      <svg aria-hidden="true" viewBox="0 0 70 70" style={{ position: 'absolute', inset: 0, width: size, height: size }}>
        <polygon points={STAR} fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div className="t" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', ...textStyle }}>{children}</div>
    </div>
  );
}

export function BackIcon({ color = 'var(--panel)' }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
  );
}

export function GearIcon({ color = 'var(--panel)' }) {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  );
}

export function Bolt({ fill, stroke = 'var(--panel)', size = 22 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
  );
}

export function Gauge({ pct, color, height = 10, align = 'left', label }) {
  return (
    <div className="gauge" style={{ height, display: 'flex', justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }} role="meter" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  );
}

export function Modal({ title, onClose, children, width = 620 }) {
  return (
    <div className="modal-back" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal rise" style={{ width }} role="dialog" aria-label={title}>
        <div className="modal-head">
          <div className="t">{title}</div>
          {onClose && (
            <button className="icon-btn" aria-label="Fermer" onClick={onClose}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" stroke="var(--panel)" strokeWidth="3" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Seg({ value, options, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map(([v, l]) => (
        <button key={String(v)} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

// Boucle requestAnimationFrame avec dt en millisecondes.
export function useRaf(cb, active = true) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!active) return undefined;
    let id;
    let last = performance.now();
    const loop = (t) => {
      const dt = t - last;
      last = t;
      ref.current(dt, t);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [active]);
}

// Met à l'échelle la scène de 844×390 pour remplir la zone disponible (hors encoches).
export function useStageScale(ref) {
  const [s, setS] = useState({ scale: 1, x: 0, y: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    const fit = () => {
      const w = el ? el.clientWidth : window.innerWidth;
      const h = el ? el.clientHeight : window.innerHeight;
      const scale = Math.min(w / 844, h / 390);
      setS({ scale, x: (w - 844 * scale) / 2, y: (h - 390 * scale) / 2 });
    };
    fit();
    const ro = el && window.ResizeObserver ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    window.addEventListener('resize', fit);
    return () => { ro?.disconnect(); window.removeEventListener('resize', fit); };
  }, [ref]);
  return s;
}

export function usePopups() {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);
  const add = (p) => {
    const id = ++idRef.current;
    setItems((xs) => [...xs.slice(-6), { id, ...p }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), p.ms || 900);
  };
  return [items, add];
}

export function Popups({ items }) {
  return items.map((p) => (
    <div key={p.id} className="popup" style={{ left: p.x, top: p.y, '--r': `${p.r || 0}deg`, animationDuration: `${p.ms || 900}ms` }}>
      <div className="sfx-text" style={{ fontSize: p.size || 40, color: p.color || 'var(--accent)' }}>{p.text}</div>
      {p.sub && <div className="gloss" style={{ display: 'inline-block', marginTop: 2 }}>{p.sub}</div>}
    </div>
  ));
}
