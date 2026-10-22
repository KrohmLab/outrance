import { useEffect, useRef } from "react";

// Motif mandala décoratif des artboards (menu plein écran, en-têtes de page).
// La rotation s’arrête hors écran et en mouvement réduit (règle des 5 s du brand book).
const PETAL_ANGLES = Array.from({ length: 12 }, (_, i) => i * 30);

export function Mandala({ className = "", spin = true }: { className?: string; spin?: boolean }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!spin || !el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      el.style.animationPlayState = entry?.isIntersecting ? "running" : "paused";
    });
    io.observe(el);
    return () => io.disconnect();
  }, [spin]);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      viewBox="-300 -300 600 600"
      className={`block size-full ${spin ? "animate-spin-slow" : ""} ${className}`}
    >
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
