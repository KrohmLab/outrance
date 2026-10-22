// « Qui contacter » : cartes mailto. Bordure border (et non line) pour un contour de contrôle à plus de 3:1.
type Props = { contacts: { label: string; email: string }[] };

export function Contacts({ contacts }: Props) {
  return (
    <section aria-labelledby="contacts-titre" className="wrap flex flex-col gap-8 py-16 sm:py-[88px]">
      <div className="flex flex-col gap-3">
        <p className="lbl m-0 text-lotus">Interlocuteurs</p>
        <h2 id="contacts-titre" className="disp text-[clamp(34px,4.4vw,56px)] leading-none font-bold tracking-[-0.01em]">
          Qui contacter
        </h2>
      </div>
      <ul role="list" className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] gap-4 p-0">
        {contacts.map((c) => (
          <li key={c.email} className="flex">
            <a
              href={`mailto:${c.email}`}
              className="flex min-h-11 flex-1 flex-col gap-2 rounded-md border border-border p-6 text-ink no-underline transition-[border-color,background-color] duration-300 hover:border-lotus hover:bg-nuit-raised hover:text-ink focus-visible:border-lotus focus-visible:bg-nuit-raised"
            >
              <span className="lbl text-[11px] text-lotus">{c.label}</span>
              {/* Adresse en casse normale (lisible), coupure possible seulement après « @ ». */}
              <span className="text-[17px] leading-[1.3] font-semibold">
                {c.email.split("@")[0]}@<wbr />
                {c.email.split("@")[1]}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
