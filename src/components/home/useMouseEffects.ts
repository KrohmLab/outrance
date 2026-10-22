import { useEffect, type RefObject } from "react";

// Effets souris (desktop) de Main.dc.html : halo qui suit le curseur sans retard, parallaxe (--mx, --my)
// et vitesse du geste (--vx, --vy) qui fait traîner les pétales. Une écriture par image, sur les seuls
// éléments concernés (.cglow, .par), jamais de re-rendu.
export function useMouseEffects(rootRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    let raf = 0;
    let px = 0;
    let py = 0;
    let lx = 0;
    let ly = 0;
    let lt = 0;
    let still: ReturnType<typeof setTimeout> | undefined;

    const frame = () => {
      raf = 0;
      const now = performance.now();
      const glows = root.querySelectorAll<HTMLElement>(".cglow");
      const pars = root.querySelectorAll<HTMLElement>(".par");
      glows.forEach((g) => {
        const box = g.parentElement?.getBoundingClientRect();
        if (!box) return;
        g.style.transform = `translate3d(${(px - box.left - 320).toFixed(1)}px, ${(py - box.top - 320).toFixed(1)}px, 0)`;
        g.style.opacity = "1";
      });
      let vx = 0;
      let vy = 0;
      if (lt) {
        const dt = Math.max(8, now - lt);
        vx = Math.max(-1, Math.min(1, (px - lx) / dt / 1.6));
        vy = Math.max(-1, Math.min(1, (py - ly) / dt / 1.6));
      }
      lx = px;
      ly = py;
      lt = now;
      const mx = (px / window.innerWidth - 0.5).toFixed(3);
      const my = (py / window.innerHeight - 0.5).toFixed(3);
      pars.forEach((p) => {
        p.style.setProperty("--mx", mx);
        p.style.setProperty("--my", my);
        p.style.setProperty("--vx", vx.toFixed(3));
        p.style.setProperty("--vy", vy.toFixed(3));
      });
      clearTimeout(still);
      still = setTimeout(() => {
        pars.forEach((p) => {
          p.style.setProperty("--vx", "0");
          p.style.setProperty("--vy", "0");
        });
        lt = 0;
      }, 90);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      clearTimeout(still);
    };
  }, [rootRef, enabled]);
}
