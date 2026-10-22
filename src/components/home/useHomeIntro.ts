import { useEffect, useState } from "react";

// Chargement de l’accueil : actif au premier chargement du document (pré-rendu et hydratation),
// jamais lors d’une navigation interne. L’animation est en CSS ; la classe est retirée à la fin
// pour rendre au lotus ses animations de repos.
let firstDocumentLoad = true;
export const INTRO_MS = 2400; // fin de la cascade des cercles (0,8 s + 3 × 0,12 s + 1,1 s)

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
