// Décors de combat (PRD : « 6 arènes thématiques — grange, poulailler… »).
// Chaque arène est faite de plans superposés qui glissent à des vitesses différentes
// (parallaxe) quand la caméra suit les combattants : `shift` = décalage caméra en px.
// Les couleurs du décor sont dessinées en dur, comme les personnages ; le thème sombre
// les assombrit (soirée de gala) via la classe .arena-night.

const THEMES = {
  grange: {
    name: 'LA GRANGE',
    sky: 'linear-gradient(#5B2E1A, #8A4528)',
    wall: 'repeating-linear-gradient(90deg, #A0522D 0 34px, #8B4425 34px 37px, #B05E34 37px 70px, #8B4425 70px 73px)',
    beam: '#5A2E14',
    crowd: ['#6E4B3A', '#8C6A55', '#4E3426', '#A07A60'], // vaches, moutons, cochons
    floor: '#E8D9A8',
    floorTone: 'rgba(160, 110, 40, 0.35)',
    ropes: ['#D7262B', '#F4EFE6', '#2E86DE'],
    light: 'rgba(255, 214, 120, 0.35)',
  },
  poulailler: {
    name: 'LE POULAILLER',
    sky: 'linear-gradient(#FF8A5C, #FFD27A)',
    wall: 'repeating-linear-gradient(45deg, transparent 0 14px, rgba(60, 60, 60, 0.55) 14px 16px), repeating-linear-gradient(-45deg, transparent 0 14px, rgba(60, 60, 60, 0.55) 14px 16px), linear-gradient(#7BC6E8, #CDEBF5)',
    beam: '#6B4A2B',
    crowd: ['#F4EFE6', '#E08E4E', '#C2602F', '#FFFFFF'], // poules et poussins
    floor: '#F2E2B6',
    floorTone: 'rgba(200, 140, 40, 0.35)',
    ropes: ['#FF2E88', '#FFFFFF', '#00C2EB'],
    light: 'rgba(255, 240, 200, 0.4)',
  },
  salle: {
    name: 'LA SALLE',
    sky: 'linear-gradient(#3A3A44, #55555F)',
    wall: 'repeating-linear-gradient(0deg, #6B6B78 0 30px, #5E5E6A 30px 32px)',
    beam: '#2B2B33',
    crowd: ['#7EE0D6', '#FFC93C', '#FF8F7E', '#C9783A'],
    floor: '#D9D4C7',
    floorTone: 'rgba(0, 194, 235, 0.3)',
    ropes: ['#00C2EB', '#FFFFFF', '#FF2E88'],
    light: 'rgba(200, 240, 255, 0.3)',
  },
};

// Une rangée de spectateurs : têtes rondes avec oreilles ou crêtes, qui sautillent.
function Crowd({ colors, kind, hype }) {
  const heads = [];
  for (let i = 0; i < 30; i++) {
    const x = i * 30 + (i % 2) * 8 - 20;
    const y = 6 + (i % 3) * 7;
    const c = colors[i % colors.length];
    heads.push(
      <g key={i} className="fan" style={{ animationDelay: `${(i * 137) % 600}ms`, animationDuration: hype ? '0.25s' : `${0.7 + (i % 4) * 0.12}s` }}>
        {kind === 'poulailler' ? (
          <>
            <path d={`M${x - 4} ${y - 9} q 4 -8 8 0 q 4 -8 8 0`} fill="#D7262B" />
            <circle cx={x + 4} cy={y + 4} r="11" fill={c} stroke="#2A1408" strokeWidth="2" />
            <path d={`M${x + 12} ${y + 3} l 7 3 l -7 3 z`} fill="#F2C230" stroke="#2A1408" strokeWidth="1.5" />
          </>
        ) : (
          <>
            <ellipse cx={x - 7} cy={y - 4} rx="6" ry="3.5" fill={c} stroke="#2A1408" strokeWidth="2" />
            <ellipse cx={x + 15} cy={y - 4} rx="6" ry="3.5" fill={c} stroke="#2A1408" strokeWidth="2" />
            <circle cx={x + 4} cy={y + 4} r="12" fill={c} stroke="#2A1408" strokeWidth="2" />
            <ellipse cx={x + 4} cy={y + 9} rx="6" ry="4" fill="#E9A5AE" />
          </>
        )}
        <circle cx={x} cy={y + 1} r="1.6" fill="#111" />
        <circle cx={x + 8} cy={y + 1} r="1.6" fill="#111" />
      </g>,
    );
  }
  return (
    <svg width="900" height="48" viewBox="0 0 900 48" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      {heads}
    </svg>
  );
}

export const arenaFor = (catId) => (catId === 'plume' ? 'poulailler' : catId === 'mouche' ? 'grange' : 'salle');

export default function Arena({ theme = 'grange', shift = 0, hype = 0 }) {
  const T = THEMES[theme] || THEMES.grange;
  const layer = (depth, style, children, key) => (
    <div key={key} aria-hidden="true" style={{ position: 'absolute', transform: `translateX(${shift * depth}px)`, ...style }}>{children}</div>
  );
  return (
    <div className="arena-decor" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Fond : ciel / mur, à peine décalé */}
      {layer(0.08, { left: -60, right: -60, top: 0, height: 180, background: T.sky })}
      {layer(0.12, { left: -60, right: -60, top: 0, height: 150, background: T.wall, borderBottom: `6px solid ${T.beam}` })}
      {theme === 'grange' && layer(0.12, { left: 302, top: 6, width: 240, height: 140 }, (
        // Grande porte de grange avec sa croix
        <svg width="240" height="140" viewBox="0 0 240 140"><rect x="4" y="4" width="232" height="136" fill="#7A3A1E" stroke="#3B1A0B" strokeWidth="6" /><path d="M4 4 L236 140 M236 4 L4 140" stroke="#3B1A0B" strokeWidth="8" /><rect x="4" y="4" width="232" height="136" fill="none" stroke="#F4EFE6" strokeWidth="3" /></svg>
      ))}
      {theme === 'poulailler' && layer(0.12, { left: 40, top: 18, width: 780 }, (
        // Rangée de nids avec des œufs
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {Array.from({ length: 6 }, (_, i) => (
            <svg key={i} width="90" height="60" viewBox="0 0 90 60"><rect x="2" y="10" width="86" height="48" fill="#B07A45" stroke="#5A3A1E" strokeWidth="4" /><ellipse cx="45" cy="52" rx="34" ry="10" fill="#E8C55A" stroke="#9A7A2A" strokeWidth="2" /><ellipse cx={34 + (i % 2) * 10} cy="44" rx="8" ry="10" fill="#FFF8EA" stroke="#5A3A1E" strokeWidth="2" /></svg>
          ))}
        </div>
      ))}
      {theme === 'salle' && layer(0.12, { left: 60, top: 20, width: 720 }, (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {['CHAMPION', 'ゴゴゴ', 'NO PAIN NO GRAIN'].map((t) => (
            <div key={t} className="t" style={{ background: '#FFC93C', color: '#111', border: '4px solid #111', padding: '6px 10px', fontSize: 16, transform: 'rotate(-3deg)' }}>{t}</div>
          ))}
        </div>
      ))}
      {/* Projecteurs qui balaient la scène */}
      {layer(0.2, { left: 120, top: -20, width: 180, height: 330, background: `linear-gradient(${T.light}, transparent 85%)`, clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', transformOrigin: '50% 0', animation: 'spotSweep 5s ease-in-out infinite alternate', mixBlendMode: 'screen' })}
      {layer(0.2, { left: 540, top: -20, width: 180, height: 330, background: `linear-gradient(${T.light}, transparent 85%)`, clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)', transformOrigin: '50% 0', animation: 'spotSweep 6s ease-in-out infinite alternate-reverse', mixBlendMode: 'screen' })}
      {/* Public sur deux rangées, avec flashs d'appareils photo */}
      {layer(0.3, { left: -40, top: 104, width: 940 }, <Crowd colors={T.crowd} kind={theme} hype={hype} />)}
      {layer(0.38, { left: -60, top: 126, width: 960 }, <Crowd colors={[...T.crowd].reverse()} kind={theme} hype={hype} />)}
      {layer(0.34, { left: 0, top: 100, width: 844, height: 70 }, (
        [80, 230, 410, 600, 760].map((x, i) => (
          <div key={x} className="camflash" style={{ position: 'absolute', left: x, top: (i * 17) % 40, animationDelay: `${i * 0.9}s` }} />
        ))
      ))}
      {/* Cordes du ring et tapis */}
      {layer(0.5, { left: -40, top: 170, width: 924, height: 8, background: T.ropes[0], border: '3px solid #111' })}
      {layer(0.5, { left: -40, top: 192, width: 924, height: 8, background: T.ropes[1], border: '3px solid #111' })}
      {layer(0.5, { left: -40, top: 214, width: 924, height: 8, background: T.ropes[2], border: '3px solid #111' })}
      {layer(0.5, { left: 36, top: 160, width: 18, height: 80, background: '#DDD', border: '3px solid #111' })}
      {layer(0.5, { left: 790, top: 160, width: 18, height: 80, background: '#DDD', border: '3px solid #111' })}
      {layer(0.65, { left: -120, top: 238, width: 1084, height: 300, borderRadius: '50%', backgroundColor: T.floor, backgroundImage: `radial-gradient(${T.floorTone} 1.4px, transparent 1.6px)`, backgroundSize: '8px 8px', border: '4px solid #111' })}
      {/* Nom de l'arène sur le tapis */}
      {layer(0.65, { left: 0, right: 0, top: 330, textAlign: 'center' }, <span className="t" style={{ fontSize: 26, color: 'rgba(0,0,0,0.12)', letterSpacing: 6 }}>{T.name}</span>)}
    </div>
  );
}
