import { useEffect, useRef } from "react";

// Variante « page » du mandala (artboards Association) : cercles r44/110/210/280 et pétales
// cy -160 rx36 ry100. 9 pétales (pas de 40°) en tablette et desktop, 8 (pas de 45°) en mobile.
// Le composant partagé Mandala.tsx est la variante du menu (12 pétales) : il n’est pas modifié ici.
// La rotation s’arrête hors écran et en mouvement réduit (règle des 5 s du brand book).
type Props = { petals: 8 | 9; strokeWidth?: number; className?: string };

export function PageMandala({ petals, strokeWidth = 0.9, className = "" }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const step = 360 / petals;

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      el.style.animationPlayState = entry?.isIntersecting ? "running" : "paused";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={ref} aria-hidden="true" viewBox="-300 -300 600 600" className={`block size-full animate-spin-slow ${className}`}>
      <g fill="none" stroke="var(--color-lotus)" strokeWidth={strokeWidth}>
        <circle r="44" />
        <circle r="110" strokeOpacity={0.6} />
        <circle r="210" strokeOpacity={0.35} />
        <circle r="280" strokeOpacity={0.2} />
        <g strokeOpacity={0.5}>
          {Array.from({ length: petals }, (_, i) => (
            <ellipse key={i} cx="0" cy="-160" rx="36" ry="100" transform={i ? `rotate(${i * step})` : undefined} />
          ))}
        </g>
      </g>
    </svg>
  );
}
