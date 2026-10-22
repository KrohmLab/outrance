import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false pendant le pré-rendu et l’hydratation, true ensuite (pour les portails et les API du navigateur). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
