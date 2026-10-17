import Poulet, { armStyle, gloveStyle } from './Poulet.jsx';

const K = '#1A1A1A';

// Rat « Rattrapage », porté depuis Rat.dc.html.
export function Rat({ size = 300, style, fist }) {
  return (
    <div style={{ width: Math.round(size * 0.8), height: size, position: 'relative', ...style }}>
      <svg role="img" aria-label="Rat « Rattrapage », champion poids mouche, en garde" viewBox="0 0 240 300" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
        <ellipse cx="120" cy="290" rx="66" ry="8" fill="#000000" opacity="0.18" />
        <path d="M162 236 C 214 244, 236 214, 222 186 C 212 168, 194 172, 196 190" fill="none" stroke={K} strokeWidth="10" strokeLinecap="round" />
        <path d="M162 236 C 214 244, 236 214, 222 186 C 212 168, 194 172, 196 190" fill="none" stroke="#E9A5AE" strokeWidth="5" strokeLinecap="round" />
        <path d="M106 246 L103 280 M134 246 L137 280" stroke={K} strokeWidth="12" strokeLinecap="round" />
        <path d="M106 246 L103 280 M134 246 L137 280" stroke="#8E919B" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="100" cy="284" rx="15" ry="7" fill="#E9A5AE" stroke={K} strokeWidth="3" />
        <ellipse cx="140" cy="284" rx="15" ry="7" fill="#E9A5AE" stroke={K} strokeWidth="3" />
        <path d="M120 110 C 148 110, 174 114, 192 128 C 200 136, 198 152, 188 162 C 178 176, 168 190, 162 208 L 78 208 C 72 190, 62 176, 52 162 C 42 152, 40 136, 48 128 C 66 114, 92 110, 120 110 Z" fill="#8E919B" stroke={K} strokeWidth="4" strokeLinejoin="round" />
        <path d="M174 134 C 186 146, 180 168, 166 186 C 164 200, 162 206, 160 208 C 164 188, 172 162, 164 140 Z" fill="#7A7D87" />
        <path d="M120 126 C 102 120, 80 122, 72 136 C 68 150, 80 162, 100 162 C 110 162, 118 156, 120 148 Z" fill="#BFC2CA" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M120 126 C 138 120, 160 122, 168 136 C 172 150, 160 162, 140 162 C 130 162, 122 156, 120 148 Z" fill="#BFC2CA" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
        <rect x="101" y="166" width="17" height="11" rx="5" fill="#BFC2CA" stroke={K} strokeWidth="2.5" />
        <rect x="122" y="166" width="17" height="11" rx="5" fill="#BFC2CA" stroke={K} strokeWidth="2.5" />
        <rect x="102" y="180" width="16" height="11" rx="5" fill="#BFC2CA" stroke={K} strokeWidth="2.5" />
        <rect x="122" y="180" width="16" height="11" rx="5" fill="#BFC2CA" stroke={K} strokeWidth="2.5" />
        <path d="M78 204 C 100 212, 140 212, 162 204 L 170 234 C 156 252, 136 254, 125 242 L 120 232 L 115 242 C 104 254, 84 252, 70 234 Z" fill="#7B4FD6" stroke={K} strokeWidth="4" strokeLinejoin="round" />
        <path d="M76 194 C 100 206, 140 206, 164 194 L 165 212 C 140 224, 100 224, 75 212 Z" fill="#FFC93C" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
        <ellipse cx="120" cy="208" rx="19" ry="14" fill="#FFE38A" stroke={K} strokeWidth="3" />
        <path d="M120 199 L120 218 M120 204 l-5 -3 M120 204 l5 -3 M120 209 l-5 -3 M120 209 l5 -3 M120 214 l-5 -3 M120 214 l5 -3" stroke="#9A6B00" strokeWidth="2.2" strokeLinecap="round" />
        <g className="arm-l" style={armStyle(fist?.l)}>
          <path d="M60 130 C 36 132, 22 154, 28 176 C 32 190, 50 192, 58 180 C 66 166, 70 150, 74 140 Z" fill="#8E919B" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M34 172 C 40 184, 52 184, 58 174" stroke="#6E717B" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M36 182 C 50 196, 70 176, 80 156 L 68 146 C 60 162, 50 172, 40 170 Z" fill="#8E919B" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
          <ellipse cx="54" cy="136" rx="20" ry="16" fill="#8E919B" stroke={K} strokeWidth="3.5" />
        </g>
        <g className="arm-r" style={armStyle(fist?.r)}>
          <path d="M180 130 C 204 132, 218 154, 212 176 C 208 190, 190 192, 182 180 C 174 166, 170 150, 166 140 Z" fill="#8E919B" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M206 172 C 200 184, 188 184, 182 174" stroke="#6E717B" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M204 182 C 190 196, 170 176, 160 156 L 172 146 C 180 162, 190 172, 200 170 Z" fill="#8E919B" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
          <ellipse cx="186" cy="136" rx="20" ry="16" fill="#8E919B" stroke={K} strokeWidth="3.5" />
        </g>
        <circle cx="80" cy="44" r="27" fill="#8E919B" stroke={K} strokeWidth="4" />
        <circle cx="80" cy="44" r="16" fill="#E9A5AE" />
        <circle cx="160" cy="44" r="27" fill="#8E919B" stroke={K} strokeWidth="4" />
        <circle cx="160" cy="44" r="16" fill="#E9A5AE" />
        <path d="M120 40 C 152 40, 166 64, 162 86 C 158 106, 140 118, 120 118 C 100 118, 82 106, 78 86 C 74 64, 88 40, 120 40 Z" fill="#8E919B" stroke={K} strokeWidth="4" />
        <path d="M80 86 L 66 92 L 80 98 M160 86 L 174 92 L 160 98" fill="#8E919B" stroke={K} strokeWidth="3" strokeLinejoin="round" />
        <path d="M114 42 L 120 30 L 126 42" fill="#8E919B" stroke={K} strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="104" cy="70" rx="8" ry="9" fill="#FFFFFF" stroke={K} strokeWidth="2.5" />
        <ellipse cx="136" cy="70" rx="8" ry="9" fill="#FFFFFF" stroke={K} strokeWidth="2.5" />
        <circle cx="106" cy="72" r="4.5" fill={K} />
        <circle cx="134" cy="72" r="4.5" fill={K} />
        <path d="M112 68 A 8 9 0 0 0 96 68 Z" fill="#8E919B" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M144 68 A 8 9 0 0 0 128 68 Z" fill="#8E919B" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M93 57 L113 60 M127 57 L147 49" stroke={K} strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="120" cy="98" rx="24" ry="16" fill="#BFC2CA" stroke={K} strokeWidth="3" />
        <ellipse cx="120" cy="88" rx="8" ry="6" fill="#E9A5AE" stroke={K} strokeWidth="2.5" />
        <path d="M114 105 L114 114 L126 114 L126 106" fill="#FFFFFF" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M120 106 L120 114" stroke={K} strokeWidth="2" />
        <path d="M102 101 Q 118 110 140 96" stroke={K} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M97 95 L72 88 M97 100 L70 102 M143 95 L168 88 M143 100 L170 102" stroke={K} strokeWidth="2" strokeLinecap="round" />
        <g className="glove-l" style={gloveStyle(fist?.l)}><g transform="translate(32 -21)">
          <rect x="38" y="182" width="30" height="16" rx="5" fill="#FFFFFF" stroke={K} strokeWidth="3" />
          <path d="M30 172 C 26 148, 46 136, 62 142 C 78 148, 80 168, 70 182 L 38 184 C 32 182, 30 178, 30 172 Z" fill="#2E86DE" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M66 160 C 76 160, 78 172, 70 176" fill="none" stroke={K} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="44" cy="154" rx="7" ry="4" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 44 154)" />
        </g></g>
        <g className="glove-r" style={gloveStyle(fist?.r)}><g transform="translate(-32 -21)">
          <rect x="172" y="182" width="30" height="16" rx="5" fill="#FFFFFF" stroke={K} strokeWidth="3" />
          <path d="M210 172 C 214 148, 194 136, 178 142 C 162 148, 160 168, 170 182 L 202 184 C 208 182, 210 178, 210 172 Z" fill="#2E86DE" stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M174 160 C 164 160, 162 172, 170 176" fill="none" stroke={K} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="196" cy="154" rx="7" ry="4" fill="#FFFFFF" opacity="0.6" transform="rotate(30 196 154)" />
        </g></g>
      </svg>
    </div>
  );
}

// Coach Ergot (portrait), porté depuis Coach.dc.html.
export function Coach({ size = 160, bg = '#7EE0D6', style }) {
  return (
    <div style={{ width: size, height: size, position: 'relative', ...style }}>
      <svg role="img" aria-label="Coach Ergot, vieux coq entraîneur" viewBox="0 0 160 160" style={{ width: '100%', height: '100%', display: 'block' }}>
        <rect x="2" y="2" width="156" height="156" rx="28" fill={bg} stroke={K} strokeWidth="4" />
        <path d="M6 156 C 6 124, 30 106, 80 104 C 130 106, 154 124, 154 156 Z" fill="#C9783A" stroke={K} strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="22" cy="132" rx="18" ry="16" fill="#C9783A" stroke={K} strokeWidth="3.5" />
        <ellipse cx="138" cy="132" rx="18" ry="16" fill="#C9783A" stroke={K} strokeWidth="3.5" />
        <path d="M60 112 C 70 130, 90 130, 100 112" fill="#E39A4E" />
        <path d="M44 150 q18 -10 36 2 q18 -12 36 -2" stroke="#9E5A26" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M42 128 C 60 114, 100 114, 118 128 L 114 144 C 96 132, 64 132, 46 144 Z" fill="#F2542D" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M52 126 L 50 138 M108 126 L 110 138" stroke="#FFF4DC" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M62 50 C 54 30, 70 24, 74 40 C 72 20, 94 20, 90 38 C 100 28, 114 40, 100 54 C 108 60, 104 70, 96 66 Z" fill="#E8352B" stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
        <ellipse cx="80" cy="76" rx="32" ry="30" fill="#E39A4E" stroke={K} strokeWidth="4" />
        <path d="M100 56 C 114 68, 112 92, 98 100 C 104 88, 104 70, 96 60 Z" fill="#C9783A" />
        <path d="M58 66 q9 -9 19 -2 M83 64 q10 -7 19 2" stroke={K} strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M58 66 q9 -9 19 -2 M83 64 q10 -7 19 2" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M64 74 q5 3 10 0 M86 74 q5 3 10 0" stroke={K} strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M72 84 Q 80 80 88 84 L 80 98 Z" fill="#F5A623" stroke={K} strokeWidth="3" strokeLinejoin="round" />
        <path d="M77 96 C 72 110, 88 112, 84 97 Z" fill="#E8352B" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="90" y="52" width="18" height="7" rx="3" fill="#F7D9B5" stroke={K} strokeWidth="2" transform="rotate(24 99 55.5)" />
        <path d="M62 118 Q 80 138 98 118" stroke={K} strokeWidth="2" fill="none" />
        <rect x="73" y="126" width="15" height="9" rx="3" fill="#FFC93C" stroke={K} strokeWidth="2.5" />
      </svg>
    </div>
  );
}

// Animaux challengers : un gabarit commun (rig partagé par carrure) décliné par espèce.
const LOOKS = {
  souris: { fur: '#B9B4AE', dark: '#8F8A84', belly: '#E7E2DC', ears: 'round', snout: 'mouse', tail: 'thin', bulk: 0.15, gloves: '#F2C230', shorts: '#2E86DE', band: '#FFFFFF', label: 'Souris challenger' },
  moineau: { fur: '#8B5E3C', dark: '#6A4329', belly: '#E9D3B0', ears: 'none', snout: 'beak', tail: 'feather', bulk: 0.25, gloves: '#3FA34D', shorts: '#E8B33A', cap: '#5A3A22', band: '#1A1A1A', label: 'Moineau challenger' },
  hamster: { fur: '#E3A75F', dark: '#C0844A', belly: '#FFF1DC', ears: 'small', snout: 'hamster', tail: 'none', bulk: 0.5, gloves: '#D7262B', shorts: '#35303A', band: '#FFC93C', label: 'Hamster challenger' },
  lapin: { fur: '#EDEAE4', dark: '#C9C4BC', belly: '#FFFFFF', ears: 'long', snout: 'bunny', tail: 'puff', bulk: 0.45, gloves: '#FF2E88', shorts: '#2B3A55', band: '#FFFFFF', label: 'Lapin challenger' },
  canard: { fur: '#FFFFFF', dark: '#D9D6CF', belly: '#FFFDF6', ears: 'none', snout: 'duck', tail: 'feather', bulk: 0.6, gloves: '#2E86DE', shorts: '#3FA34D', band: '#1A1A1A', label: 'Canard challenger' },
  ecureuil: { fur: '#C0642B', dark: '#9A4A1C', belly: '#F2D4AE', ears: 'tuft', snout: 'mouse', tail: 'bushy', bulk: 0.45, gloves: '#B8F000', shorts: '#5A2A2A', band: '#FFC93C', label: 'Écureuil challenger' },
};

export function Animal({ look, size = 300, style, fist }) {
  const L = LOOKS[look];
  const b = L.bulk;
  const sh = 52 + 26 * b; // demi-largeur des épaules
  const wa = 36 + 10 * b;
  const C = 120;
  const torso = `M${C} 112 C${C + sh * 0.7} 110 ${C + sh} 120 ${C + sh} 142 C${C + sh} 168 ${C + wa + 8} 186 ${C + wa} 208 L${C - wa} 208 C${C - wa - 8} 186 ${C - sh} 168 ${C - sh} 142 C${C - sh} 120 ${C - sh * 0.7} 110 ${C} 112 Z`;
  const arm = (s) => {
    const x = C + s * (sh - 2);
    return `M${x} 128 C${x + s * 22} 132 ${x + s * 26} 160 ${x + s * 12} 178 C${x + s * 4} 186 ${x - s * 10} 180 ${x - s * 12} 168 C${x - s * 10} 154 ${x - s * 6} 142 ${x - s * 8} 132 Z`;
  };
  const hasBeak = L.snout === 'beak' || L.snout === 'duck';
  return (
    <div style={{ width: Math.round(size * 0.8), height: size, position: 'relative', ...style }}>
      <svg role="img" aria-label={L.label} viewBox="0 0 240 300" style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}>
        <ellipse cx="120" cy="290" rx="66" ry="8" fill="#000000" opacity="0.18" />
        {L.tail === 'thin' && <path d="M160 236 C 214 244, 236 214, 222 186" fill="none" stroke="#E9A5AE" strokeWidth="5" strokeLinecap="round" />}
        {L.tail === 'bushy' && <path d="M150 230 C 230 240, 240 150, 196 110 C 222 160, 200 200, 160 200 Z" fill={L.fur} stroke={K} strokeWidth="4" strokeLinejoin="round" />}
        {L.tail === 'feather' && <path d="M140 220 L 196 236 L 186 214 L 204 210 L 160 196 Z" fill={L.dark} stroke={K} strokeWidth="3.5" strokeLinejoin="round" />}
        {L.tail === 'puff' && <circle cx="170" cy="228" r="16" fill="#FFFFFF" stroke={K} strokeWidth="3.5" />}
        <path d="M106 246 L103 280 M134 246 L137 280" stroke={K} strokeWidth="12" strokeLinecap="round" />
        <path d="M106 246 L103 280 M134 246 L137 280" stroke={hasBeak ? '#E8B33A' : L.dark} strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="100" cy="284" rx="15" ry="7" fill={hasBeak ? '#E8B33A' : L.belly} stroke={K} strokeWidth="3" />
        <ellipse cx="140" cy="284" rx="15" ry="7" fill={hasBeak ? '#E8B33A' : L.belly} stroke={K} strokeWidth="3" />
        <path d={torso} fill={L.fur} stroke={K} strokeWidth="4" strokeLinejoin="round" />
        <ellipse cx="120" cy="164" rx={22 + 10 * b} ry="36" fill={L.belly} stroke={K} strokeWidth="3" />
        {b > 0.4 && <path d="M108 156 h24 M108 170 h24 M110 184 h20" stroke={L.dark} strokeWidth="2.5" strokeLinecap="round" />}
        <path d="M78 204 C 100 212, 140 212, 162 204 L 170 234 C 156 252, 136 254, 125 242 L 120 232 L 115 242 C 104 254, 84 252, 70 234 Z" fill={L.shorts} stroke={K} strokeWidth="4" strokeLinejoin="round" />
        {/* Ceinture de boxeur : large élastique rayé avec plaque centrale */}
        <path d="M74 192 C 100 203, 140 203, 166 192 L 167 214 C 140 225, 100 225, 73 214 Z" fill={L.band} stroke={K} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M74 198 C 100 209, 140 209, 166 198 M73 208 C 100 219, 140 219, 167 208" stroke={L.shorts} strokeWidth="3" fill="none" />
        <rect x="106" y="198" width="28" height="18" rx="4" fill="#C9CCD1" stroke={K} strokeWidth="2.5" />
        <path d="M120 201 l2.4 4.8 5.2 0.6 -3.9 3.5 1.1 5.1 -4.8 -2.6 -4.8 2.6 1.1 -5.1 -3.9 -3.5 5.2 -0.6 z" fill="#FFC93C" stroke={K} strokeWidth="1.2" strokeLinejoin="round" />
        <g className="arm-l" style={armStyle(fist?.l)}><path d={arm(-1)} fill={L.fur} stroke={K} strokeWidth="4" strokeLinejoin="round" /></g>
        <g className="arm-r" style={armStyle(fist?.r)}><path d={arm(1)} fill={L.fur} stroke={K} strokeWidth="4" strokeLinejoin="round" /></g>
        {/* oreilles */}
        {L.ears === 'round' && (<>
          <circle cx="82" cy="46" r="26" fill={L.fur} stroke={K} strokeWidth="4" /><circle cx="82" cy="46" r="15" fill="#E9A5AE" />
          <circle cx="158" cy="46" r="26" fill={L.fur} stroke={K} strokeWidth="4" /><circle cx="158" cy="46" r="15" fill="#E9A5AE" />
        </>)}
        {L.ears === 'small' && (<>
          <circle cx="90" cy="52" r="13" fill={L.fur} stroke={K} strokeWidth="4" /><circle cx="90" cy="52" r="7" fill="#E9A5AE" />
          <circle cx="150" cy="52" r="13" fill={L.fur} stroke={K} strokeWidth="4" /><circle cx="150" cy="52" r="7" fill="#E9A5AE" />
        </>)}
        {L.ears === 'long' && (<>
          <path d="M96 52 C 80 10, 86 -24, 100 -26 C 114 -24, 112 14, 108 50 Z" fill={L.fur} stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M98 40 C 92 10, 94 -12, 100 -14 C 106 -10, 104 14, 104 40 Z" fill="#F2B8C0" />
          <path d="M132 50 C 130 14, 128 -24, 142 -26 C 156 -24, 160 10, 144 52 Z" fill={L.fur} stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M136 40 C 136 14, 136 -10, 142 -14 C 148 -12, 148 10, 142 40 Z" fill="#F2B8C0" />
        </>)}
        {L.ears === 'tuft' && (<>
          <path d="M86 58 L 82 18 L 104 46 Z" fill={L.fur} stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <path d="M154 58 L 158 18 L 136 46 Z" fill={L.fur} stroke={K} strokeWidth="4" strokeLinejoin="round" />
        </>)}
        {/* tête */}
        <path d="M120 40 C 154 40, 168 64, 164 88 C 160 108, 142 120, 120 120 C 98 120, 80 108, 76 88 C 72 64, 86 40, 120 40 Z" fill={L.fur} stroke={K} strokeWidth="4" />
        {L.cap && <path d="M84 62 C 90 38, 150 38, 156 62 C 140 54, 100 54, 84 62 Z" fill={L.cap} stroke={K} strokeWidth="3" strokeLinejoin="round" />}
        {L.snout === 'hamster' && (<>
          <ellipse cx="88" cy="96" rx="16" ry="13" fill={L.belly} stroke={K} strokeWidth="3" />
          <ellipse cx="152" cy="96" rx="16" ry="13" fill={L.belly} stroke={K} strokeWidth="3" />
        </>)}
        <ellipse cx="104" cy="72" rx="8" ry="9" fill="#FFFFFF" stroke={K} strokeWidth="2.5" />
        <ellipse cx="136" cy="72" rx="8" ry="9" fill="#FFFFFF" stroke={K} strokeWidth="2.5" />
        <circle cx="106" cy="74" r="4.5" fill={K} />
        <circle cx="134" cy="74" r="4.5" fill={K} />
        <path d="M93 60 L113 64 M127 64 L147 60" stroke={K} strokeWidth="5" strokeLinecap="round" />
        {(L.snout === 'mouse' || L.snout === 'hamster' || L.snout === 'bunny') && (<>
          <ellipse cx="120" cy="99" rx="20" ry="14" fill={L.belly} stroke={K} strokeWidth="3" />
          <ellipse cx="120" cy="90" rx="7" ry="5" fill="#E9A5AE" stroke={K} strokeWidth="2.5" />
          <path d="M104 102 Q 118 110 136 100" stroke={K} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M100 96 L78 90 M100 101 L76 104 M140 96 L162 90 M140 101 L164 104" stroke={K} strokeWidth="2" strokeLinecap="round" />
        </>)}
        {L.snout === 'bunny' && <path d="M114 106 L114 116 L126 116 L126 106 M120 106 L120 116" fill="#FFFFFF" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />}
        {L.snout === 'beak' && <path d="M106 88 Q 120 80 134 88 L 120 110 Z" fill="#E8B33A" stroke={K} strokeWidth="3" strokeLinejoin="round" />}
        {L.snout === 'duck' && (<>
          <path d="M96 92 C 100 80, 140 80, 144 92 C 146 104, 94 104, 96 92 Z" fill="#F29A1F" stroke={K} strokeWidth="3" strokeLinejoin="round" />
          <path d="M100 96 Q 120 100 140 96" stroke={K} strokeWidth="2.5" fill="none" />
        </>)}
        <g className="glove-l" style={gloveStyle(fist?.l)}><g transform={`translate(${-6 - 10 * b} -6)`}>
          <rect x="38" y="182" width="30" height="16" rx="5" fill="#FFFFFF" stroke={K} strokeWidth="3" />
          <path d="M30 172 C 26 148, 46 136, 62 142 C 78 148, 80 168, 70 182 L 38 184 C 32 182, 30 178, 30 172 Z" fill={L.gloves} stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="44" cy="154" rx="7" ry="4" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 44 154)" />
        </g></g>
        <g className="glove-r" style={gloveStyle(fist?.r)}><g transform={`translate(${6 + 10 * b} -6)`}>
          <rect x="172" y="182" width="30" height="16" rx="5" fill="#FFFFFF" stroke={K} strokeWidth="3" />
          <path d="M210 172 C 214 148, 194 136, 178 142 C 162 148, 160 168, 170 182 L 202 184 C 208 182, 210 178, 210 172 Z" fill={L.gloves} stroke={K} strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="196" cy="154" rx="7" ry="4" fill="#FFFFFF" opacity="0.6" transform="rotate(30 196 154)" />
        </g></g>
      </svg>
    </div>
  );
}

// Choisit le bon dessin pour un adversaire.
export function Fighter({ look, size = 300, style, fist }) {
  if (look === 'rat') return <Rat size={size} style={style} fist={fist} />;
  if (look === 'cocorico') {
    // Le rival réutilise le rig du joueur (PRD), avec ses propres couleurs.
    return <Poulet palier={3} pose="face" size={size} gloves="#2E86DE" pants="#5A2A2A" plumage={{ body: '#E0B25A', shade: '#B8862E', side: '#C99A40' }} style={style} fist={fist} titleBelt />;
  }
  if (look === 'coach') {
    return <Poulet palier={3} pose="face" size={size} gloves="#F2C230" pants="#F2542D" plumage={{ body: '#E39A4E', shade: '#C9783A', side: '#D08A44' }} style={{ filter: 'saturate(0.7)', ...style }} fist={fist} />;
  }
  return <Animal look={look} size={size} style={style} fist={fist} />;
}
