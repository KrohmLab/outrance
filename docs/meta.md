# Instagram et albums Facebook

Le site récupère au build :

- les **6 dernières publications Instagram** (section « Sur les réseaux » de l’accueil) ;
- les **albums photo de la page Facebook** rattachés à un événement (galerie, et lien « Voir les photos » des fiches).

Les images sont copiées dans le site (`public/meta/`, non versionné) : le visiteur ne contacte jamais Meta. Le script est `scripts/sync-meta.mjs`, lancé par `npm run build`. Sans jeton, ou si Meta répond mal, le build passe quand même et le site garde ses placeholders.

Un seul secret suffit : **le jeton de la page Facebook**, qui n’expire pas. Le compte Instagram est lu à travers la page à laquelle il est relié.

## 1. Prérequis

- Le compte Instagram **@outrancelyon** est un compte professionnel (Entreprise ou Créateur).
- Il est **relié à la page Facebook Outrance** (Facebook : Paramètres de la page → Comptes liés → Instagram).
- Ton compte Facebook est **administrateur** de la page.

## 2. Créer l’application Meta

1. Sur [developers.facebook.com](https://developers.facebook.com/apps/), **Créer une app**, type **Business** (Entreprise).
2. L’app peut rester en **mode développement** : seuls ses administrateurs l’utilisent, sur leurs propres pages. Si Meta demande une vérification (App Review) pour une permission, dis-le moi avant de la lancer.
3. Dans **Paramètres de l’app → Général**, note l’**identifiant de l’app** et la **clé secrète**.

## 3. Obtenir le jeton de page

1. Ouvre l’[explorateur Graph API](https://developers.facebook.com/tools/explorer/), choisis ton app, puis **Jeton d’utilisateur**.
2. Ajoute les permissions : `pages_show_list`, `pages_read_engagement`, `instagram_basic` (et `business_management` si la page est dans un Business Manager).
3. **Generate Access Token**, puis coche la page Outrance et le compte Instagram.
4. Dans un terminal, à la racine du projet, lance (les valeurs restent sur ta machine) :

   ```bash
   META_APP_ID=… META_APP_SECRET=… META_USER_TOKEN=… node scripts/meta-token.mjs
   ```

   Le script affiche `META_PAGE_ID`, `META_PAGE_TOKEN`, le compte Instagram relié et l’expiration (« jamais » attendu).

## 4. Donner le jeton à Cloudflare

Cloudflare → Workers & Pages → **outrance** → Settings → **Builds** → Variables and secrets :

- `META_PAGE_TOKEN` (type **Secret**) ;
- `META_PAGE_ID`.

Pour un build en local, mets les deux lignes dans un fichier `.env` à la racine (ignoré par git).

## 5. Rafraîchir chaque matin

1. Cloudflare → outrance → Settings → Builds → **Deploy Hooks** : crée un hook sur la branche `main` et copie son URL.
2. GitHub → dépôt → Settings → Secrets and variables → Actions : ajoute le secret **`CF_DEPLOY_HOOK`** avec cette URL.

Le workflow `.github/workflows/rafraichir-meta.yml` relance alors le build tous les jours à 5 h UTC. Il se lance aussi à la main depuis l’onglet Actions. GitHub suspend les tâches planifiées d’un dépôt sans activité depuis 60 jours : il suffit de le réactiver dans l’onglet Actions.

## Rattacher un album à la main

Un album est rattaché automatiquement quand son nom contient le titre de l’événement (« Outrance #12 », « Psychedelic Christmas »…), en prenant l’édition la plus proche de la date de l’album. Les albums sans événement sont ignorés et listés dans les logs du build. Pour corriger, dans `content/facebook-albums.json` :

```json
{ "albums": { "1234567890": "outrance-12", "9876543210": null } }
```

Un slug rattache l’album à cet événement ; `null` le masque.
