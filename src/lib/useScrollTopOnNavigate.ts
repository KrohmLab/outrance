import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

// Arrivée sur une nouvelle page : toujours en haut. <ScrollRestoration> le fait déjà, mais sur iOS un
// scrollTo pendant l’élan d’un swipe est ignoré et la nouvelle page continue de défiler, parfois jusqu’en
// bas. On coupe l’élan (overflow hidden le temps d’un appel), on remonte, puis on revérifie aux deux
// images suivantes et 300 ms plus tard, sauf si la personne a déjà repris le défilement.
// Non concernés : retour / avance de l’historique (position restaurée), liens vers une ancre (#…),
// changements de paramètres sur la même page (onglets, filtres, album ouvert).
export function useScrollTopOnNavigate() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previous = useRef(location.pathname);

  useLayoutEffect(() => {
    if (previous.current === location.pathname) return;
    previous.current = location.pathname;
    if (navigationType === "POP" || location.hash) return;

    const root = document.documentElement;
    const toTop = () => {
      const overflow = root.style.overflow;
      root.style.overflow = "hidden";
      window.scrollTo(0, 0);
      root.style.overflow = overflow;
    };
    toTop();

    let userScrolled = false;
    const onInput = () => (userScrolled = true);
    const events = ["wheel", "touchstart", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, onInput, { passive: true, once: true }));
    const recheck = () => {
      if (!userScrolled && window.scrollY > 0) toTop();
    };
    let raf = requestAnimationFrame(() => {
      recheck();
      raf = requestAnimationFrame(recheck);
    });
    // Dernière vérification une fois les images et polices posées (Safari iOS).
    const late = window.setTimeout(recheck, 300);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      events.forEach((e) => window.removeEventListener(e, onInput));
    };
  }, [location.pathname, location.hash, navigationType]);
}
