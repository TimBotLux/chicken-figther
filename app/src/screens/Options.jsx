import { useRef, useState } from 'react';
import { useGame } from '../game/store.jsx';
import { DIFFICULTY } from '../data/data.js';
import { Modal, Seg, useRaf } from '../components/Ui.jsx';
import { sfx } from '../game/sfx.js';
import { enterFullscreen, exitFullscreen, fullscreenSupported } from '../game/fullscreen.js';

// Calibrage : le joueur tape en rythme sur 8 temps ; le décalage médian ajuste les fenêtres.
function Calibration({ onDone }) {
  const t = useRef(0);
  const beats = useRef([]);
  const taps = useRef([]);
  const [, force] = useState(0);
  const BEAT = 700;
  const N = 10;

  useRaf((dt) => {
    const prev = t.current;
    t.current += dt;
    const k = Math.floor(t.current / BEAT);
    if (k > Math.floor(prev / BEAT) && k <= N) {
      beats.current.push(k * BEAT);
      sfx.click();
    }
    if (k > N + 1) {
      const offs = taps.current
        .map((tp) => {
          const b = beats.current.reduce((best, x) => (Math.abs(x - tp) < Math.abs(best - tp) ? x : best), Infinity);
          return tp - b;
        })
        .filter((d) => Math.abs(d) < 300)
        .sort((a, b) => a - b);
      const med = offs.length ? offs[Math.floor(offs.length / 2)] : 0;
      onDone(Math.max(0, Math.min(120, Math.round(med))));
    }
    force((x) => x + 1);
  });

  const phase = (t.current % BEAT) / BEAT;
  const k = Math.floor(t.current / BEAT);
  return (
    <div onPointerDown={() => taps.current.push(t.current)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 10, border: '3px dashed var(--ink)', cursor: 'pointer' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', border: '4px solid var(--ink)', background: phase < 0.15 && k >= 1 ? 'var(--accent)' : 'var(--panel)' }} />
      <div style={{ fontSize: 13 }}>Tape ici en rythme avec le clic et le flash ({Math.min(k, N)}/{N})…</div>
    </div>
  );
}

export default function Options({ onClose }) {
  const { settings, setSettings } = useGame();
  const [calib, setCalib] = useState(false);
  const set = (k) => (v) => setSettings((s) => ({ ...s, [k]: v }));
  const onOff = [[true, 'Oui'], [false, 'Non']];

  return (
    <Modal title="OPTIONS" onClose={onClose} width={660}>
      <div className="row"><div style={{ width: 210, fontSize: 13 }}>Thème</div><Seg label="Thème" value={settings.theme} onChange={set('theme')} options={[['auto', 'Comme le téléphone'], ['clair', 'Clair'], ['sombre', 'Sombre']]} /></div>
      {fullscreenSupported() && (
        <div className="row"><div style={{ width: 210, fontSize: 13 }}>Plein écran</div><Seg label="Plein écran" value={settings.fullscreen} onChange={(v) => { setSettings((s) => ({ ...s, fullscreen: v })); if (v) enterFullscreen(); else exitFullscreen(); }} options={onOff} /><span style={{ fontSize: 11 }}>masque les barres du navigateur</span></div>
      )}
      <div className="row"><div style={{ width: 210, fontSize: 13 }}>Difficulté</div><Seg label="Difficulté" value={settings.difficulty} onChange={set('difficulty')} options={Object.entries(DIFFICULTY).map(([k, d]) => [k, d.label])} /></div>
      <div className="row"><div style={{ width: 210, fontSize: 13 }}>Assistance au timing</div><Seg label="Assistance au timing" value={settings.assist} onChange={set('assist')} options={onOff} /><span style={{ fontSize: 11 }}>signale l’esquive parfaite</span></div>
      <div className="row"><div style={{ width: 210, fontSize: 13 }}>Mode gaucher</div><Seg label="Mode gaucher" value={settings.gaucher} onChange={set('gaucher')} options={onOff} /><span style={{ fontSize: 11 }}>inverse attaque et défense</span></div>
      <div className="row"><div style={{ width: 210, fontSize: 13 }}>Aide aux commandes en combat</div><Seg label="Zones" value={settings.showZones} onChange={set('showZones')} options={onOff} /></div>
      <div className="row"><div style={{ width: 210, fontSize: 13 }}>Musique</div><Seg label="Musique" value={settings.music ? settings.musicVolume : 0} onChange={(v) => setSettings((s) => ({ ...s, music: v > 0, musicVolume: v || s.musicVolume }))} options={[[0, 'Coupée'], [0.25, 'Douce'], [0.5, 'Normale'], [1, 'Forte']]} /></div>
      <div className="row"><div style={{ width: 210, fontSize: 13 }}>Sons</div><Seg label="Sons" value={settings.sound} onChange={set('sound')} options={onOff} /></div>
      <div className="row"><div style={{ width: 210, fontSize: 13 }}>Vibrations</div><Seg label="Vibrations" value={settings.vibration} onChange={set('vibration')} options={onOff} /></div>
      <div className="row"><div style={{ width: 210, fontSize: 13 }}>Secousses et ralentis</div><Seg label="Secousses" value={settings.shake} onChange={set('shake')} options={onOff} /></div>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ width: 210, fontSize: 13, paddingTop: 8 }}>Latence tactile : {settings.latency} ms</div>
        {calib ? (
          <Calibration onDone={(ms) => { setSettings((s) => ({ ...s, latency: ms })); setCalib(false); }} />
        ) : (
          <button className="btn" style={{ fontSize: 13 }} onClick={() => setCalib(true)}>CALIBRER</button>
        )}
      </div>
    </Modal>
  );
}
