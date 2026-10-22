import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "src",
  // Site 100 % statique : chaque route est pré-rendue au build, aucun serveur à l’exécution.
  ssr: false,
  async prerender({ getStaticPaths }) {
    // "/404" est rendu par la route joker (*) puis copié en build/client/404.html
    // par scripts/postbuild.mjs : Cloudflare le sert avec un statut 404.
    return [...getStaticPaths(), "/404"];
  },
} satisfies Config;
