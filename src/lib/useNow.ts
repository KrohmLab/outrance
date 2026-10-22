import { useSyncExternalStore } from "react";

// Le pré-rendu calcule « à venir / passé » avec l’heure du build, inscrite sur <html data-build-time>.
// À l’hydratation, React réutilise cette heure, puis repasse avec l’heure du navigateur :
// un événement terminé depuis le dernier build bascule donc bien en « Passé ».
const CLIENT_NOW = typeof window === "undefined" ? 0 : Date.now();

export const buildTime: number = import.meta.env.SSR
  ? Date.now()
  : Number(document.documentElement.dataset.buildTime) || CLIENT_NOW;

const subscribe = () => () => {};

export function useNow(): Date {
  return new Date(
    useSyncExternalStore(
      subscribe,
      () => CLIENT_NOW,
      () => buildTime,
    ),
  );
}
