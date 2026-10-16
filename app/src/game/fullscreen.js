import { useEffect, useState } from 'react';
import { isStandalone } from './pwa.js';

// Plein écran sur téléphone : masque les barres du navigateur pour que la scène
// occupe tout l'écran, puis verrouille le paysage quand le système le permet
// (Android / Chrome). Safari sur iPhone ne le permet pas : installer la PWA.

export const isTouchDevice = () => window.matchMedia?.('(pointer: coarse)').matches ?? false;

export const fullscreenSupported = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);

export const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

export async function enterFullscreen() {
  const el = document.documentElement;
  try {
    if (!isFullscreen()) {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  } catch {
    return;
  }
  try {
    await screen.orientation?.lock?.('landscape');
  } catch {
    /* verrouillage refusé : le message « tourne ton téléphone » prend le relais */
  }
}

export async function exitFullscreen() {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else document.webkitExitFullscreen?.();
  } catch {
    /* déjà sorti */
  }
}

// À appeler depuis un geste du joueur (tap) : seulement sur téléphone/tablette,
// hors application installée (déjà plein écran), et si le réglage est actif.
export function autoFullscreen(setting) {
  if (setting && isTouchDevice() && !isStandalone() && fullscreenSupported()) enterFullscreen();
}

export function useFullscreen() {
  const [on, setOn] = useState(isFullscreen);
  useEffect(() => {
    const fn = () => setOn(isFullscreen());
    document.addEventListener('fullscreenchange', fn);
    document.addEventListener('webkitfullscreenchange', fn);
    return () => {
      document.removeEventListener('fullscreenchange', fn);
      document.removeEventListener('webkitfullscreenchange', fn);
    };
  }, []);
  return on;
}
