import { useMotionValueEvent, useScroll } from "motion/react";
import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Appelle `apply(st, top, vh)` à chaque image où le scroll change : st = scroll de la page,
 * top = position de la section dans la page (mesurée au montage et au redimensionnement), vh = hauteur
 * de fenêtre. Reprend la logique de renderVals() (positions mesurées dans le DOM plutôt que fixes).
 */
export function usePageScroll(ref: RefObject<HTMLElement | null>, apply: (st: number, top: number, vh: number) => void, enabled = true) {
  const { scrollY } = useScroll();
  const top = useRef(0);
  const applyRef = useRef(apply);
  useLayoutEffect(() => {
    applyRef.current = apply;
  });

  useMotionValueEvent(scrollY, "change", (st) => {
    if (enabled) applyRef.current(st, top.current, window.innerHeight);
  });

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      top.current = el.getBoundingClientRect().top + window.scrollY;
      applyRef.current(window.scrollY, top.current, window.innerHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    // Les sections au-dessus peuvent changer de hauteur après le chargement des polices.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [ref, enabled]);
}
