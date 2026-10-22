import { BLOOM_PATHS, BUD_PATHS } from "./lotus-paths";

// Styles des trois couronnes (extérieure, médiane, intérieure), communs au bouton et à la fleur ouverte.
const CROWNS = [
  { fill: "var(--color-lotus)", fillOpacity: 0.05, strokeOpacity: 0.85, strokeWidth: 1.4 },
  { fill: "var(--color-lotus-deep)", fillOpacity: 0.55, strokeOpacity: 1, strokeWidth: 1.4 },
  { fill: "var(--color-lotus-deep)", fillOpacity: 1, strokeOpacity: 1, strokeWidth: 1.6 },
] as const;

const EASE = "cubic-bezier(.2,.7,.2,1)";

/**
 * Lotus de la page 404 : bouton fermé ou fleur ouverte, transition reprise de Page-404.dc.html.
 * Purement décoratif : l’élément interactif éventuel l’enveloppe.
 */
export function LotusBloom({ open, className = "" }: { open: boolean; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="-300 -300 600 600" className={`block size-full overflow-visible ${className}`}>
      {[292, 200].map((r, i) => (
        <circle
          key={r}
          r={r}
          fill="none"
          stroke="var(--color-lotus)"
          strokeWidth={1}
          strokeDasharray={i ? "2 7" : undefined}
          style={{ transition: "opacity .8s .3s", opacity: open ? 0.5 : 0 }}
        />
      ))}
      <g
        style={{
          transformOrigin: "0 0",
          transition: `opacity .5s, transform .9s ${EASE}`,
          opacity: open ? 0 : 1,
          transform: `scale(${open ? 1.25 : 0.86})`,
        }}
      >
        {BUD_PATHS.map((d, i) => (
          <path key={i} d={d} stroke="var(--color-lotus)" {...CROWNS[i]} />
        ))}
      </g>
      <g
        style={{
          transformOrigin: "0 0",
          transition: `opacity .7s .1s, transform 1.3s ${EASE}`,
          opacity: open ? 1 : 0,
          transform: `rotate(${open ? 45 : -40}deg) scale(${open ? 1 : 0.35})`,
        }}
      >
        {BLOOM_PATHS.map((d, i) => (
          <path key={i} d={d} stroke="var(--color-lotus)" {...CROWNS[i]} />
        ))}
      </g>
    </svg>
  );
}
