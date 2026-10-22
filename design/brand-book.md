Outrance est une association lyonnaise qui organise des soirées psytrance depuis 2014, à Lyon et en Belgique. Le site doit avoir l’énergie d’un flyer de soirée et la clarté d’une billetterie : sombre, nocturne, psychédélique sans être chargé, et toujours un chemin évident vers le prochain événement.

## Ton et contenu

- Écris en français, en **tutoyant** le public : « Inscris-toi à notre newsletter », « Pour ne plus rien rater de nos futurs événements ».
- Parle en **nous** pour l’association : « Nous accueillerons Hypogeo, grand maître de la Dark Prog ».
- Garde le ton complice et passionné des descriptions d’événement ; une touche d’humour est bienvenue (« Promis, on ne te spammera pas »).
- Mets en **capitales** les titres de section, les boutons et les labels (AGENDA, BILLETTERIE, PLUS D’INFOS). Le texte courant reste en casse normale.
- Sépare le format et le genre d’un artiste par **◉** : `LIVE ◉ DARKPROG`, `DJSET ◉ FULLON/PSYGROOVY`.
- Écris les dates au format court en capitales : `VEN. 19/12/2025`, horaires `23H30 – 05H00`.
- Le **ॐ** fait partie de l’identité : il peut lier le nom de la soirée et le lieu (`OUTRANCE ॐ KAO`). N’en mets jamais plus d’un par titre.
- Les emojis restent dans le texte éditorial des événements, jamais dans l’interface (boutons, menus, labels).

## Couleurs

- Pose tout sur `nuit`. Le site n’a pas de thème clair.
- Les cartes et panneaux utilisent `nuit-raised` ; les encarts mis en avant (chiffres clés, infos pratiques) utilisent `lotus-deep`.
- `lotus` est la couleur de marque : liens, menu actif, séparateurs ◉, motif mandala.
- `uv` est réservé à **une seule** action par écran, en général le bouton BILLETTERIE. Le texte sur `uv` ou `lotus` est en `nuit`.
- `ember` signale uniquement un état (COMPLET, DERNIÈRES PLACES, erreur).
- Le texte principal est en `ink`, le secondaire en `ink-muted`. `line` sert aux filets décoratifs, `border` aux contours de champs et de boutons secondaires.

## Typographie

- `display-xl` et `display-l` (Unbounded) portent les noms d’événements et les titres, en capitales.
- `title` (Unbounded) titre les cartes ; `body-l` et `body` (Manrope) portent le texte ; `label` (JetBrains Mono, capitales, interlettrage large) porte dates, lieux, genres et métadonnées.
- `button` (Unbounded) habille les boutons et le menu.

## Mise en page

- Grille de 12 colonnes, contenu limité à 1280px, marges `space-12` en desktop et `space-4` en mobile.
- Espace les sections de `space-24` (64px en mobile). Dans une carte, utilise `space-6` de padding.
- Arrondis : `radius-md` pour les cartes et vignettes, `radius-pill` pour les boutons et pastilles, `radius-sm` pour les tags et champs.
- Les visuels d’événement sont au format paysage 1920×1005 (ratio ≈ 1,91:1) ; les photos d’artistes en 4:5.
- Pas d’ombres portées : la profondeur vient du contraste `nuit` / `nuit-raised` / `lotus-deep` et d’un halo `lotus` au survol.

## Mouvement

### Principes

- Anime uniquement `transform` et `opacity` (jamais la mise en page), et lie les grandes animations à la position de scroll plutôt qu’au temps.
- Courbe par défaut : `cubic-bezier(.2,.7,.2,1)`. Apparitions au scroll : fondu + translation de 24px, 600ms, cascade de 80ms.
- Au survol, les cartes passent sur `lotus-deep`, montent de 4px et leur image zoome de 4 %.
- Respecte `prefers-reduced-motion` : pas de rotation, pas de marquee, pas de scroll lié ; on affiche directement l’état final (lotus ouvert, compteurs pleins, timeline tracée).
- Tout ce qui bouge plus de 5 secondes (marquee, mandala) doit pouvoir être mis en pause : le marquee s’arrête au survol et au focus.

### Le lotus, motif signature

Le lotus est un motif géométrique de trois couronnes de pétales (12 extérieurs, 12 médians décalés de 15°, 8 intérieurs) entourées d’anneaux concentriques, tracé en `lotus` sur `nuit`, pétales intérieurs remplis de `lotus-deep`. Il ne remplace jamais le logo et ne se pose jamais sur un visuel d’événement.

### Chorégraphie de scroll « Floraison » (page d’accueil)

1. **Bouton** (0 → 4 % du hero) : le lotus est fermé, en bouton, et respire lentement (échelle 1 → 1,04 sur 4,5 s). Le logo et « Scrolle pour faire éclore » sont posés dessous.
2. **Éclosion** (4 → 50 %) : les pétales s’ouvrent de ±35° à 360°, les anneaux s’étendent, le lotus tourne de 110° sur toute la durée du hero. L’intro disparaît vers le haut.
3. **Révélation** (36 → 58 %) : le prochain événement apparaît au centre du lotus ouvert (fondu + 48px), le lotus passe à 65 % d’opacité derrière le texte.
4. **Envol** (72 → 100 %) : le lotus rétrécit à 5 % et file se poser dans le header, à gauche du logo, où il devient la jauge de lecture de la page (anneau `lotus` qui se remplit).
5. **Marquee** : la bande d’artistes avance avec le scroll (0,45px par pixel), un nom sur deux en contour `lotus`.
6. **Iris** : le bloc chiffres clés s’ouvre par un cercle `lotus-deep` qui grandit depuis le centre ; les compteurs montent de 0 à leur valeur.
7. **Timeline** : la ligne se trace au fil du scroll et chaque date s’allume quand elle est atteinte.
8. **Finale** : en pied de page, un grand lotus se rouvre derrière le logo, avec « À très vite sur le dancefloor ».

### Niveaux de mouvement par appareil

- **Desktop (souris)** : chorégraphie complète. Au repos : lucioles, lévitation 3D du lotus, balancement de chaque pétale, ondes, dérive du bandeau. À la souris : halo qui suit le curseur sans retard, parallaxe du lotus et des cercles, pétales qui traînent derrière le geste avec un rebond. Les mises à jour liées à la souris passent par des variables CSS posées sur les seuls éléments concernés, une fois par image, jamais par un re-rendu de la page.
- **Tablette (tactile)** : le hero reste lié au scroll (éclosion, révélation, envol vers la jauge) et l’iris des chiffres garde son entrée et sa sortie. Les autres sections apparaissent une seule fois en fondu et montée, par transition CSS. Pas de halo, pas de parallaxe, pas de balancement pétale par pétale ; lévitation sans inclinaison 3D ; 12 lucioles. L’orbite des artistes s’ouvre au toucher (toucher à nouveau pour refermer).
- **Mobile** : seul le hero est lié au scroll (hero raccourci, environ 190vh). Tout le reste est révélé une fois, par transition CSS, y compris l’iris des chiffres (sans compteurs). Le roster devient une fleur avec un rail d’artistes au toucher. 8 lucioles, aucun effet 3D.
- Sur tactile, la jauge de lecture et sa rotation sont mises à jour directement dans le DOM, et l’état de la page n’est recalculé que pendant le hero ou quand une section se révèle.

## Responsive

- Points de rupture : mobile < 640px, tablette 640–1023px, desktop ≥ 1024px. Maquettes de référence à 390, 834 et 1440px.
- En mobile et tablette, la navigation passe dans un menu plein écran (burger) ; le bouton BILLETTERIE reste visible.
- En mobile, les listes horizontales (événements passés, roster, aftermovies) deviennent des rails à défilement horizontal avec aimantation.
- Sur la fiche événement mobile, une barre collante en bas d’écran porte le tarif et le bouton BILLETTERIE en `uv`.
- Cibles tactiles d’au moins 44px.

## Interactions et composants

- **Hiérarchie des actions** : bouton `uv` (une fois par écran) → bouton `lotus` (abonnement, envoi de formulaire) → bouton contour (lien externe) → lien fléché `label` `lotus` pour tous les renvois « voir tout ». Évite d’empiler les boutons contour.
- **Statuts d’événement** : tag `lotus` « À venir », tag `ember` plein « Complet », tag `ember` contour « Dernières places », tag `nuit-raised` « Passé ». Une carte passée garde son titre en `ink-muted` et propose « Voir les photos ».
- **Fiche artiste** : pas de page dédiée. Panneau latéral de 560px en desktop (glisse depuis la droite en 550ms, contenu décalé de 150ms), panneau qui remonte du bas sur 82 % de l’écran en mobile. Navigation artiste précédent / suivant et bouton « Booker » qui pré-remplit le formulaire.
- **Visionneuses** photo et vidéo : plein écran sur fond `nuit` à 96 %, ouverture en iris (cercle qui s’agrandit depuis le centre, 700ms). Les vidéos YouTube ne se chargent qu’au clic, en mode sans cookie.
- **Portraits** : traitement duotone (ombres `nuit`, hautes lumières `lotus`) qui repasse en couleurs naturelles au survol. En attendant les photos, l’initiale de l’artiste en contour `lotus`.
- **Menus contextuels** (ajout à l’agenda, partage) : fond `nuit`, filet `line`, rayon `radius-md`, apparition en 300ms. **Notifications** en pilule `nuit-raised`, une seule à la fois, 4s.
- **Formulaires** : quatre états obligatoires (repos, envoi, succès, erreur). L’erreur s’écrit en `ember` sous le champ, en phrase complète.

## Iconographie

- Icônes au trait, 24px, épaisseur 1,75, en `currentColor` (réseaux : Facebook, Instagram, SoundCloud, YouTube ; flèches, lieu, horaire, ticket).
- Pas d’emoji dans l’interface.

## Logo

- Utilise le wordmark officiel `assets/Logos/outrance-logo-white.png` (blanc, horizontal, l’ॐ intégré aux lettres O et U). Il se pose uniquement sur `nuit`, `nuit-raised` ou `lotus-deep`.
- Hauteurs : 26px dans le header desktop, 24px en tablette, 20px en mobile ; 240px de large minimum en pied de page.
- Ne le recolore pas, ne le déforme pas et ne l’anime pas lettre par lettre. Laisse autour une marge au moins égale à la hauteur du O.
- La signature « Psychedelic Events » s’écrit en `label`, `ink-muted`, interlettrage 0,3em, sous le logo et jamais dans le header.
