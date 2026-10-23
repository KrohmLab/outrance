import { useEffect } from "react";
import { useLocation } from "react-router";

// Décalage de déploiement : un onglet ouvert avant une mise en ligne référence des fichiers JS qui
// n’existent plus. Au clic sur un lien, React Router ne trouve pas le module de la page visée et
// recharge… la page courante : le menu se ferme et on reste où l’on était. On note donc le lien
// cliqué juste avant la navigation ; si la page se recharge aussitôt, le script de <head> part
// directement vers la destination (chargement complet, donc avec les fichiers à jour).

const KEY = "outrance:nav";

/** Script inline de <head> : rejoint la destination notée si la page vient d’être rechargée à sa place. */
export const DEPLOY_SKEW_SCRIPT = `try{var p=JSON.parse(sessionStorage.getItem("${KEY}")||"null");sessionStorage.removeItem("${KEY}");if(p&&Date.now()-p.t<15000&&p.href!==location.pathname+location.search+location.hash)location.replace(p.href)}catch(e){}`;

/** Note chaque clic sur un lien interne, et l’efface dès que la navigation a abouti. */
export function useDeploySkewGuard() {
  const location = useLocation();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) return;
      try {
        sessionStorage.setItem(KEY, JSON.stringify({ href: url.pathname + url.search + url.hash, t: Date.now() }));
      } catch {
        // Stockage indisponible (navigation privée stricte) : on garde le comportement par défaut.
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      // Voir plus haut.
    }
  }, [location.key]);
}
