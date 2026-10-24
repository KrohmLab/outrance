// Worker du site : tout est servi en fichiers statiques (build/client), sauf /api/newsletter, qui inscrit
// une adresse dans beehiiv. La clé d’API reste ici, côté Cloudflare : jamais envoyée au navigateur.
// Secrets Cloudflare (variables du Worker, pas de build) : BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID.

type Env = {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  BEEHIIV_API_KEY?: string;
  BEEHIIV_PUBLICATION_ID?: string;
  /** Tests uniquement (faux serveur local, .dev.vars) ; sinon l’API beehiiv. */
  BEEHIIV_API_URL?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

async function newsletter(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return json(405, { ok: false, error: "method" });
  // Seulement depuis le site lui-même (même origine).
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json(403, { ok: false, error: "origin" });

  let data: { email?: unknown; website?: unknown; page?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 2000) return json(413, { ok: false, error: "size" });
    data = JSON.parse(raw) as typeof data;
  } catch {
    return json(400, { ok: false, error: "json" });
  }
  // Champ piège invisible : un robot le remplit, une personne jamais. On répond « ok » sans rien inscrire.
  if (typeof data.website === "string" && data.website.trim() !== "") return json(200, { ok: true });
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) return json(400, { ok: false, error: "email" });

  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) return json(503, { ok: false, error: "config" });

  const base = env.BEEHIIV_API_URL ?? "https://api.beehiiv.com/v2";
  const page = typeof data.page === "string" ? data.page.slice(0, 300) : undefined;
  const res = await fetch(`${base}/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`, {
    method: "POST",
    headers: { authorization: `Bearer ${env.BEEHIIV_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      email,
      reactivate_existing: false,
      send_welcome_email: true,
      utm_source: "site",
      utm_medium: "formulaire",
      referring_site: page,
    }),
  });
  if (!res.ok) {
    // Détail dans les logs du Worker uniquement (jamais la clé) ; le visiteur voit l’état d’erreur du formulaire.
    console.error(`beehiiv ${res.status}: ${(await res.text()).slice(0, 300)}`);
    return json(502, { ok: false, error: "provider" });
  }
  return json(200, { ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/newsletter") return newsletter(request, env);
    return env.ASSETS.fetch(request);
  },
};
