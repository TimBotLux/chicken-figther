# Chicken Champion — dossier projet

Enregistré le 15/10/2026.

## Contenu

- `PRD_Chicken_Champion_v2.3.docx` — PRD à jour (version 2.3, 15/10/2026), avec les commentaires de revue dans la marge.
- `PRD_anciennes_versions/` — versions 2, 2.1 et 2.2 du PRD, pour l'historique.
- `maquettes/project/` — fichiers sources des maquettes Claude Design (format `.dc.html`) et le plan du canevas (`canvas.json`) :
  - Écrans (thème clair) : `Main` (combat), `Coin` (entre les rounds), `Salle`, `Pesee`, `Carte`.
  - Écrans (thème sombre) : `MainSombre`, `CoinSombre`, `SalleSombre`, `PeseeSombre`, `CarteSombre`.
  - Personnages : `Poulet` (5 paliers de musculature, vues de face et de dos), `Rat`, `Coach`.
  - Planches : `Evolution` (les 5 paliers du coq), `Reference` (image de style fournie).
- `maquettes/assets/reference-coq.png` — l'image de référence du coq.

## Voir les maquettes

Les fichiers `.dc.html` ont besoin de l'éditeur Claude Design pour s'afficher : ouverts directement dans un navigateur, ils ne rendent pas correctement. La version vivante est le canevas « Chicken Champion — écrans clés » dans la galerie d'artefacts Claude. Depuis le canevas, le menu Partager › Exporter permet d'enregistrer les écrans en PDF ou en images.

## Décisions actées (14–15/10/2026)

- Caméra sur rail, moteur Unity (URP).
- Téléphone et tablette uniquement (iOS, Android), modèle gratuit (free-to-play).
- Multijoueur hors périmètre.
- Poids réels de la boxe pro (mouche ≤ 50,8 kg, plume ≤ 57,2 kg, léger ≤ 61,2 kg, moyen ≤ 72,6 kg, mi-lourd ≤ 79,4 kg, lourd > 90,7 kg), à la place du gabarit fictif.
- Le coq démarre maigrichon et se muscle sur 5 paliers.
- Design : style manga avec accents néon, thèmes clair et sombre, coq au style anime d'après la référence.

Toutes ces décisions sont reportées dans le PRD v2.3.
