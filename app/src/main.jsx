import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { GameProvider, useGame } from './game/store.jsx';
import { setSoundEnabled } from './game/sfx.js';
import { playTrack, setMusic } from './game/music.js';
import { OPPONENTS } from './data/data.js';
import { useStageScale } from './components/Ui.jsx';
import Title from './screens/Title.jsx';
import Carte from './screens/Carte.jsx';
import Salle from './screens/Salle.jsx';
import MiniGame from './screens/MiniGame.jsx';
import Pesee from './screens/Pesee.jsx';
import Combat from './screens/Combat.jsx';
import Result from './screens/Result.jsx';
import Options from './screens/Options.jsx';
import { Shop, Skills } from './screens/Shop.jsx';

function useTheme(pref) {
  const [sysDark, setSysDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const on = (e) => setSysDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const theme = pref === 'auto' ? (sysDark ? 'sombre' : 'clair') : pref;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return theme;
}

function Screens() {
  const { route, modal, setModal, settings } = useGame();
  useTheme(settings.theme);
  useEffect(() => setSoundEnabled(settings.sound), [settings.sound]);
  useEffect(() => setMusic(settings.music, settings.musicVolume), [settings.music, settings.musicVolume]);
  // Un morceau par ambiance : menus, salle, combat, thème d'entrée des champions.
  const champion = OPPONENTS[route.oppId]?.champion;
  const track = { title: 'menu', carte: 'menu', result: 'menu', salle: 'salle', minigame: 'salle', tuto: 'combat', pesee: champion ? 'boss' : 'combat', combat: champion ? 'boss' : 'combat' }[route.name] || 'menu';
  useEffect(() => playTrack(track), [track]);
  const viewportRef = useRef(null);
  const { scale, x, y } = useStageScale(viewportRef);

  let screen;
  switch (route.name) {
    case 'carte': screen = <Carte />; break;
    case 'salle': screen = <Salle />; break;
    case 'minigame': screen = <MiniGame key={route.id + route.n} id={route.id} />; break;
    case 'pesee': screen = <Pesee oppId={route.oppId} exhibition={route.exhibition} />; break;
    case 'combat': screen = <Combat key={route.n} {...route} />; break;
    case 'tuto': screen = <Combat key="tuto" oppId="coach" tutorial />; break;
    case 'result': screen = <Result summary={route.summary} />; break;
    default: screen = <Title />;
  }

  return (
    <div className="viewport" ref={viewportRef}>
      <div className="stage" style={{ transform: `translate(${x}px, ${y}px) scale(${scale})` }} data-scale={scale}>
        {screen}
        {modal === 'options' && <Options onClose={() => setModal(null)} />}
        {modal === 'shop' && <Shop onClose={() => setModal(null)} />}
        {modal === 'skills' && <Skills onClose={() => setModal(null)} />}
      </div>
      <div className="rotate-hint">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>
        Tourne ton téléphone en paysage !
      </div>
    </div>
  );
}

// PWA : le service worker rend le jeu jouable hors ligne (version compilée uniquement,
// pour ne pas gêner le rechargement à chaud en développement).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider>
      <Screens />
    </GameProvider>
  </StrictMode>,
);
