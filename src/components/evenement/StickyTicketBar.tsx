import { shortDate } from "./event-data";

// Barre de billetterie collante, mobile uniquement (< 640px) : seul élément uv de l’écran en mobile.
export function StickyTicketBar({ date, price, ticketUrl }: { date: string; price?: string | null; ticketUrl: string }) {
  return (
    <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t border-line bg-nuit-raised/94 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[14px] sm:hidden">
      <span className="flex flex-col leading-[1.3]">
        <span className="lbl text-[10px] text-ink-muted">{shortDate(date)}</span>
        <span className="font-bold">{price ?? "Tarif à venir"}</span>
      </span>
      <a className="btn btn-uv min-h-12 px-[22px]" href={ticketUrl} rel="noopener">
        Billetterie <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
