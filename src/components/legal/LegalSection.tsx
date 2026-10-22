import type { ReactNode } from "react";

// Section de l’article : l’ancre est sur la <section>, avec la marge de défilement sous le header collant
// (68 px en mobile, 76–77 px au-delà, + 24 px).
export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titre`}
      className="scroll-mt-[92px] border-t border-line py-9 first:border-t-0 first:pt-0 sm:scroll-mt-[100px]"
    >
      <h2 id={`${id}-titre`} className="disp mb-3.5 text-[22px] leading-[1.2] font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Met en gras le début d’une chaîne de contenu (nom), jusqu’au séparateur trouvé par `split`. */
export function BoldLead({ text, split }: { text: string; split: RegExp }) {
  const match = split.exec(text);
  if (!match || match.index === 0) return <strong>{text}</strong>;
  return (
    <>
      <strong>{text.slice(0, match.index)}</strong>
      {text.slice(match.index)}
    </>
  );
}
