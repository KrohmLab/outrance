import { useEffect, useState } from "react";

// Chargement de l’accueil : actif au premier chargement du document (pré-rendu et hydratation),
// jamais lors d’une navigation interne. L’animation est en CSS ; la classe est retirée à la fin
// pour rendre au lotus ses animations de repos.
let firstDocumentLoad = true;
export const INTRO_MS = 1700;

export function useHomeIntro(): boolean {
  const [intro, setIntro] = useState(() => firstDocumentLoad);
  useEffect(() => {
    firstDocumentLoad = false;
    if (!intro) return;
    const t = setTimeout(() => setIntro(false), INTRO_MS);
    return () => clearTimeout(t);
  }, [intro]);
  return intro;
}
