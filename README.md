# SOVINTAGEFRIP — version mobile de l’accueil « Crépuscule »

Couche mobile (≤ 860 px) pour le thème Shopify **SOVINTAGEFRIP — Crépuscule 360** (base Horizon, sections `svf-*`).
Elle s’ajoute au thème sans modifier `svf.css`, `svf-2.css`, `svf.js` ni les réglages de l’éditeur. Au-dessus de 860 px, rien ne change.

Aperçu interactif (avant / après) : https://claude.ai/artifact/2t2PbWJFuS9o6SqVmkW6ob

## État dans Shopify (7 octobre 2026)

Appliqué au thème non publié **SOVINTAGEFRIP — Crépuscule 360** (ID 211137102214), fichiers envoyés depuis le commit `da256ea` et vérifiés par empreinte MD5 :
`assets/svf-mobile.css`, `assets/svf-mobile.js`, `sections/svf-header.liquid`, `sections/svf-mission.liquid`, `templates/page.mission.json`, `sections/header-group.json` (menu à quatre liens).
Page créée et publiée : **Notre mission** (`/pages/notre-mission`, modèle `page.mission`).
Puis, depuis le commit `473a634` : `sections/svf-hero-studio.liquid` (nouvelle bannière) et `templates/index.json` (bannière studio en tête ; ancienne bannière et Matières désactivées).
Puis, depuis le commit `ce69b75` : `assets/svf.js`, `sections/svf-look.liquid`, les 9 `templates/page.look-*.json` et `templates/page.collection-looks.json` (vraies pièces, descriptions, conseils d’entretien, pièces vendues).
Puis, depuis le commit `f4b2259` : `snippets/svf-fonts.liquid`, `assets/svf-type.css`, `snippets/svf-head.liquid`, `sections/svf-header.liquid`, `assets/svf-mobile.css` (charte typographique).
Puis, depuis les commits `ed1374e` et suivant : `sections/svf-drop.liquid`, `svf-hero-studio.liquid`, `svf-header.liquid`, `svf-intro.liquid`, `svf-lettre.liquid`, `svf-mission.liquid`, `svf-404.liquid`, `svf-hero.liquid`, `templates/index.json`, `templates/page.mission.json`, `sections/header-group.json` (plus de « premier drop » ni de « 20 cravates » : bouton « Explorez la collection », section « Les Cravates Signatures », menu « Cravates »).
Fiches produit des quatre Cravates Signatures : « Pièce du premier drop Crépuscule FW26 » devient « Pièce de la collection Crépuscule FW26 ».

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
| Cravates Signatures | « Voir la pièce » visible au survol uniquement | bouton toujours visible, carte entière cliquable, bouton « 360° » vers la scène sur la bonne Signature |
| Signature 360° | pastilles 26 px, texte secondaire à 3,5:1 | pastilles 68 px, indication « glissez pour faire tourner », contraste 4,8:1 |
| Silhouettes | carrousel calculé au pointeur | bande à faire glisser, synchronisée avec la fiche du look |
| Matières | grille de cinq visuels en parallaxe | section désactivée sur l’accueil (réactivable dans l’éditeur) |
| Sur mesure | visuel après les services | visuel sous le titre, accordéon de 64 px |
| Lettre | champ en 14 px (zoom iOS) | champ en 16 px, bouton 48 px |

Le bureau a été vérifié : à 1 280 px, les 577 éléments mesurés de l’accueil ont les mêmes positions et tailles avec et sans la couche.

## Menu : quatre entrées

**Cravates · La collection · Notre mission · Contact.** Le panier reste en icône dans la barre ; La Signature, Matières et Sur mesure restent accessibles depuis l'accueil (et Sur mesure depuis Contact).

- Code : `sections/svf-header.liquid` n'ajoute plus « Panier » à la fin du menu plein écran ; le bas du menu ne garde que le lien Instagram.
- Éditeur de thème › « SVF · En-tête » (à faire à la main, ces liens sont des réglages et non du code) :
  1. supprimer les liens **La Signature** (`#svf-signature`), **Matières** (`#svf-matieres`) et **Sur mesure** (`#svf-mesure`) ;
  2. ajouter le lien **Notre mission** : libellé « Notre mission », libellé du menu `Notre <em>mission</em>`, adresse `/pages/notre-mission`, affiché dans la barre ;
  3. ordre : Cravates, Collection, Notre mission, Contact.

`theme/sections/header-group.json` contient ces quatre liens : c'est la version envoyée dans le thème Crépuscule 360 le 7 octobre 2026. Si l'en-tête est modifié ensuite dans l'éditeur, récupérer la version en ligne avant de repousser ce fichier.

## Page « Notre mission »

Fichiers : `theme/sections/svf-mission.liquid` (section, styles inclus via `{% stylesheet %}`) et `theme/templates/page.mission.json` (contenu de départ).
La section charge elle-même les styles et scripts svf (`snippets/svf-head`), car `layout/theme.liquid` ne les charge pas pour ce template.

Mise en ligne :
1. Ajouter les deux fichiers au thème (ou `shopify theme push --theme 211137102214 --only sections/svf-mission.liquid --only templates/page.mission.json`).
2. *Boutique en ligne › Pages › Ajouter une page* : titre « Notre mission », modèle **page.mission**. L’adresse devient `/pages/notre-mission`.
3. Ajouter le lien dans l’en-tête (voir « Menu : quatre entrées » ci-dessus).

Contenu : les phrases reprennent des textes déjà présents sur le site (accueil, sur mesure, contact). Sont nouveaux et à valider : le libellé « Ce qui nous anime », le titre « Trois façons de faire », les verbes « Retrouver / Créer / Accompagner », les titres des trois engagements et les liaisons de phrase. Tout se modifie dans l’éditeur de thème.

## Typographie

Deux familles, jamais plus (`snippets/svf-fonts.liquid`, `assets/svf-type.css`) :
- **Montserrat** (principale) : titres, noms de collections et de pièces, logo, menu.
- **Montaser Arabic** (secondaire) : textes, descriptions, informations pratiques, interface (boutons, prix, légendes).

Les anciennes polices (Bodoni Moda, Archivo, IBM Plex Mono) ne sont plus chargées. Montaser Arabic n’est pas sur Google Fonts : tant que ses fichiers ne sont pas déposés dans *Contenu › Fichiers* et déclarés dans `snippets/svf-fonts.liquid` (`text_font_regular`, `text_font_bold`), les textes s’affichent en Montserrat.
Les pages Horizon hors sections svf (fiche produit par défaut, panier, compte) utilisent les polices réglées dans *Paramètres du thème › Typographie*.

## Pages look

Les pièces viennent de la liste fournie par la marque (7 octobre 2026). Deux pièces sont vendues : **Noir Rebelle** (Eliot) et **Bordeaux Impérial** (Florian). Elles restent affichées avec « Vendu », hors sélection et hors panier.
Les pièces disponibles n’ont pas encore de produit Shopify : elles affichent « Sur demande » et un lien de réservation vers `/pages/contact`. Pour les vendre en ligne, créer le produit (prix, taille) puis le lier au bloc de la pièce dans l’éditeur ; un produit épuisé s’affiche automatiquement comme vendu.
Les pantalons et vestes d’exemple de la maquette (avec prix d’exemple) ont été retirés. Les cravates Signature restent liées à leurs produits (40,00 €).

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
