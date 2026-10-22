# Déployer la première version avec Claude Code

Objectif : une version présentable en ligne sur une adresse provisoire Cloudflare (`*.workers.dev`), sans toucher à outrance.org.

## Avant de commencer (une seule fois, 15 minutes)

1. **Installer Claude Code** : application de bureau Claude (onglet Code) ou terminal.
   - macOS / Linux : `curl -fsSL https://claude.ai/install.sh | bash`
   - Windows (PowerShell) : `irm https://claude.ai/install.ps1 | iex`
   - Vérifier : `claude --version`. Il faut un compte Claude Pro, Max, Team ou Enterprise.
2. **Avoir Node.js LTS et Git installés**, et un compte GitHub et un compte Cloudflare (gratuits).
3. **Cloner ton dépôt GitHub** `outrance` sur ton ordinateur. S’il contient déjà des fichiers, préviens Claude Code dès le premier prompt pour qu’il les prenne en compte au lieu de les écraser.
4. **Copier le contenu de ce kit à la racine du dépôt** : `CLAUDE.md`, `KICKOFF.md`, `design/`, `content/`, `assets/`.
5. Dans le dossier du dépôt, lancer `claude` et coller les prompts ci-dessous, une étape à la fois. Relis le plan qu’il propose avant de le laisser faire.

---

## Étape 1 — Socle et premier déploiement

> Lis `CLAUDE.md`, `design/brand-book.md`, `design/tokens.json` et `design/README.md`. Propose-moi d’abord un plan court. Puis initialise le projet selon la stack de `CLAUDE.md` : Vite + React 19 + TypeScript strict, Tailwind v4 avec les tokens du design system dans `src/styles/theme.css`, React Router v7 avec pré-rendu statique, polices Fontsource, `@cloudflare/vite-plugin` et `wrangler.jsonc`. Crée le layout commun (header avec le logo, navigation desktop, menu burger plein écran animé en tablette et mobile, footer), une page d’accueil provisoire et la page 404. Ajoute les scripts `lint` et `typecheck`. Vérifie que `npm run build` passe, commit et push sur `main`, puis guide-moi pas à pas pour relier le dépôt à Cloudflare Workers Builds.

**Côté Cloudflare** (une seule fois) : tableau de bord → *Workers & Pages* → créer une application → importer le dépôt GitHub `outrance`. Commande de build : `npm run build` ; commande de déploiement : `npx wrangler deploy`. Active les builds de preview sur les autres branches. Au premier déploiement, le site est en ligne sur une adresse `…workers.dev`.

## Étape 2 — Toutes les pages et les contenus

> Branche `etape-2-pages`. Implémente Agenda, Fiche événement, Artistes, Galerie, L’association, Presse / Pro et Mentions légales à partir des artboards desktop, tablette et mobile, avec le contenu de `content/` (schémas zod, événements en Markdown, brouillons exclus). Inclus les overlays (fiche artiste en panneau, visionneuses photo et vidéo, menus agenda et partage) avec leurs animations et leur accessibilité, en suivant `Composants.dc.html`. Vérifie chaque page à 390, 834 et 1440 px. Ouvre une PR avec l’URL de preview et la liste de ce qui reste en placeholder.

## Étape 3 — L’accueil animé

> Branche `etape-3-accueil`. Implémente la page d’accueil en suivant la section « La page d’accueil » de `CLAUDE.md` et les artboards `Main.dc.html`, `Accueil-tablette.dc.html` et `Accueil-mobile.dc.html`. Commence par un composant `Lotus` réutilisable (géométrie de `lotus(b)`, pétales individuels), puis le hero (éclosion, révélation de l’événement, envol vers la jauge du header, logo qui glisse), le bandeau d’artistes, l’agenda, l’iris des chiffres avec entrée et sortie, l’orbite du roster avec ses fleurs par artiste, les aftermovies en défilement horizontal, Belgium, les réseaux, la finale et le footer. Ajoute ensuite le mouvement de repos et les effets souris, puis les versions allégées tablette et mobile. Respecte « Performance du mouvement » et `prefers-reduced-motion`. Mesure les images par seconde sur desktop et en simulation mobile, et ouvre une PR avec l’URL de preview.

## Étape 4 — Finitions pour la présentation

> Branche `etape-4-finitions`. Ajoute les meta et Open Graph par page, une image OG par événement, le JSON-LD `schema.org/Event`, `sitemap.xml`, `robots.txt` et le fichier `public/_redirects`. Lance Lighthouse mobile sur chaque page et corrige jusqu’aux seuils de `CLAUDE.md`. Fais une dernière passe visuelle aux trois largeurs. Ouvre une PR avec le rapport et l’URL de preview à partager avec l’équipe.

---

## Après la présentation

- **Éditeur de contenu** : demande à Claude Code de comparer deux ou trois éditeurs basés sur Git, puis choisis avec l’équipe.
- **Bascule d’outrance.org** : à faire ensemble, pas en automatique. Le domaine doit passer sur le DNS de Cloudflare ; avant de changer les serveurs DNS, recopie **tous** les enregistrements existants, en particulier les **MX** des adresses e-mail @outrance.org.

## Ce qui manque encore (à fournir au fil de l’eau)

- Le logo en SVG.
- Les visuels : affiches 4:5 et bannières 1920×1005, photos de soirées, portraits d’artistes, vignettes et liens YouTube.
- Les infos marquées `À COMPLÉTER` dans `content/` (prochaine date, horaires, prix, liens Shotgun, nombre de billets vendus, bios d’artistes).
- Le prestataire de newsletter et la vérification des mentions légales.
