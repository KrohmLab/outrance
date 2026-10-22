import { useEffect, useState } from "react";
import { Lotus } from "./Lotus";

// Écran de chargement de l’accueil : le lotus en bouton se dessine au trait (de l’extérieur vers
// le cœur), se remplit, son cœur s’allume et une onde part, puis l’écran se referme en iris sur le
// bouton du hero, posé exactement au même endroit. 100 % CSS : il démarre au premier affichage,
// avant le JavaScript. Seulement au chargement de la page (pas lors d’une navigation interne),
// jamais en mouvement réduit.

let firstDocumentLoad = true;

export function HomeLoader() {
  // Rendu au pré-rendu et à l’hydratation du premier chargement, plus jamais ensuite.
  const [show] = useState(() => firstDocumentLoad);
  useEffect(() => {
    firstDocumentLoad = false;
  }, []);
  if (!show) return null;

  return (
    <div aria-hidden="true" className="home-loader pointer-events-none fixed inset-0 z-[70] bg-nuit">
      <div className="absolute top-1/2 left-1/2 size-[340px] -translate-1/2 sm:size-[600px] lg:size-[760px]" style={{ "--b": 0 } as React.CSSProperties}>
        <Lotus />
        <svg viewBox="-300 -300 600 600" className="absolute inset-0 size-full overflow-visible">
          <circle className="home-loader-wave" cx="0" cy="40" r="60" fill="none" stroke="var(--color-lotus)" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}
