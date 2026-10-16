# Chicken Champion — prototype React

Prototype jouable du MVP décrit dans `../PRD_Chicken_Champion_v2.3.docx`, avec la direction artistique des maquettes (`../maquettes/`) : style manga, accents néon, thèmes clair et sombre.

Le PRD prévoit Unity (URP) pour le jeu final. Ce prototype web sert à éprouver la boucle « salle → pesée → combat » et les gestes tactiles avant la production.

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173 (ou l'adresse « Network » affichée depuis un téléphone sur le même Wi-Fi, en mode paysage).

`npm run build` produit une version statique dans `dist/`.

## Application mobile (PWA)

Le jeu s'installe sur l'écran d'accueil comme une application, s'ouvre en plein écran et en paysage, et fonctionne hors ligne après une première ouverture.

1. `npm run build`, puis publier le dossier `dist/` sur un hébergement **HTTPS** (Netlify, Vercel, GitHub Pages…). Le service worker ne fonctionne qu'en HTTPS ou sur `localhost`.
2. Ouvrir l'adresse sur le téléphone :
   - **Android (Chrome)** : bouton « Installer l'application » sur l'écran titre, ou menu ⋮ › Installer l'application.
   - **iPhone (Safari)** : Partager › Sur l'écran d'accueil.

Pour tester la version installable sur l'ordinateur : `npm run build` puis `npm run preview` (http://localhost:4173).

Fichiers : `public/manifest.webmanifest` (nom, icônes, plein écran, paysage), `public/sw.js` (cache hors ligne ; incrémenter `VERSION` pour vider les anciens caches), `public/icons/`, `src/game/pwa.js` (bouton d'installation).

Limites sur iPhone : l'orientation n'est pas verrouillée (un message demande de tourner le téléphone) et la vibration n'est pas disponible.

## Mise en ligne sur Netlify

La configuration est dans `../netlify.toml` (à la racine du projet) : dossier `app`, commande `npm ci && npm run build`, publication de `dist`, Node 20, en-têtes de cache adaptés au service worker.

Trois façons de publier :

- **Glisser-déposer** (le plus simple, sans compte Git) : `npm run build`, puis déposer le dossier `app/dist` sur https://app.netlify.com/drop. Les en-têtes de `netlify.toml` ne s'appliquent pas dans ce cas, mais le jeu fonctionne.
- **Depuis un dépôt Git** (GitHub, GitLab…) : pousser le projet, puis sur Netlify « Add new site › Import an existing project ». `netlify.toml` est lu automatiquement ; chaque push redéploie.
- **En ligne de commande** : `npx netlify-cli deploy --prod` depuis la racine du projet (connexion au compte Netlify demandée la première fois).

Netlify fournit le HTTPS, nécessaire pour installer la PWA sur un téléphone.

## Contenu

- **Tutoriel** : sparring guidé par Coach Ergot (coup, garde, esquive, esquive parfaite, coup de bec).
- **Carte des catégories** : 6 catégories aux poids de la boxe pro ; mouche et plume jouables (MVP), 8 adversaires dont 2 champions, combats d'exhibition pour les challengers battus.
- **Salle** : 3 mini-jeux (développé couché, sac de frappe, corde à sauter), énergie (3 séances saines), fatigue, coût des séances (1re gratuite), simulation rapide à 70 %, boutique réduite.
- **Pesée** : fourchettes en kg, malus « trop lourd » (−50 % de prime, −15 % d'endurance) et « trop léger » (−15 % de résistance).
- **Combat sur rail** : moitié gauche défense (garde haute/basse, esquives, recul), moitié droite attaque (jab, crochet, uppercut), coup de bec, endurance, télégraphes visuels + sonores + vibration, esquive parfaite et contre, knock-downs, KO / KO technique / décision, rounds de 40 s (`ROUND_MS` dans `data.js`), coin entre les rounds (15 s), phase enragée des champions.
- **Progression** : XP, niveaux, compétences (Cogneur, Esquiveur, Contreur), 5 paliers de musculature du coq, ceintures.
- **Options** : thème (suit le téléphone par défaut), difficulté, assistance au timing, mode gaucher, zones de gestes, sons, vibrations, secousses/ralentis, calibrage de la latence tactile.
- **Sauvegarde** : 3 emplacements locaux, sauvegarde automatique entre les rounds et reprise d'un combat interrompu.

Clavier (tests sur ordinateur) : A/D ou ←/→ esquive · S/↓ recul · W garde haute · X garde basse · J jab · K crochet · L/↑ uppercut · Espace coup de bec · Échap pause.

## Équilibrage

Toutes les valeurs (PV, télégraphes en ms, primes, coûts, seuils des paliers…) sont dans `src/data/data.js` et `src/game/engine.js`. Ce sont des valeurs de départ, à ajuster en playtest.
