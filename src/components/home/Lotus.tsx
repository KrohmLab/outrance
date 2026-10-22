import type { CSSProperties } from "react";

// Lotus de l’accueil, géométrie de la fonction lotus(b) de Main.dc.html : trois couronnes
// (12 extérieurs, 12 médians décalés de 15°, 8 intérieurs), chaque pétale est un <path> placé
// par une transformation. L’ouverture vient d’une seule variable CSS --b (0 = bouton, 1 = ouvert)
// posée sur un ancêtre : chaque pétale calcule sa transformation en CSS (aucun re-rendu React).
// --vx / --vy (vitesse de la souris) font traîner les pétales derrière le geste (desktop).
// Le balancement de repos et la traîne vivent sur .lotus-trail ; le <path> ne porte que le tracé du chargement.

export const PETAL = "M0 0C20 -28 24 -74 0 -112C-24 -74 -20 -30 0 0Z";

type Crown = {
  key: "o" | "m" | "i";
  n: number;
  /** Décalage angulaire de la couronne (degrés). */
  offset: number;
  /** Angle replié du bouton, en fraction de l’angle ouvert × 360. */
  fold: number;
  d: [number, number];
  s: [number, number];
  fill: string;
  fillOpacity: number;
  strokeOpacity: number;
  strokeWidth: number;
  /** Balancement de repos (amplitude) et traîne derrière la souris (k). */
  amp: number;
  k: number;
  sway: string;
};

const CROWNS: Crown[] = [
  { key: "o", n: 12, offset: 0, fold: 70, d: [0, 96], s: [0.62, 1.25], fill: "var(--color-lotus)", fillOpacity: 0.05, strokeOpacity: 0.85, strokeWidth: 1.3, amp: 5.5, k: 12.1, sway: "sw-o" },
  { key: "m", n: 12, offset: 15, fold: 48, d: [0, 40], s: [0.56, 0.95], fill: "var(--color-lotus-deep)", fillOpacity: 0.55, strokeOpacity: 0.9, strokeWidth: 1.3, amp: 3.8, k: 8.4, sway: "sw-m" },
  { key: "i", n: 8, offset: 22.5, fold: 28, d: [0, 4], s: [0.5, 0.62], fill: "var(--color-lotus-deep)", fillOpacity: 1, strokeOpacity: 1, strokeWidth: 1.5, amp: 2.6, k: 5.7, sway: "sw-i" },
];

// Durées pseudo-aléatoires mais stables (pas de Math.random : le rendu doit être identique au build).
const jitter = (seed: number, min: number, max: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return min + (x - Math.floor(x)) * (max - min);
};

type Props = { className?: string; style?: CSSProperties };

export function Lotus({ className = "", style }: Props) {
  return (
    <svg aria-hidden="true" viewBox="-300 -300 600 600" className={`lotus block size-full overflow-visible ${className}`} style={style}>
      <circle className="lotus-ring" r="100" fill="none" stroke="var(--color-lotus)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ "--r0": 70, "--r1": 150, "--ro": 0.6 } as CSSProperties} />
      <circle className="lotus-ring" r="100" fill="none" stroke="var(--color-lotus)" strokeWidth="1" strokeDasharray="2 7" vectorEffect="non-scaling-stroke" style={{ "--r0": 80, "--r1": 220, "--ro": 0.35 } as CSSProperties} />
      <circle className="lotus-ring" r="100" fill="none" stroke="var(--color-lotus)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ "--r0": 90, "--r1": 290, "--ro": 0.16 } as CSSProperties} />
      {CROWNS.map((c, ci) => (
        <g key={c.key} className={c.sway}>
          {Array.from({ length: c.n }, (_, i) => {
            const open = ((i * 360) / c.n + c.offset + 540) % 360 - 180;
            const rad = ((i * 360) / c.n + c.offset) * (Math.PI / 180);
            const seed = ci * 100 + i;
            return (
              <g
                key={i}
                className="lotus-petal"
                style={
                  {
                    "--oa": open.toFixed(2),
                    "--kf": (c.fold / 360).toFixed(4),
                    "--d0": c.d[0],
                    "--d1": c.d[1],
                    "--s0": c.s[0],
                    "--s1": c.s[1],
                  } as CSSProperties
                }
              >
                <g
                  className="lotus-trail"
                  style={
                    {
                      "--c": Math.cos(rad).toFixed(3),
                      "--s": Math.sin(rad).toFixed(3),
                      "--k": `${c.k}deg`,
                      // Balancement de repos (animation « tip », desktop) porté par ce groupe, pour ne pas
                      // entrer en conflit avec le tracé du chargement posé sur le <path>.
                      "--amp": `${c.amp}deg`,
                      animationDuration: `${jitter(seed + 7, 3.2, 5.8).toFixed(2)}s`,
                      animationDelay: `-${jitter(seed + 3, 0, 6).toFixed(2)}s`,
                      transitionDuration: `${jitter(seed, 0.6, 0.95).toFixed(2)}s`,
                    } as CSSProperties
                  }
                >
                  <path
                    className="lotus-tip"
                    d={PETAL}
                    pathLength={1}
                    fill={c.fill}
                    fillOpacity={c.fillOpacity}
                    stroke="var(--color-lotus)"
                    strokeOpacity={c.strokeOpacity}
                    strokeWidth={c.strokeWidth}
                  />
                </g>
              </g>
            );
          })}
        </g>
      ))}
      <circle className="lotus-core" r="9" fill="var(--color-lotus)" />
    </svg>
  );
}
