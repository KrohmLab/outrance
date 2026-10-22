import { useSyncExternalStore } from "react";

// Trois niveaux de mouvement du brand book, plus le mouvement réduit :
// - full : desktop à la souris (≥ 1024 px, pointeur fin) — chorégraphie complète, effets souris ;
// - tablet : tactile ≥ 640 px — hero et iris liés au scroll, le reste révélé une fois ;
// - mobile : < 640 px — seul le hero est lié au scroll ;
// - reduced : prefers-reduced-motion — état final directement.
export type MotionLevel = "full" | "tablet" | "mobile" | "reduced";

const QUERIES = ["(prefers-reduced-motion: reduce)", "(min-width: 1024px) and (hover: hover) and (pointer: fine)", "(min-width: 640px)"];

function read(): MotionLevel {
  const [reduce, desktop, tablet] = QUERIES.map((q) => window.matchMedia(q).matches);
  if (reduce) return "reduced";
  if (desktop) return "full";
  return tablet ? "tablet" : "mobile";
}

function subscribe(cb: () => void) {
  const lists = QUERIES.map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener("change", cb));
  return () => lists.forEach((l) => l.removeEventListener("change", cb));
}

/** Niveau de mouvement ; « reduced » pendant le pré-rendu (état final, sans animation). */
export function useMotionLevel(): MotionLevel {
  return useSyncExternalStore(subscribe, read, () => "reduced");
}

const REDUCE = "(prefers-reduced-motion: reduce)";

/**
 * Préférence « mouvement réduit » du navigateur. Pendant le pré-rendu et l’hydratation, renvoie false :
 * l’état initial des animations (lotus en bouton, événement caché) est le bon état de départ, alors que
 * supposer « réduit » ferait afficher un instant l’état final (fleur ouverte) avant de se corriger.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const l = window.matchMedia(REDUCE);
      l.addEventListener("change", cb);
      return () => l.removeEventListener("change", cb);
    },
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );
}
