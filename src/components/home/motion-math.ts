// Courbes et seuils de la chorégraphie (repris de renderVals() dans Main.dc.html).
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Phases du hero pour une progression h (0 → 1) sur toute la hauteur de la section. */
export function heroPhases(h: number) {
  return {
    bloom: easeInOut(clamp01((h - 0.04) / 0.46)),
    ev: easeOut(clamp01((h - 0.36) / 0.22)),
    fly: easeInOut(clamp01((h - 0.72) / 0.28)),
    intro: 1 - clamp01(h / 0.16),
    rot: h * 110,
  };
}

/** Pseudo-aléatoire stable (identique au build et dans le navigateur). */
export function seeded(seed: number, min = 0, max = 1) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return min + (x - Math.floor(x)) * (max - min);
}
