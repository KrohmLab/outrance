// Placement de la mosaïque d’albums (Galerie.dc.html, -tablette, -mobile) sans trou, quel que soit le nombre d’albums.
// Chaque tuile reçoit la taille du motif de la maquette (répété toutes les 8 tuiles), posée sur la première case libre
// (ordre de lecture = ordre du contenu), réduite si elle ne tient pas ; à la fin, les tuiles voisines s’étirent
// pour combler les cases restantes. Le placement est explicite (grid-column / grid-row), donc identique au build et au client.

export type Span = readonly [w: number, h: number];
export type Area = { col: number; row: number; w: number; h: number };

/** Desktop (4 colonnes) : motif de l’artboard Galerie.dc.html. */
const DESKTOP: Span[] = [
  [2, 2],
  [2, 1],
  [1, 1],
  [1, 1],
  [1, 2],
  [2, 1],
  [1, 1],
  [2, 1],
];

/** Tablette (3 colonnes) : le motif desktop adapté à trois colonnes (une grande tuile, une haute, deux larges). */
const TABLET: Span[] = [
  [2, 2],
  [1, 1],
  [1, 1],
  [1, 2],
  [2, 1],
  [1, 1],
  [1, 1],
  [2, 1],
];

/** Mobile (2 colonnes) : motif de Galerie-mobile.dc.html. */
const MOBILE: Span[] = [
  [2, 2],
  [1, 1],
  [1, 1],
  [2, 1],
  [1, 1],
  [1, 1],
  [1, 1],
  [1, 1],
];

export const LAYOUTS = {
  mobile: { cols: 2, pattern: MOBILE },
  tablet: { cols: 3, pattern: TABLET },
  desktop: { cols: 4, pattern: DESKTOP },
} as const;

export function mosaic(count: number, cols: number, pattern: readonly Span[]): Area[] {
  const grid: number[][] = []; // grid[row][col] = index de la tuile, -1 si libre (indices à partir de 0)
  const at = (r: number, c: number) => grid[r]?.[c] ?? -1;
  const mark = (a: Area, i: number) => {
    for (let r = a.row; r < a.row + a.h; r++) {
      const row = (grid[r] ??= Array<number>(cols).fill(-1));
      for (let c = a.col; c < a.col + a.w; c++) row[c] = i;
    }
  };
  const firstFree = () => {
    for (let r = 0; ; r++) for (let c = 0; c < cols; c++) if (at(r, c) === -1) return { r, c };
  };

  const areas: Area[] = [];
  for (let i = 0; i < count; i++) {
    const { r, c } = firstFree();
    const [pw, ph] = pattern[i % pattern.length] ?? [1, 1];
    let w = 1;
    while (w < Math.min(pw, cols - c) && at(r, c + w) === -1) w++;
    let h = 1;
    while (h < ph && Array.from({ length: w }, (_, k) => at(r + h, c + k)).every((x) => x === -1)) h++;
    const area = { col: c, row: r, w, h };
    areas.push(area);
    mark(area, i);
  }

  // Comble les cases restantes des dernières rangées en étirant la tuile du dessus, sinon celle de gauche.
  const rows = grid.length;
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (at(r, c) !== -1) continue;
        const above = areas[at(r - 1, c)];
        if (above && above.row + above.h === r && range(above.col, above.w).every((k) => at(r, k) === -1)) {
          above.h++;
          mark(above, at(r - 1, c));
          changed = true;
          continue;
        }
        const left = areas[at(r, c - 1)];
        if (left && left.col + left.w === c && range(left.row, left.h).every((k) => at(k, c) === -1)) {
          left.w++;
          mark(left, at(r, c - 1));
          changed = true;
        }
      }
    }
  }
  return areas;
}

function range(start: number, length: number) {
  return Array.from({ length }, (_, k) => start + k);
}

/** Valeurs CSS grid-column / grid-row (lignes numérotées à partir de 1). */
export function gridValue(a: Area) {
  return { column: `${a.col + 1} / span ${a.w}`, row: `${a.row + 1} / span ${a.h}` };
}
