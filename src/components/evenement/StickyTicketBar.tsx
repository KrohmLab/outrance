import { useEffect, useRef } from "react";
import { shortDate } from "./event-data";

// Barre de billetterie collante en bas de l’écran (date, tarif, bouton Billetterie).
// Mobile (< 640px) : toujours visible, seul élément uv de l’écran (le hero masque le sien).
// Tablette et desktop : cachée en haut de page, elle remonte dès qu’on commence à faire défiler
// et redescend quand on revient tout en haut.
type Props = { title: string; date: string; price?: string | null; ticketUrl: string };

export function StickyTicketBar({ title, date, price, ticketUrl }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    const update = () => bar.toggleAttribute("data-shown", window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div ref={ref} className="ticket-bar sticky bottom-0 z-20 border-t border-line bg-nuit-raised/94 backdrop-blur-[14px]">
      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] sm:wrap sm:gap-6 sm:py-3.5">
        <span className="flex min-w-0 flex-col leading-[1.3] sm:flex-row sm:items-baseline sm:gap-4">
          <span className="lbl text-[10px] text-ink-muted sm:text-[12px] sm:text-lotus">{shortDate(date)}</span>
          <span className="disp hidden truncate text-[15px] font-bold lg:block">{title}</span>
          <span className="font-bold sm:text-ink-muted lg:before:mr-4 lg:before:text-[10px] lg:before:content-['◉']">{price ?? "Tarif à venir"}</span>
        </span>
        <a className="btn btn-uv min-h-12 flex-none px-[22px]" href={ticketUrl} rel="noopener">
          Billetterie <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
