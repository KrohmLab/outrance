import { useEffect, useRef } from "react";
import { Motes, MOTE_COUNT } from "./home/Motes";
import { useMotionLevel } from "../lib/useMotionLevel";

// Ciel commun à toutes les pages (celui de l’accueil) : lucioles fixes derrière tout le contenu et,
// en desktop à la souris, halo qui suit le curseur sans retard. Visible partout où une section n’a pas
// son propre fond. Une écriture de transform par image, sur le seul halo.
export function SiteBackdrop() {
  const level = useMotionLevel();
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (level !== "full" || !glow) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    const frame = () => {
      raf = 0;
      glow.style.transform = `translate3d(${(px - 320).toFixed(1)}px, ${(py - 320).toFixed(1)}px, 0)`;
      glow.style.opacity = "1";
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => {
      glow.style.opacity = "0";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [level]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <Motes count={MOTE_COUNT[level]} />
      {level === "full" && <div ref={glowRef} className="cglow" />}
    </div>
  );
}
