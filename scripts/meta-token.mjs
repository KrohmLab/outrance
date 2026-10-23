// À lancer une fois, en local, pour obtenir le jeton de page sans expiration (META_PAGE_TOKEN).
// Voir docs/meta.md. Rien n’est envoyé ailleurs qu’à graph.facebook.com, rien n’est écrit sur le disque.
//
//   META_APP_ID=… META_APP_SECRET=… META_USER_TOKEN=… node scripts/meta-token.mjs
const GRAPH = `https://graph.facebook.com/${process.env.META_GRAPH_VERSION ?? "v25.0"}`;
const { META_APP_ID: appId, META_APP_SECRET: secret, META_USER_TOKEN: shortToken } = process.env;

if (!appId || !secret || !shortToken) {
  console.error("Il faut META_APP_ID, META_APP_SECRET et META_USER_TOKEN (jeton de l’explorateur Graph API).");
  process.exit(1);
}

async function graph(path, params) {
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const body = await (await fetch(url)).json();
  if (body.error) throw new Error(body.error.message);
  return body;
}

// 1. Jeton utilisateur longue durée (60 jours) : les jetons de page qui en découlent n’expirent pas.
const { access_token: longToken } = await graph("oauth/access_token", {
  grant_type: "fb_exchange_token",
  client_id: appId,
  client_secret: secret,
  fb_exchange_token: shortToken,
});

// 2. Pages gérées, avec leur jeton et le compte Instagram relié.
const { data: pages = [] } = await graph("me/accounts", {
  fields: "id,name,access_token,instagram_business_account{username}",
  access_token: longToken,
});
if (pages.length === 0) throw new Error("Aucune page : vérifie la permission pages_show_list et la page cochée à la connexion.");

for (const page of pages) {
  const { data } = await graph("debug_token", { input_token: page.access_token, access_token: `${appId}|${secret}` });
  const expires = data.expires_at ? new Date(data.expires_at * 1000).toLocaleDateString("fr-FR") : "jamais";
  console.log(`\nPage : ${page.name} (META_PAGE_ID=${page.id})`);
  console.log(`Instagram relié : ${page.instagram_business_account ? `@${page.instagram_business_account.username}` : "aucun"}`);
  console.log(`Expiration : ${expires} — permissions : ${(data.scopes ?? []).join(", ")}`);
  console.log(`META_PAGE_TOKEN=${page.access_token}`);
}
