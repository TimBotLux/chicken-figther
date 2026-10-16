import { useGame, readSlots } from '../game/store.jsx';
import { CATEGORIES } from '../data/data.js';
import { palierOf } from '../game/rules.js';
import Poulet from '../components/Poulet.jsx';
import { Rat } from '../components/Characters.jsx';
import { GearIcon } from '../components/Ui.jsx';
import { sfx } from '../game/sfx.js';
import { useInstall } from '../game/pwa.js';
import { autoFullscreen, enterFullscreen, fullscreenSupported, isTouchDevice, useFullscreen } from '../game/fullscreen.js';

// Une seule carrière, sauvegardée automatiquement (emplacement 1).
const SLOT = 1;

export default function Title() {
  const { loadSlot, setModal, settings } = useGame();
  const fullscreen = useFullscreen();
  const save = readSlots().find((s) => s.n === SLOT)?.game;
  const p = save ? palierOf(save.stats) : null;
  const install = useInstall();

  return (
    <div className="screen" style={{ padding: 0 }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'repeating-conic-gradient(from 0deg at 28% 55%, var(--ink) 0deg 0.7deg, var(--panel) 0.7deg 5deg)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 260px 200px at 28% 55%, var(--panel) 40%, var(--panel0) 100%)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 470, clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0 100%)' }}>
        <div style={{ position: 'absolute', left: 150, bottom: -30, filter: 'saturate(1.05)' }}>
          <Poulet palier={1} size={300} />
        </div>
        <div style={{ position: 'absolute', left: 300, bottom: -50, opacity: 0.95 }}>
          <Rat size={250} />
        </div>
        <div className="sfx-text vertical" style={{ position: 'absolute', left: 410, top: 14, fontSize: 30, color: 'var(--cyan)', letterSpacing: -2 }}>ゴゴゴゴ</div>
      </div>

      <div style={{ position: 'absolute', left: 18, top: 14, transform: 'rotate(-4deg)' }}>
        <div className="t" style={{ fontSize: 50, color: 'var(--accent)', textShadow: '-3px -3px 0 var(--ink), 3px -3px 0 var(--ink), -3px 3px 0 var(--ink), 3px 3px 0 var(--ink), 6px 6px 0 var(--cyan)', lineHeight: 0.95 }}>CHICKEN<br />CHAMPION</div>
        <div className="tag" style={{ display: 'inline-block', background: 'var(--lime)', marginTop: 8, transform: 'skewX(-10deg)' }}>チキン・チャンピオン · BOXE RPG</div>
      </div>

      <div style={{ position: 'absolute', right: 30, top: 70, width: 320, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button
          className="btn btn-accent"
          onClick={() => { sfx.click(); autoFullscreen(settings.fullscreen); loadSlot(SLOT); }}
          style={{ minHeight: 120, flexDirection: 'column', gap: 6, transform: 'skewX(-6deg)', boxShadow: '6px 6px 0 var(--cyan)' }}
        >
          <span className="t" style={{ fontSize: 44 }}>JOUER !</span>
          <span style={{ fontFamily: 'var(--text)', fontWeight: 700, fontSize: 13, lineHeight: 1.35 }}>
            {save
              ? `${CATEGORIES[save.catIndex].name} · ${save.belts.length} ceinture${save.belts.length > 1 ? 's' : ''} · palier ${p.n} · ${save.primes} primes`
              : 'Nouvelle carrière'}
          </span>
        </button>
        <button className="btn" onClick={() => setModal('options')} style={{ gap: 8 }}>
          <GearIcon color="var(--ink)" /> OPTIONS
        </button>
        {!fullscreen && isTouchDevice() && fullscreenSupported() && (
          <button className="btn btn-cyan" onClick={enterFullscreen}>⛶ PLEIN ÉCRAN</button>
        )}
        {install.canPrompt && (
          <button className="btn btn-lime" onClick={install.prompt}>📲 INSTALLER L’APPLICATION</button>
        )}
        {install.iosHint && (
          <div className="box" style={{ padding: '6px 10px', fontSize: 12, lineHeight: 1.35 }}>
            Sur iPhone : touche <b>Partager</b> puis <b>Sur l’écran d’accueil</b> pour installer le jeu.
          </div>
        )}
      </div>
    </div>
  );
}
