# Chicken Champion

Jeu de boxe RPG mobile : un coq maigrichon gravit les catégories de poids de la boxe pro. Le jeu final est prévu sous Unity (URP), sur iOS et Android (voir le PRD). `app/` est un **prototype web React** qui sert à tester la boucle salle → pesée → combat et les gestes tactiles.

## Sources de vérité

- `PRD_Chicken_Champion_v2.3.docx` : PRD à jour. Les versions précédentes sont dans `PRD_anciennes_versions/`, pour l'historique seulement.
- `maquettes/project/*.dc.html` : maquettes Claude Design. Elles ne s'affichent pas dans un navigateur, mais leur code (SVG, couleurs, mise en page) est la référence visuelle.
- `LISEZMOI.md` : décisions actées. `app/README.md` : contenu du prototype et commandes.

En cas de doute sur une règle de jeu (poids, pénalités, énergie, rounds…), suivre le PRD v2.3.

## Commandes

```bash
npm --prefix app install
npm --prefix app run dev      # http://localhost:5173 (adresse « Network » pour un téléphone)
npm --prefix app run build    # vérifie la compilation, sortie dans app/dist
npm --prefix app run preview  # version compilée + PWA (service worker), http://localhost:4173
```

Déploiement : `netlify.toml` à la racine (base `app`, publication `app/dist`). Ne jamais publier sans l'accord explicite de l'utilisateur.

Pas de tests automatisés ni de linter : vérifier avec `build`, puis dans le navigateur (`.claude/launch.json` : configuration `chicken-champion`).

## Structure (`app/src`)

- `data/data.js` : toutes les données et l'équilibrage (stats, paliers, catégories, adversaires, attaques, mini-jeux, boutique, compétences, difficulté, économie). Les réglages chiffrés se modifient ici en priorité.
- `game/engine.js` : moteur de combat **pur**, sans React. Il gère le rail, les télégraphes, l'esquive parfaite, les KO, les rounds et le tutoriel (`TUTORIAL`). Il émet des événements que `Combat.jsx` récupère avec `drain()`. Tous les temps sont en millisecondes.
- `game/store.jsx` : contexte React (partie, réglages, navigation `route`, modales), sauvegarde et `resolveFight`.
- `game/rules.js` : calculs partagés (palier, pesée, coût des séances, gains).
- `game/sfx.js`, `game/music.js` : sons et musique générés en direct avec Web Audio (aucun fichier audio), vibrations.
- `components/` : personnages SVG (`Poulet.jsx`, repris tel quel de la maquette, 5 paliers face/dos ; `Characters.jsx` : Rat, Coach, animaux génériques) et briques d'interface (`Ui.jsx`).
- `game/pwa.js` + `public/manifest.webmanifest`, `public/sw.js`, `public/icons/` : application installable (PWA), plein écran, paysage, hors ligne.
- `screens/` : un fichier par écran (Title, Carte, Salle, MiniGame, Pesee, Combat, Corner, Result, Options, Shop).

## Conventions

- **Interface et commentaires en français**, ton du PRD (humour, onomatopées en katakana avec leur traduction).
- **Scène fixe 844×390** mise à l'échelle (`useStageScale`), en paysage. Positionner les éléments en pixels sur cette scène, comme dans les maquettes. Cibles tactiles d'au moins 44 px.
- **Couleurs uniquement via les variables CSS** de `styles.css` (`--ink`, `--panel`, `--paper`, `--accent` rose, `--cyan`, `--lime`…). Elles sont redéfinies pour le thème sombre (`[data-theme='sombre']`). Pas de couleur codée en dur dans l'interface, sauf pour le dessin des personnages.
- Polices : `Dela Gothic One` (classe `.t`, titres et onomatopées) et `Zen Kaku Gothic New` (texte courant).
- Les couleurs néon ne doivent jamais porter seules une information (règle d'accessibilité du PRD).
- Pas de pay-to-win : tout s'achète avec les primes gagnées en jeu.

## Sauvegarde

- Une seule carrière, dans `localStorage` sous la clé `cc.slot.1`, enregistrée à chaque changement. Les réglages sont sous `cc.settings`.
- Un combat en cours est sauvegardé entre les rounds (`pendingFight`) et peut être repris depuis la carte.
- Pas de backend : décision prise pour le prototype. La sauvegarde cloud est prévue dans la version Unity (iCloud / Google Play Games).
- Si on ajoute un champ à la partie, lui donner une valeur par défaut dans `newGame()` : `loadSlot` fusionne les anciennes sauvegardes avec ces valeurs.

## Pièges connus

- Le service worker n'est enregistré que dans la version compilée (`import.meta.env.PROD`), jamais en `dev`. Après une modification des fichiers mis en cache, incrémenter `VERSION` dans `public/sw.js`. Un SW n'est actif qu'en HTTPS ou sur `localhost`.
- La scène se dimensionne sur `.viewport`, qui exclut les encoches (`env(safe-area-inset-*)`), et non sur la fenêtre.

- En développement seulement, `window.__eng` expose le moteur de combat et `window.__speed` accélère le temps : pratique pour piloter un combat depuis la console.
- Après une modification de `store.jsx` ou `main.jsx`, le rechargement à chaud de Vite peut casser le contexte React : recharger la page.
- La vibration (`navigator.vibrate`) ne fonctionne pas sur iPhone (Safari) ; elle fonctionne sur Android.
- Le son ne démarre qu'après un premier tap ou une touche (règle des navigateurs).
- Après un changement d'équilibrage, simuler des combats en appelant directement `FightEngine` depuis Node (le moteur n'a aucune dépendance React).
