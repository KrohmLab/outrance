// Chiffres clés : encart lotus-deep statique (l’iris et les compteurs sont réservés à l’accueil).
// Les chiffres sans valeur (null, « chiffre à fournir ») ne sont pas affichés.
type Stat = { value: number | null; label: string };

const number = new Intl.NumberFormat("fr-FR");

export function StatsBand({ stats }: { stats: Stat[] }) {
  const shown = stats.flatMap((s, i) => (s.value === null ? [] : [{ value: s.value, label: s.label, index: i }]));
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="chiffres-titre" className="bg-lotus-deep">
      <h2 id="chiffres-titre" className="sr-only">
        L’association en chiffres
      </h2>
      <ul className="wrap m-0 grid list-none grid-cols-2 gap-x-4 gap-y-6 py-12 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8 sm:py-14 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] lg:py-16">
        {shown.map((s) => (
          // Mobile (2 colonnes) : un dernier chiffre seul sur sa ligne est centré.
          <li key={s.label} className="flex flex-col sm:gap-1 max-sm:odd:last:col-span-2 max-sm:odd:last:items-center">
            <span className={`disp text-[40px] leading-none font-extrabold sm:text-[52px] lg:text-[64px] ${s.index > 2 ? "text-lotus" : "text-ink"}`}>
              {number.format(s.value)}
            </span>
            <span className="lbl text-[10px] text-ink-muted sm:text-[11px] lg:text-[13px]">{s.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
