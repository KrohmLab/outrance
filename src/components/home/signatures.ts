// Signatures de fleur de l’orbite du roster (objet SIG de Main.dc.html) : nombre de pétales par couronne,
// distances, échelles, torsion et BPM indicatif. Données de design, pas de contenu : elles décrivent
// le motif, pas l’artiste. Un artiste absent d’ici prend la fleur neutre et ne bat pas.
export type Signature = {
  n: [number, number, number];
  d: [number, number, number];
  s: [[number, number], [number, number], [number, number]];
  twist: number;
  bpm: number;
  line: string;
};

export const NEUTRAL: Signature = { n: [12, 12, 8], d: [96, 40, 4], s: [[1.25, 1.25], [0.95, 0.95], [0.62, 0.62]], twist: 0, bpm: 0, line: "" };

export const SIGNATURES: Record<string, Signature> = {
  marsupial: { n: [8, 8, 6], d: [120, 96, 78], s: [[1.55, 1.15], [1.2, 0.95], [0.8, 0.7]], twist: 0, bpm: 134, line: "≈ 134 BPM · 8 larges pétales, éclosion lente" },
  "soul-edge": { n: [10, 10, 6], d: [122, 96, 78], s: [[1.4, 1.2], [1.1, 0.95], [0.75, 0.7]], twist: 6, bpm: 138, line: "≈ 138 BPM · 10 pétales amples" },
  namdak: { n: [12, 6, 6], d: [124, 98, 78], s: [[1.25, 1.2], [1.25, 1], [0.7, 0.7]], twist: 15, bpm: 140, line: "≈ 140 BPM · 12 pétales, cœur groovy" },
  moonwave: { n: [12, 12, 8], d: [126, 98, 80], s: [[1.15, 1.25], [0.95, 1], [0.62, 0.7]], twist: 0, bpm: 143, line: "≈ 143 BPM · 12 pétales en double couronne" },
  kangapta: { n: [14, 7, 7], d: [130, 100, 80], s: [[1, 1.3], [1.2, 1.05], [0.6, 0.72]], twist: 10, bpm: 145, line: "≈ 145 BPM · 14 pétales décalés" },
  originz: { n: [14, 14, 8], d: [134, 102, 80], s: [[0.95, 1.32], [0.85, 1.05], [0.6, 0.72]], twist: 0, bpm: 147, line: "≈ 147 BPM · 14 pétales tendus" },
  rajax: { n: [16, 8, 8], d: [136, 102, 80], s: [[0.85, 1.3], [1.1, 1.05], [0.6, 0.72]], twist: 11.25, bpm: 148, line: "≈ 148 BPM · 16 pétales, forêt dense" },
  rayzorks: { n: [16, 16, 8], d: [146, 108, 82], s: [[0.72, 1.38], [0.7, 1.12], [0.55, 0.75]], twist: 0, bpm: 152, line: "≈ 152 BPM · 16 pétales acérés, couronnes écartées" },
  klaak: { n: [16, 16, 8], d: [160, 116, 84], s: [[0.5, 1.48], [0.5, 1.2], [0.5, 0.8]], twist: 22.5, bpm: 185, line: "≈ 185 BPM · 32 lames, fleur éclatée" },
};

/** Ordre du roster sur l’accueil (orbite, rail mobile, bandeau) ; les artistes ajoutés plus tard suivent. */
export const ORBIT_ORDER = ["originz", "rayzorks", "klaak", "moonwave", "namdak", "soul-edge", "kangapta", "marsupial", "rajax"];
