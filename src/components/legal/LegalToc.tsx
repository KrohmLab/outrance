// Sommaire des mentions légales (Mentions-legales.dc.html, .toc). Sticky seulement en desktop, à côté de l’article :
// empilé au-dessus (tablette, mobile), il resterait collé et recouvrirait le texte.
export type TocItem = { id: string; label: string };

export function LegalToc({ items }: { items: TocItem[] }) {
  return (
    <nav aria-label="Sommaire" className="w-full max-w-[280px] lg:sticky lg:top-[110px] lg:w-[280px] lg:shrink-0">
      <ul role="list" className="m-0 list-none p-0">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-11 items-center border-l-2 border-line py-2.5 pl-4 text-[15px] font-semibold text-ink-muted no-underline hover:border-lotus hover:text-ink focus-visible:border-lotus focus-visible:text-ink"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
