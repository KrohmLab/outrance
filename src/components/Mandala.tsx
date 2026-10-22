// Motif mandala décoratif des artboards (menu plein écran, en-têtes de page).
const PETAL_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);

export function Mandala({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="-300 -300 600 600" className={`block size-full ${className}`}>
      <g fill="none" stroke="var(--color-lotus)" strokeWidth={0.9}>
        <circle r="40" />
        <circle r="100" strokeOpacity={0.6} />
        <circle r="200" strokeOpacity={0.4} />
        <circle r="270" strokeOpacity={0.25} />
        <g strokeOpacity={0.55}>
          {PETAL_ANGLES.map((a) => (
            <ellipse key={a} cx="0" cy="-150" rx="34" ry="96" transform={a ? `rotate(${a})` : undefined} />
          ))}
        </g>
      </g>
    </svg>
  );
}
