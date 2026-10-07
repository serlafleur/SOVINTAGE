# SOVINTAGEFRIP — version mobile de l’accueil « Crépuscule »

Couche mobile (≤ 860 px) pour le thème Shopify **SOVINTAGEFRIP — Crépuscule 360** (base Horizon, sections `svf-*`).
Elle s’ajoute au thème sans modifier `svf.css`, `svf-2.css`, `svf.js` ni les réglages de l’éditeur. Au-dessus de 860 px, rien ne change.

Aperçu interactif (avant / après) : https://claude.ai/artifact/2t2PbWJFuS9o6SqVmkW6ob

## État dans Shopify (7 octobre 2026)

Appliqué au thème non publié **SOVINTAGEFRIP — Crépuscule 360** (ID 211137102214), fichiers envoyés depuis le commit `da256ea` et vérifiés par empreinte MD5 :
`assets/svf-mobile.css`, `assets/svf-mobile.js`, `sections/svf-header.liquid`, `sections/svf-mission.liquid`, `templates/page.mission.json`, `sections/header-group.json` (menu à quatre liens).
Page créée et publiée : **Notre mission** (`/pages/notre-mission`, modèle `page.mission`).
Puis, depuis le commit `473a634` : `sections/svf-hero-studio.liquid` (nouvelle bannière) et `templates/index.json` (bannière studio en tête ; ancienne bannière et Matières désactivées).

Le thème en ligne reste **Horizon** : tant que Crépuscule 360 n’est pas publié, ces changements se voient avec l’aperçu du thème
(`https://sovintagefrip.com/?preview_theme_id=211137102214`). Sous Horizon, la page Notre mission s’affiche avec le modèle de page par défaut et son texte de secours.

## Intégration dans Shopify

1. **Ajouter les deux fichiers** dans *Boutique en ligne › Thèmes › Crépuscule 360 › Modifier le code › assets* :
   - `theme/assets/svf-mobile.css`
   - `theme/assets/svf-mobile.js`
2. **Les charger** dans `sections/svf-header.liquid` (déjà fait dans `theme/sections/svf-header.liquid`) :
   - juste après la balise `</style>` :
     ```liquid
     {{ 'svf-mobile.css' | asset_url | stylesheet_tag }}
     ```
   - à la fin du fichier, avant `{% schema %}` :
     ```liquid
     <script src="{{ 'svf-mobile.js' | asset_url }}" defer></script>
     ```
   L’en-tête est présent sur toutes les pages, donc la couche s’applique partout où il s’affiche.
3. **Vérifier** avec l’aperçu du thème depuis un téléphone avant de publier.

Avec Shopify CLI, depuis le dossier `theme/` :

```sh
shopify theme push --theme 211137102214 \
  --only assets/svf-mobile.css --only assets/svf-mobile.js --only sections/svf-header.liquid
```

## Ce que fait la couche mobile

| Section | Thème actuel sur téléphone | Avec la couche mobile |
| --- | --- | --- |
| En-tête | logo et « Panier (0) » se chevauchent à 390 px, boutons hauts de 17 px | icône panier + compteur (nom accessible « Panier, n article »), cibles 44 px, menu en fenêtre modale : focus piégé, fond inerte, Échap, défilement bloqué |
| Bannière | carrousel en rideau à lecture automatique, titre derrière les photos, gros plans, titre coupé sur mobile | remplacée par **SVF · Bannière studio** (`sections/svf-hero-studio.liquid`) : une photo, le titre, une ligne, un bouton, un lien ; aucun JavaScript ; bouton visible dès le premier écran de 320 px au bureau. L’ancienne bannière reste dans le thème, désactivée |
| Le drop | « Voir la pièce » visible au survol uniquement | bouton toujours visible, carte entière cliquable, bouton « 360° » vers la scène sur la bonne Signature |
| Signature 360° | pastilles 26 px, texte secondaire à 3,5:1 | pastilles 68 px, indication « glissez pour faire tourner », contraste 4,8:1 |
| Silhouettes | carrousel calculé au pointeur | bande à faire glisser, synchronisée avec la fiche du look |
| Matières | grille de cinq visuels en parallaxe | section désactivée sur l’accueil (réactivable dans l’éditeur) |
| Sur mesure | visuel après les services | visuel sous le titre, accordéon de 64 px |
| Lettre | champ en 14 px (zoom iOS) | champ en 16 px, bouton 48 px |

Le bureau a été vérifié : à 1 280 px, les 577 éléments mesurés de l’accueil ont les mêmes positions et tailles avec et sans la couche.

## Menu : quatre entrées

**Le drop · La collection · Notre mission · Contact.** Le panier reste en icône dans la barre ; La Signature, Matières et Sur mesure restent accessibles depuis l'accueil (et Sur mesure depuis Contact).

- Code : `sections/svf-header.liquid` n'ajoute plus « Panier » à la fin du menu plein écran ; le bas du menu ne garde que le lien Instagram.
- Éditeur de thème › « SVF · En-tête » (à faire à la main, ces liens sont des réglages et non du code) :
  1. supprimer les liens **La Signature** (`#svf-signature`), **Matières** (`#svf-matieres`) et **Sur mesure** (`#svf-mesure`) ;
  2. ajouter le lien **Notre mission** : libellé « Notre mission », libellé du menu `Notre <em>mission</em>`, adresse `/pages/notre-mission`, affiché dans la barre ;
  3. ordre : Le drop, Collection, Notre mission, Contact.

`theme/sections/header-group.json` contient ces quatre liens : c'est la version envoyée dans le thème Crépuscule 360 le 7 octobre 2026. Si l'en-tête est modifié ensuite dans l'éditeur, récupérer la version en ligne avant de repousser ce fichier.

## Page « Notre mission »

Fichiers : `theme/sections/svf-mission.liquid` (section, styles inclus via `{% stylesheet %}`) et `theme/templates/page.mission.json` (contenu de départ).
La section charge elle-même les styles et scripts svf (`snippets/svf-head`), car `layout/theme.liquid` ne les charge pas pour ce template.

Mise en ligne :
1. Ajouter les deux fichiers au thème (ou `shopify theme push --theme 211137102214 --only sections/svf-mission.liquid --only templates/page.mission.json`).
2. *Boutique en ligne › Pages › Ajouter une page* : titre « Notre mission », modèle **page.mission**. L’adresse devient `/pages/notre-mission`.
3. Ajouter le lien dans l’en-tête (voir « Menu : quatre entrées » ci-dessus).

Contenu : les phrases reprennent des textes déjà présents sur le site (accueil, sur mesure, contact). Sont nouveaux et à valider : le libellé « Ce qui nous anime », le titre « Trois façons de faire », les verbes « Retrouver / Créer / Accompagner », les titres des trois engagements et les liaisons de phrase. Tout se modifie dans l’éditeur de thème.

## Aperçu local

`preview/build.mjs` rend les vraies sections Liquid de `theme/` avec les réglages de `templates/index.json` et `sections/header-group.json`, en simulant les filtres Shopify utilisés (`image_url`, `file_url`, `money`…). Les quatre produits (Cravates Signatures, 40,00 €) reprennent les données de la boutique.

```sh
cd preview
npm install
npm run build        # dist/index.html (comparatif), dist/mobile.html, dist/avant.html, dist/mission.html
npm run shoot        # captures + contrôle débordement / cibles tactiles (Chromium requis)
```

Limites de l’aperçu : seules huit photos de la boutique sont dans `preview/media/photos` ; les blocs qui utilisent d’autres photos affichent le visuel de cravate prévu par la section. Le pied de page Horizon, le panier et les fiches produit ne sont pas simulés.

## Contenu du dépôt

- `theme/` : copie des fichiers `svf-*` du thème (récupérés le 7 octobre 2026) + `assets/svf-mobile.css`, `assets/svf-mobile.js`, et `sections/svf-header.liquid` avec les deux lignes ajoutées.
- `preview/` : générateur d’aperçu, médias (photos, 4 × 72 vues 360°) et page de comparaison.
