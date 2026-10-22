# Outrance — site web

Outrance est une association loi 1901 qui organise des soirées psytrance à Lyon depuis 2014, et en Belgique depuis 2018. Ce dépôt remplace le site WordPress/Divi de outrance.org par un site statique, léger et animé, qui reprend l’identité « Nuit » conçue dans Claude Design.

## Sources de vérité (à lire avant toute interface)

- `design/brand-book.md` : ton, couleurs, typographie, mise en page, interactions, mouvement (dont les trois niveaux par appareil), responsive, règles du logo. Il prime sur tout le reste.
- `design/tokens.json` : valeurs exactes des couleurs, polices, espacements et rayons.
- `design/artboards/*.dc.html` : maquettes validées. `design/README.md` liste les écrans et explique comment les lire. Ces fichiers Claude Design ne s’ouvrent pas seuls dans un navigateur : lis-les comme des spécifications (structure, textes, styles inline, bloc `<style>`, et logique dans le `<script type="text/x-dc">` en bas de fichier).
- `design/explorations/` : pistes non retenues (variantes d’accueil V2/V3, variantes de roster…). Ne les implémente pas, elles servent seulement de contexte.
- `content/` : contenus réels repris de l’ancien site. Tout ce qui est marqué `À COMPLÉTER` ou `null` reste un placeholder : n’invente jamais de date, de prix, de lien ni de chiffre.
- Canvas en ligne (maquettes rendues et interactives) : https://claude.ai/artifact/LyHbwCZW9Mi6soZAXcKMwT
- Design system en ligne : https://claude.ai/artifact/Ap4n4HxvhGNMGXpU3uLzGj

## Stack

- Vite + React 19 + TypeScript en mode strict, npm, Node LTS.
- Tailwind CSS v4 avec `@tailwindcss/vite`. Les tokens vivent dans `src/styles/theme.css` sous `@theme` avec les noms exacts du design system : `nuit`, `nuit-raised`, `line`, `border`, `ink`, `ink-muted`, `lotus`, `lotus-deep`, `uv`, `ember` ; polices `display`, `sans`, `mono` ; rayons `sm`, `md`, `pill`.
- React Router v7 en mode framework, sans serveur, avec pré-rendu statique de toutes les routes (dont chaque page événement). Vérifie la documentation à jour avant de configurer le pré-rendu.
- Animations : `motion` (import depuis `motion/react`) pour ce qui est lié au scroll ; variables CSS mises à jour une fois par image (`requestAnimationFrame`) pour ce qui suit la souris ; `@keyframes` CSS pour le mouvement de repos.
- Polices auto-hébergées avec Fontsource : Unbounded (600–800), Manrope (400–700), JetBrains Mono (500). Aucun appel à Google Fonts.
- Contenu : événements en Markdown avec frontmatter (`content/events/*.md`), le reste en JSON. Valide les schémas avec `zod` au build : un contenu invalide doit faire échouer le build. Les événements `draft: true` ne sont pas publiés.
- Déploiement : Cloudflare Workers avec assets statiques, via `wrangler.jsonc` (assets seuls, `build/client`, page 404 servie par `not_found_handling`). Pas de `@cloudflare/vite-plugin` : la doc Cloudflare indique qu’il ne prend pas en charge le pré-rendu de React Router (vérifié en octobre 2026). Workers Builds est relié au dépôt GitHub : `main` déploie la production, chaque PR obtient une URL de preview.
- N’ajoute pas de dépendance sans dire pourquoi dans la PR.

## Routes

- `/` accueil animé (voir « La page d’accueil » plus bas).
- `/agenda` : onglets « À venir » / « Archives » (archives groupées par année), filtre Lyon / Belgique, menu « Ajouter à mon agenda » (Google, fichier .ics). Remplace les anciennes pages Agenda et Billetterie.
- `/evenements/:slug` : fiche événement, menus « Mon agenda » et « Partager » (partage natif du téléphone sur mobile), barre de billetterie collante en mobile.
- `/artistes` : grille de portraits, filtres DJ set / Live, booking. La fiche artiste n’est pas une page : panneau latéral en desktop, panneau qui remonte du bas en mobile, ouvert aussi par lien direct `/artistes?artiste=originz`.
- `/galerie` : onglets Photos / Aftermovies, visionneuse photo et lecteur vidéo plein écran (ouverture en iris).
- `/association` : histoire, chiffres, timeline, équipe (`#equipe`), aftermovies.
- `/presse-pro`, `/mentions-legales` et une page 404 (lotus qui éclot au clic).
- Pas de page Actus ni de page Belgium (lien vers https://outrance.be/).
- Redirections des anciennes URL WordPress : génère `public/_redirects` à partir de `content/site.json` → `legacyRedirects`.

## La page d’accueil (priorité de la première version)

Les artboards `Main.dc.html` (desktop), `Accueil-tablette.dc.html` et `Accueil-mobile.dc.html` sont des prototypes en « fenêtre » (1440×900, 834×1180, 390×844) avec un conteneur qui scrolle à l’intérieur. Dans le site, utilise le scroll normal de la page : les positions de sections (`HERO`, `AGENDA`, `STATS`…) du prototype deviennent des positions mesurées dans le DOM (`useScroll({ target })`).

Reprends précisément depuis `Main.dc.html` :
- la géométrie du lotus (fonction `lotus(b)` : trois couronnes de 12, 12 et 8 pétales, chaque pétale étant un `<path>` placé par une transformation) ;
- la chorégraphie du hero (seuils `bloom`, `ev`, `fly`, `intro`) avec l’envol du lotus jusqu’à la jauge du header, le logo qui glisse pour lui laisser la place, et l’amortissement de la lévitation et de la parallaxe pendant que l’événement s’affiche (`--damp`, `--lev`) ;
- l’entrée et la sortie en iris de la section chiffres ;
- l’orbite du roster (`orbitVals()` : signature de fleur par artiste, battement au BPM indicatif, retour au repos quand on quitte l’artiste ; au toucher, on touche pour ouvrir et on retouche pour fermer) ;
- le mouvement de repos (lucioles, balancement de chaque pétale depuis sa base, lévitation, ondes, dérive des bandeaux) et les effets souris (halo qui suit le curseur sans retard, parallaxe, pétales qui traînent derrière le geste).

Respecte les trois niveaux de mouvement décrits dans `design/brand-book.md` (desktop complet, tablette allégée, mobile le plus léger). Sur tactile, rien ne suit la souris et seules les parties indiquées restent liées au scroll ; le reste se révèle une fois par transition CSS.

## Panneaux, visionneuses et menus

- Tous les overlays sont de vrais dialogues accessibles : `role="dialog"`, `aria-modal`, piège de focus, fermeture par Échap, par le fond et par un bouton, focus rendu à l’élément d’origine, scroll de la page bloqué.
- Le bouton « Booker » de la fiche artiste ferme le panneau, fait défiler jusqu’au formulaire et pré-sélectionne l’artiste.
- Les vidéos YouTube ne se chargent qu’au clic, via `youtube-nocookie.com`.
- Les états et timings de référence sont sur l’artboard `Composants.dc.html`.

## Règles de design (non négociables)

- Fond `nuit` partout, aucun thème clair. Cartes en `nuit-raised`, encarts en `lotus-deep`.
- `uv` : une seule action par écran, la billetterie principale. Texte `nuit` sur `uv` et sur `lotus`. `ember` sert uniquement aux états (complet, erreur).
- Capitales pour titres, boutons et labels. Séparateur `◉` entre format et genre, barres obliques entre genres. Dates au format `VEN. 19/12/2025`.
- Tutoiement pour le public, vouvoiement pour le booking professionnel.
- Logo : `assets/logo/outrance-logo-white.png` (le SVG arrivera plus tard). Ne le redessine jamais, ne le recolore pas. Le lotus géométrique est un motif, pas le logo.
- Pas d’emoji dans l’interface. Icônes au trait 24 px, épaisseur 1,75 : reprends les SVG des maquettes.
- Contraste texte ≥ 4,5:1, cibles tactiles ≥ 44 px, focus clavier visible (contour `uv`), vrais `<button>`, `<a>`, `<label>`.
- Visuels manquants : un composant `Placeholder` identique aux maquettes, à remplacer quand les images arrivent.

## Performance du mouvement

- N’anime que `transform`, `opacity` et `clip-path`. Jamais de mise en page (marges, largeurs) dans une animation.
- Aucun `setState` par image sur toute la page : utilise des MotionValues ou des variables CSS posées sur les seuls éléments concernés, une fois par image.
- Desktop : 60 images/s visées. Mobile milieu de gamme (throttling CPU ×4) : pas de saccade visible au scroll.
- `prefers-reduced-motion` : état final directement (lotus ouvert, chiffres affichés, sections visibles), aucune animation de repos, aucun effet souris.

## Qualité attendue

- Lighthouse mobile ≥ 95 en Accessibilité, Bonnes pratiques et SEO, ≥ 90 en Performance malgré l’accueil animé.
- Balises meta et Open Graph par page, image OG par événement, JSON-LD `schema.org/Event` sur chaque fiche, `sitemap.xml`, `robots.txt`.
- Aucun cookie et donc aucune bannière : la mesure d’audience passera par Cloudflare Web Analytics, qui fonctionne sans cookie.
- « À venir » ou « passé » se calcule au build et côté client (fuseau Europe/Paris). Le hero montre le prochain événement à venir, sinon le dernier passé avec le libellé « Dernier événement ».
- Formulaires : newsletter préparée avec ses quatre états (repos, envoi, succès, erreur) mais non branchée ; booking en `mailto:booking@outrance.org`. N’invente aucune API.
- Scripts `dev`, `build`, `preview`, `lint`, `typecheck`. Avant chaque commit : typecheck, lint et build doivent passer.

## Édition par l’équipe (décision à prendre avant la mise en ligne publique)

Garde les contenus en fichiers Markdown/JSON avec des schémas stables, pour brancher ensuite un éditeur de contenu basé sur Git. Ne choisis pas l’outil seul : propose deux ou trois options comparées dans une PR dédiée.

## Méthode de travail

- Travaille par phases (voir `KICKOFF.md`) : une branche et une PR par phase, avec l’URL de preview Cloudflare dans la description.
- Vérifie chaque écran aux trois largeurs de référence (390, 834, 1440 px) en le comparant aux artboards.
- Ne touche jamais au DNS d’outrance.org : la bascule du domaine se fera à la fin, avec l’équipe, en préservant les e-mails @outrance.org.
