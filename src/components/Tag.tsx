import type { ReactNode } from "react";

// Tags de Composants.dc.html. Le statut est porté par le texte, jamais par la seule couleur.
const VARIANTS = {
  upcoming: "bg-lotus text-nuit",
  lastSpots: "border-[1.5px] border-ember text-ember",
  soldOut: "bg-ember text-nuit",
  past: "bg-nuit-raised text-ink-muted",
  format: "border border-line bg-nuit text-ink",
  city: "bg-nuit-raised text-ink-muted",
  country: "bg-lotus-deep text-lotus",
} as const;

export type TagVariant = keyof typeof VARIANTS;

export function Tag({ variant, children, className = "" }: { variant: TagVariant; children: ReactNode; className?: string }) {
  return (
    <span
      className={`lbl relative inline-flex items-center rounded-sm px-2.5 py-1.5 text-[11px] whitespace-nowrap ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export const STATUS_LABELS = {
  upcoming: "À venir",
  lastSpots: "Dernières places",
  soldOut: "Complet",
  past: "Passé",
} as const;

export type EventStatus = keyof typeof STATUS_LABELS;

export function StatusTag({ status, className }: { status: EventStatus; className?: string }) {
  return (
    <Tag variant={status} className={className}>
      {STATUS_LABELS[status]}
    </Tag>
  );
}
