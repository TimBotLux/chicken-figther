// Le coq boxeur, porté depuis la maquette Poulet.dc.html (5 paliers, face / dos).
const PALIER_NAMES = ['', 'maigrichon', 'sec', 'athlétique', 'musclé', 'bodybuildé'];
const f = (n) => Math.round(n * 10) / 10;

function geometry(p) {
  const m = (p - 1) / 4;
  const C = 120;
  const sh = 36 + 44 * m;
  const wa = 32 + 12 * m;
  const t = 12 + 18 * m;
  const tf = 11 + 12 * m;
  const b = 1 + 11 * m;

  const torso = `M${C} 96 C${f(C + sh * 0.5)} 96 ${f(C + sh * 0.95)} 100 ${f(C + sh)} 116 C${f(C + sh * 1.02)} 140 ${f(C + wa + (sh - wa) * 0.25)} 170 ${f(C + wa)} 198 L${f(C - wa)} 198 C${f(C - wa - (sh - wa) * 0.25)} 170 ${f(C - sh * 1.02)} 140 ${f(C - sh)} 116 C${f(C - sh * 0.95)} 100 ${f(C - sh * 0.5)} 96 ${C} 96 Z`;
  const shadeFace = `M${f(C + sh * 0.6)} 104 C${f(C + sh * 0.98)} 120 ${f(C + sh * 0.9)} 160 ${f(C + wa * 0.92)} 198 L${f(C + wa * 0.6)} 198 C${f(C + sh * 0.68)} 160 ${f(C + sh * 0.78)} 124 ${f(C + sh * 0.42)} 106 Z`;

  const armFace = (s) => {
    const sx = C + s * (sh - 4);
    const ex = sx + s * (5 + 3 * m);
    const wx = ex - s;
    const up = `M${f(sx - s * t * 0.5)} 114 C${f(sx + s * (t * 0.5 + b))} 110 ${f(ex + s * (t * 0.5 + b))} 150 ${f(ex + s * t * 0.5)} 184 L${f(ex - s * t * 0.5)} 184 C${f(ex - s * (t * 0.5 + b * 0.3))} 160 ${f(sx - s * (t * 0.5 + b * 0.2))} 140 ${f(sx - s * t * 0.5)} 114 Z`;
    const fo = `M${f(ex + s * tf * 0.5)} 180 C${f(ex + s * (tf * 0.5 + 2))} 200 ${f(wx + s * tf * 0.42)} 216 ${f(wx + s * tf * 0.42)} 230 L${f(wx - s * tf * 0.42)} 230 C${f(wx - s * tf * 0.5)} 214 ${f(ex - s * (tf * 0.5 + 1))} 198 ${f(ex - s * tf * 0.5)} 180 Z`;
    const hl = `M${f(sx + s * t * 0.3)} 142 C${f(sx + s * t * 0.1)} 132 ${f(sx - s * t * 0.3)} 130 ${f(sx - s * t * 0.45)} 138`;
    const gT = s === -1 ? `translate(${f(wx - 52)} 77) rotate(180 52 163)` : `translate(${f(wx - 188)} 77) rotate(180 188 163)`;
    return { up, fo, hl, gT, dx: f(C + s * (sh - 8)) };
  };

  const armBack = (s) => {
    const sx = C + s * (sh - 6), sy = 122, ex = C + s * (sh + 22), ey = 140, gx = C + s * (sh + 16), gy = 78;
    const dx = ex - sx, mx = sx + dx * 0.3, mx2 = sx + dx * 0.8;
    const up = `M${f(sx)} ${f(sy - t * 0.6)} C${f(mx)} ${f(sy - t * 0.6 - b)} ${f(mx2)} ${f(ey - t * 0.7 - b * 0.5)} ${f(ex + s * t * 0.5)} ${ey} C${f(ex + s * t * 0.4)} ${f(ey + t * 0.6)} ${f(mx)} ${f(sy + t * 0.7)} ${f(sx)} ${f(sy + t * 0.6)} Z`;
    const fo = `M${f(ex + s * tf * 0.6)} ${ey + 4} C${f(ex + s * tf * 0.8)} ${ey - 20} ${f(gx + s * tf * 0.6)} ${gy + 40} ${f(gx + s * tf * 0.45)} ${gy + 22} L${f(gx - s * tf * 0.45)} ${gy + 22} C${f(gx - s * tf * 0.5)} ${gy + 40} ${f(ex - s * tf * 0.4)} ${ey - 14} ${f(ex - s * tf * 0.5)} ${ey + 4} Z`;
    const gT = s === -1 ? `translate(${f(gx - 52)} ${gy - 163})` : `translate(${f(gx - 188)} ${gy - 163})`;
    return { up, fo, gT, dx: f(C + s * (sh - 8)) };
  };

  const pw = 18 + 30 * m, ph = 134 + 16 * m;
  const pec = (s) => `M${C} 108 C${f(C + s * pw * 0.6)} 102 ${f(C + s * pw * 1.15)} 104 ${f(C + s * pw * 1.2)} 120 C${f(C + s * pw * 1.25)} 136 ${f(C + s * pw * 0.9)} ${f(ph)} ${f(C + s * pw * 0.45)} ${f(ph)} C${f(C + s * pw * 0.15)} ${f(ph)} ${C} ${f(ph - 6)} ${C} ${f(ph - 14)} Z`;
  const pecLine = `M${f(C - pw * 1.1)} ${f(ph - 10)} C${f(C - pw * 0.8)} ${f(ph + 2)} ${f(C - pw * 0.2)} ${f(ph + 4)} ${C - 2} ${f(ph - 4)} M${f(C + pw * 1.1)} ${f(ph - 10)} C${f(C + pw * 0.8)} ${f(ph + 2)} ${f(C + pw * 0.2)} ${f(ph + 4)} ${C + 2} ${f(ph - 4)}`;

  const absW = f(12 + 5 * m);
  const absOps = { 1: [0, 0, 0], 2: [0, 0, 0], 3: [0.55, 0.55, 0], 4: [1, 1, 0.6], 5: [1, 1, 1] }[p];
  const sxs = C - (wa + (sh - wa) * 0.45);
  const serratus = `M${f(sxs)} 150 l8 4 M${f(sxs - 1)} 160 l8 4 M${f(sxs - 1)} 170 l8 4 M${f(2 * C - sxs)} 150 l-8 4 M${f(2 * C - sxs + 1)} 160 l-8 4 M${f(2 * C - sxs + 1)} 170 l-8 4`;

  const pantsD = `M${f(C - wa - 2)} 194 L${f(C + wa + 2)} 194 L${f(C + wa + 12)} 270 L128 272 L120 226 L112 272 L${f(C - wa - 12)} 270 Z`;
  const beltD = `M${f(C - wa - 3)} 189 C${f(C - wa * 0.4)} 196 ${f(C + wa * 0.4)} 196 ${f(C + wa + 3)} 189 L${f(C + wa + 4)} 203 C${f(C + wa * 0.4)} 210 ${f(C - wa * 0.4)} 210 ${f(C - wa - 4)} 203 Z`;
  const stitchD = `M${f(C - wa + 1)} 196 C${f(C - wa * 0.4)} 202 ${f(C + wa * 0.4)} 202 ${f(C + wa - 1)} 196`;

  const lat = (s) => `M${f(C + s * (sh - 14))} 120 C${f(C + s * (sh - 2))} 140 ${f(C + s * (wa + 4))} 170 ${f(C + s * (wa - 2))} 198 L${f(C + s * (wa - 9))} 198 C${f(C + s * (wa - 4))} 172 ${f(C + s * (sh - 14))} 146 ${f(C + s * (sh - 24))} 124 Z`;
  const blades = `M${f(C - sh * 0.45)} 120 C${f(C - sh * 0.28)} 128 ${f(C - sh * 0.22)} 146 ${f(C - sh * 0.32)} 162 M${f(C + sh * 0.45)} 120 C${f(C + sh * 0.28)} 128 ${f(C + sh * 0.22)} 146 ${f(C + sh * 0.32)} 162`;

  const hs = Math.round((0.72 + 0.28 * m) * 100) / 100;
  const ts = Math.round((0.7 + 0.3 * m) * 100) / 100;

  return {
    torso, shadeFace, pantsD, beltD, stitchD,
    L: armFace(-1), R: armFace(1), BL: armBack(-1), BR: armBack(1),
    latL: lat(-1), latR: lat(1), blades,
    pecL: pec(-1), pecR: pec(1), pecLine,
    pecOp: p >= 2 ? 1 : 0, fluffOp: p === 1 ? 1 : 0, deltOp: p >= 2 ? 1 : 0,
    deltRx: f(3 + 19 * m), deltRy: f(3 + 16 * m), muscleOp: Math.round(m * 100) / 100,
    absW, absLx: f(118 - (12 + 5 * m)), abs: absOps,
    serratus, serOp: p === 5 ? 1 : p === 4 ? 0.5 : 0,
    hackleT: `translate(120 0) scale(${hs} 1) translate(-120 0)`,
    tailT: `translate(120 0) scale(${ts} 1) translate(-120 0)`,
  };
}

const INK = '#2A1408';

// Mouvement d'un gant adverse vu de face : { x, y, r, k } en unités du dessin.
// Le gant pivote autour de son propre centre ; le bras suit à moitié.
export const gloveStyle = (m) => ({
  transform: m ? `translate(${m.x}px, ${m.y}px) rotate(${m.r || 0}deg) scale(${m.k || 1})` : 'none',
  transformBox: 'fill-box',
  transformOrigin: '50% 50%',
  transition: 'transform 90ms ease-out',
});
export const armStyle = (m) => ({
  transform: m ? `translate(${m.x * 0.45}px, ${m.y * 0.45}px)` : 'none',
  transition: 'transform 90ms ease-out',
});

// Vue de dos en combat : position des gants selon le coup lancé ou la garde.
// Les gants avancent vers l'adversaire (haut et centre de l'image) et rapetissent
// avec la distance ; les bras suivent à moitié pour rester attachés aux épaules.
function gloveMotion(p, side, strike, guard) {
  const m = (p - 1) / 4;
  const inward = 36 + 44 * m + 16; // distance du gant au centre (sh + 16)
  const s = side === 'l' ? 1 : -1; // sens vers le centre
  const active = strike && (strike.kind === 'special' || strike.arm === side);
  let x = 0, y = 0, r = 0, k = 1;
  if (active) {
    ({ x, y, r, k } = {
      jab: { x: 0.7 * inward, y: -72, r: 0, k: 0.7 },
      crochet: { x: 1.05 * inward, y: -48, r: -40, k: 0.78 },
      uppercut: { x: 0.5 * inward, y: -98, r: 18, k: 0.76 },
      special: { x: 0.85 * inward, y: -86, r: 0, k: 0.66 },
    }[strike.kind]);
  } else if (strike) {
    ({ x, y } = { x: 0.3 * inward, y: -22 }); // l'autre gant protège le visage
  } else if (guard === 'high') {
    ({ x, y } = { x: 0.42 * inward, y: -34 });
  } else if (guard === 'low') {
    ({ x, y } = { x: 0.32 * inward, y: 30 });
  }
  const gx = 120 - s * inward;
  return {
    glove: { transform: `translate(${s * x}px, ${y}px) rotate(${s * r}deg) scale(${k})`, transformOrigin: `${gx}px 85px`, transition: 'transform 70ms ease-out' },
    arm: { transform: `translate(${s * x * 0.45}px, ${y * 0.45}px)`, transition: 'transform 70ms ease-out' },
  };
}

function Glove({ transform, side, gloves, shine = true }) {
  if (side === 'L') {
    return (
      <g transform={transform}>
        <rect x="38" y="182" width="30" height="16" rx="5" fill="#F4EFE6" stroke={INK} strokeWidth="2.5" />
        <path d="M30 172 C 26 148, 46 136, 62 142 C 78 148, 80 168, 70 182 L 38 184 C 32 182, 30 178, 30 172 Z" fill={gloves} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        {shine && <ellipse cx="44" cy="154" rx="7" ry="4" fill="#FFFFFF" opacity="0.5" transform="rotate(-30 44 154)" />}
      </g>
    );
  }
  return (
    <g transform={transform}>
      <rect x="172" y="182" width="30" height="16" rx="5" fill="#F4EFE6" stroke={INK} strokeWidth="2.5" />
      <path d="M210 172 C 214 148, 194 136, 178 142 C 162 148, 160 168, 170 182 L 202 184 C 208 182, 210 178, 210 172 Z" fill={gloves} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
    </g>
  );
}

const HACKLE = 'M98 64 C 92 80, 84 92, 70 100 L 82 102 L 76 110 L 92 106 L 92 114 L 104 104 L 108 112 L 116 100 L 120 110 L 124 100 L 132 112 L 136 104 L 148 114 L 148 106 L 164 110 L 158 102 L 170 100 C 156 92, 148 80, 142 64 Z';
const COMB = 'M104 34 C 96 22, 100 12, 106 18 C 106 6, 116 2, 118 14 C 120 2, 132 2, 130 16 C 136 8, 146 14, 138 34 Z';
const HEAD = 'M120 26 C 136 26, 146 40, 144 56 C 142 70, 132 80, 120 80 C 108 80, 98 70, 96 56 C 94 40, 104 26, 120 26 Z';

export default function Poulet({ palier = 1, pose = 'face', size = 300, pants = '#35303A', gloves = '#D7262B', plumage, style, className, strike = null, guard = null, fist = null }) {
  const p = Math.max(1, Math.min(5, Math.round(palier)));
  const g = geometry(p);
  const body = plumage?.body ?? '#D9894A';
  const shade = plumage?.shade ?? '#B8693A';
  const side2 = plumage?.side ?? '#C4763F';
  const wrap = { width: Math.round(size * 0.8), height: size, position: 'relative', ...style };

  if (pose === 'dos') {
    const ml = gloveMotion(p, 'l', strike, guard);
    const mr = gloveMotion(p, 'r', strike, guard);
    return (
      <div style={wrap} className={className}>
        <svg role="img" aria-label={`Le coq boxeur, palier ${p} sur 5 (${PALIER_NAMES[p]}), de dos en garde`} viewBox="0 0 240 300" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
          <ellipse cx="120" cy="292" rx="78" ry="7" fill="#000000" opacity="0.18" />
          <path d="M96 270 L84 289 M96 270 L96 294 M144 270 L144 294 M144 270 L156 289" stroke={INK} strokeWidth="10" strokeLinecap="round" />
          <path d="M96 270 L84 289 M96 270 L96 294 M144 270 L144 294 M144 270 L156 289" stroke="#E8B33A" strokeWidth="5.5" strokeLinecap="round" />
          <path d={g.pantsD} fill={pants} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d={g.torso} fill={body} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d={g.latL} fill={shade} />
          <path d={g.latR} fill={shade} />
          <path d={g.blades} stroke="#8A4A24" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={g.muscleOp} />
          <path d="M120 104 L120 190" stroke="#8A4A24" strokeWidth="2.5" strokeLinecap="round" />
          <g className="arm-l" style={ml.arm}>
            <path d={g.BL.fo} fill={body} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <path d={g.BL.up} fill={body} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <ellipse cx={g.BL.dx} cy="124" rx={g.deltRx} ry={g.deltRy} fill={body} stroke={INK} strokeWidth="2.5" opacity={g.deltOp} />
          </g>
          <g className="arm-r" style={mr.arm}>
            <path d={g.BR.fo} fill={side2} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <path d={g.BR.up} fill={side2} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <ellipse cx={g.BR.dx} cy="124" rx={g.deltRx} ry={g.deltRy} fill={side2} stroke={INK} strokeWidth="2.5" opacity={g.deltOp} />
          </g>
          <g transform={g.tailT}>
            <path d="M120 200 C 94 172, 66 152, 52 112 C 80 138, 104 156, 128 178 Z" fill="#C2602F" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M120 200 C 146 172, 174 152, 188 112 C 160 138, 136 156, 112 178 Z" fill="#8E3B22" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M120 200 C 110 170, 110 140, 122 108 C 132 140, 132 170, 120 200 Z" fill="#E08E4E" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          </g>
          <path d={g.beltD} fill="#7A4A2A" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <g transform={g.hackleT}>
            <path d={HACKLE} fill="#E39A55" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M104 80 L 98 98 M114 84 L 112 102 M126 84 L 128 102 M136 80 L 142 98" stroke={shade} strokeWidth="1.6" strokeLinecap="round" />
          </g>
          <path d={COMB} fill="#D7262B" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d={HEAD} fill={side2} stroke={INK} strokeWidth="2.5" />
          <path d="M104 30 C 94 40, 94 62, 104 74 C 100 60, 100 42, 108 32 Z" fill={body} />
          <ellipse cx="96" cy="60" rx="4" ry="7" fill="#D7262B" stroke={INK} strokeWidth="1.5" />
          <ellipse cx="144" cy="60" rx="4" ry="7" fill="#D7262B" stroke={INK} strokeWidth="1.5" />
          <g className="glove-l" style={ml.glove}><Glove transform={g.BL.gT} side="L" gloves={gloves} /></g>
          <g className="glove-r" style={mr.glove}><Glove transform={g.BR.gT} side="R" gloves={gloves} /></g>
        </svg>
      </div>
    );
  }

  return (
    <div style={wrap} className={className}>
      <svg role="img" aria-label={`Le coq boxeur, palier ${p} sur 5 (${PALIER_NAMES[p]}), de face`} viewBox="0 0 240 300" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
        <ellipse cx="120" cy="292" rx="78" ry="7" fill="#000000" opacity="0.18" />
        <path d="M80 168 C 36 160, 6 130, 2 90 C 22 122, 50 142, 86 152 Z" fill="#8E3B22" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M78 160 C 40 140, 14 100, 18 48 C 34 90, 56 120, 86 140 Z" fill="#C2602F" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M78 150 C 52 120, 42 80, 54 30 C 60 74, 72 106, 92 130 Z" fill="#E08E4E" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M60 136 C 40 116, 30 92, 28 70 M70 120 C 58 100, 54 78, 56 56 M52 150 C 34 140, 20 124, 12 104" stroke={INK} strokeWidth="1.2" fill="none" opacity="0.55" />
        <path d="M96 270 L84 289 M96 270 L96 294 M96 270 L110 289 M144 270 L130 289 M144 270 L144 294 M144 270 L156 289" stroke={INK} strokeWidth="10" strokeLinecap="round" />
        <path d="M96 270 L84 289 M96 270 L96 294 M96 270 L110 289 M144 270 L130 289 M144 270 L144 294 M144 270 L156 289" stroke="#E8B33A" strokeWidth="5.5" strokeLinecap="round" />
        <path d={g.pantsD} fill={pants} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M98 214 C 100 236, 100 252, 98 268 M142 214 C 140 236, 140 252, 142 268 M120 210 L120 224" stroke="#57505E" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d={g.torso} fill={body} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={g.shadeFace} fill={shade} />
        <path d={g.L.up} fill={body} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={g.L.fo} fill={body} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" style={armStyle(fist?.l)} />
        <path d={g.R.up} fill={side2} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d={g.R.fo} fill={shade} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" style={armStyle(fist?.r)} />
        <path d={g.L.hl} stroke="#EDB27A" strokeWidth="3" fill="none" strokeLinecap="round" opacity={g.muscleOp} />
        <ellipse cx={g.L.dx} cy="120" rx={g.deltRx} ry={g.deltRy} fill={body} stroke={INK} strokeWidth="2.5" opacity={g.deltOp} />
        <ellipse cx={g.R.dx} cy="120" rx={g.deltRx} ry={g.deltRy} fill={side2} stroke={INK} strokeWidth="2.5" opacity={g.deltOp} />
        <path d={g.pecL} fill="#DD9152" stroke="#8A4A24" strokeWidth="2.2" strokeLinejoin="round" opacity={g.pecOp} />
        <path d={g.pecR} fill={side2} stroke="#8A4A24" strokeWidth="2.2" strokeLinejoin="round" opacity={g.pecOp} />
        <path d={g.pecLine} stroke={INK} strokeWidth="2.3" fill="none" strokeLinecap="round" opacity={g.pecOp} />
        <path d="M112 112 l-6 6 M120 116 l0 8 M128 112 l6 6 M114 128 l-5 5 M126 128 l5 5" stroke="#EDB27A" strokeWidth="2" strokeLinecap="round" opacity={g.fluffOp} />
        <g transform={g.hackleT}>
          <path d="M80 114 l7 -3 M88 122 l7 -3 M146 114 l7 -3 M154 122 l7 -3" stroke="#EDB27A" strokeWidth="2" strokeLinecap="round" opacity={g.muscleOp} />
        </g>
        <rect x={g.absLx} y="155" width={g.absW} height="11" rx="5" fill="#DD9152" stroke="#8A4A24" strokeWidth="2" opacity={g.abs[0]} />
        <rect x="122" y="155" width={g.absW} height="11" rx="5" fill="#C98048" stroke="#8A4A24" strokeWidth="2" opacity={g.abs[0]} />
        <rect x={g.absLx} y="169" width={g.absW} height="11" rx="5" fill="#DD9152" stroke="#8A4A24" strokeWidth="2" opacity={g.abs[1]} />
        <rect x="122" y="169" width={g.absW} height="11" rx="5" fill="#C98048" stroke="#8A4A24" strokeWidth="2" opacity={g.abs[1]} />
        <rect x={g.absLx} y="183" width={g.absW} height="9" rx="4" fill="#DD9152" stroke="#8A4A24" strokeWidth="2" opacity={g.abs[2]} />
        <rect x="122" y="183" width={g.absW} height="9" rx="4" fill="#C98048" stroke="#8A4A24" strokeWidth="2" opacity={g.abs[2]} />
        <path d={g.serratus} stroke="#8A4A24" strokeWidth="2" strokeLinecap="round" opacity={g.serOp} />
        <path d={g.beltD} fill="#7A4A2A" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d={g.stitchD} stroke="#B88456" strokeWidth="1.3" strokeDasharray="3 3" fill="none" />
        <rect x="108" y="188" width="24" height="18" rx="2" fill="#C9CCD1" stroke={INK} strokeWidth="2.2" />
        <rect x="113" y="193" width="14" height="8" rx="1" fill="#8E9299" />
        <path d="M114 206 L112 222" stroke="#8E9299" strokeWidth="1.5" />
        <circle cx="112" cy="224" r="2.5" fill="none" stroke="#8E9299" strokeWidth="1.5" />
        <g transform={g.hackleT}>
          <path d={HACKLE} fill="#E39A55" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M104 80 L 98 98 M114 84 L 112 102 M126 84 L 128 102 M136 80 L 142 98" stroke={shade} strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <path d={COMB} fill="#D7262B" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M108 30 C 118 26, 128 26, 136 30" stroke="#A51C22" strokeWidth="3" fill="none" />
        <path d={HEAD} fill={body} stroke={INK} strokeWidth="2.5" />
        <path d="M136 30 C 146 40, 146 62, 136 74 C 140 60, 140 42, 132 32 Z" fill={shade} />
        <ellipse cx="108" cy="52" rx="9.5" ry="8" fill="#D7262B" />
        <ellipse cx="132" cy="52" rx="9.5" ry="8" fill="#D7262B" />
        <path d="M101 53 Q 108 47 115 52 Q 108 57 101 53 Z" fill="#F5C518" stroke={INK} strokeWidth="1.8" />
        <path d="M139 53 Q 132 47 125 52 Q 132 57 139 53 Z" fill="#F5C518" stroke={INK} strokeWidth="1.8" />
        <circle cx="109" cy="52.5" r="2.3" fill={INK} />
        <circle cx="131" cy="52.5" r="2.3" fill={INK} />
        <path d="M98 45 L117 49 M142 45 L123 49" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M112 58 Q 120 54 128 58 L 123 71 Q 120 76 117 71 Z" fill="#F2C230" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M114 62 L126 62" stroke={INK} strokeWidth="1.4" />
        <path d="M113 70 C 106 84, 112 96, 118 92 C 120 86, 118 76, 117 72 Z" fill="#D7262B" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M127 70 C 134 84, 128 96, 122 92 C 120 86, 122 76, 123 72 Z" fill="#B81F25" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <g style={gloveStyle(fist?.l)}><g transform={g.L.gT}>
          <rect x="38" y="182" width="30" height="16" rx="5" fill="#F4EFE6" stroke={INK} strokeWidth="2.5" />
          <path d="M30 172 C 26 148, 46 136, 62 142 C 78 148, 80 168, 70 182 L 38 184 C 32 182, 30 178, 30 172 Z" fill={gloves} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M66 160 C 76 160, 78 172, 70 176" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="60" cy="172" rx="7" ry="4" fill="#FFFFFF" opacity="0.5" transform="rotate(-30 60 172)" />
        </g></g>
        <g style={gloveStyle(fist?.r)}><g transform={g.R.gT}>
          <rect x="172" y="182" width="30" height="16" rx="5" fill="#F4EFE6" stroke={INK} strokeWidth="2.5" />
          <path d="M210 172 C 214 148, 194 136, 178 142 C 162 148, 160 168, 170 182 L 202 184 C 208 182, 210 178, 210 172 Z" fill={gloves} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M174 160 C 164 160, 162 172, 170 176" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        </g></g>
      </svg>
    </div>
  );
}
