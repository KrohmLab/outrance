import { site } from "../site";

// Balises de page communes : titre, description, URL canonique, Open Graph et Twitter.
// L’origine vient de content/site.json → url (adresse workers.dev tant que outrance.org n’a pas basculé).
type Options = {
  title: string;
  description: string;
  /** Chemin de la page, ex. « /agenda ». */
  path: string;
  /** Chemin de l’image de partage (1200×630), par défaut l’image générale. */
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  noindex?: boolean;
};

export const DEFAULT_OG_IMAGE = "/og/outrance.png";

export function pageMeta({ title, description, path, image = DEFAULT_OG_IMAGE, imageAlt, type = "website", noindex }: Options) {
  const url = `${site.url}${path === "/" ? "/" : path}`;
  const img = `${site.url}${image}`;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    ...(noindex ? [{ name: "robots", content: "noindex" }] : []),
    { property: "og:site_name", content: site.name },
    { property: "og:locale", content: "fr_FR" },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: imageAlt ?? title },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
  ];
}
