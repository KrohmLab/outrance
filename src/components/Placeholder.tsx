// Visuel manquant (classe .ph des maquettes) : fond placeholder, cercles concentriques et libellé entre crochets.
// À remplacer par une vraie image dès que le champ correspondant de content/ n’est plus null.
import type { ReactNode } from "react";

const MOTIFS = {
  landscape: { viewBox: "0 0 400 210", cx: 200, cy: 105, radii: [24, 48, 72, 96, 120, 144, 168, 192] },
  poster: { viewBox: "0 0 400 500", cx: 200, cy: 250, radii: [50, 100, 150, 200, 250, 300] },
  lineup: { viewBox: "0 0 400 500", cx: 200, cy: 200, radii: [60, 120, 180, 240] },
} as const;

type Props = {
  motif?: keyof typeof MOTIFS;
  /** Libellé de maquette, entre crochets (décoratif). */
  label?: string;
  /** Contenu posé en bas à gauche à la place du libellé (tag de statut, par exemple). */
  children?: ReactNode;
  className?: string;
  /** Applique le zoom de 4 % au survol de la carte parente (classe .zoom). */
  zoom?: boolean;
};

export function Placeholder({ motif = "landscape", label, children, className = "", zoom = false }: Props) {
  const m = MOTIFS[motif];
  // « relative » seulement si l’appelant ne positionne pas lui-même le visuel : sinon il l’emporterait
  // sur un « absolute inset-0 » passé en className, et le visuel n’aurait que la hauteur de son libellé.
  // De même pour l’alignement : « items-end » par défaut, sauf si l’appelant en donne un (bouton de
  // lecture centré des aftermovies, par exemple).
  const position = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className) ? "" : "relative ";
  const align = /(^|\s)items-/.test(className) ? "" : "items-end ";
  return (
    <div className={`${position}flex ${align}overflow-hidden bg-placeholder p-3.5 ${className}`}>
      <svg
        aria-hidden="true"
        viewBox={m.viewBox}
        preserveAspectRatio="xMidYMid slice"
        className={`absolute inset-0 size-full ${zoom ? "zoom" : ""}`}
      >
        <g fill="none" stroke="var(--color-line)" strokeWidth={1}>
          {m.radii.map((r) => (
            <circle key={r} cx={m.cx} cy={m.cy} r={r} />
          ))}
        </g>
      </svg>
      {children ?? (label ? <span className="lbl relative text-[11px] text-ink-muted">{label}</span> : null)}
    </div>
  );
}
