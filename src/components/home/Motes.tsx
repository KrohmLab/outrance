import { seeded } from "./motion-math";

// Lucioles : 30 en desktop, 12 en tablette, 8 en mobile (brand book). Masquées en mouvement réduit.
export function Motes({ count, seed = 1, big = false }: { count: number; seed?: number; big?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const s = seed * 1000 + i;
        const size = big ? Math.round(seeded(s + 1, 3, 5)) : Math.round(seeded(s + 1, 2, 4));
        return (
          <span
            key={i}
            className="mote"
            style={{
              left: `${seeded(s + 2, 4, 96).toFixed(1)}%`,
              width: size,
              height: size,
              color: i % 3 === 0 ? "var(--color-ink)" : "var(--color-lotus)",
              animationDuration: `${seeded(s + 3, 22, 44).toFixed(1)}s`,
              animationDelay: `-${seeded(s + 4, 0, 44).toFixed(1)}s`,
            }}
          >
            <i style={{ animationDuration: `${seeded(s + 5, 2.6, 4.9).toFixed(1)}s, ${seeded(s + 6, 4, 8).toFixed(1)}s` }} />
          </span>
        );
      })}
    </div>
  );
}

export const MOTE_COUNT = { full: 30, tablet: 12, mobile: 8, reduced: 0 } as const;
