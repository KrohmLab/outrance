import type { TeamMember } from "../../content/schemas";
import { Reveal } from "../Reveal";
import { SectionHeading } from "./SectionHeading";

// Équipe (#equipe, cible de la redirection /contact) : cartes initiale + prénom + rôle complet + e-mail,
// puis les adresses contact@ et booking@. Liens d’au moins 44 px de haut.
type Props = { team: TeamMember[]; emails: { contact: string; booking: string } };

export function Team({ team, emails }: Props) {
  const contacts = [
    { label: "Contact", email: emails.contact },
    { label: "Booking", email: emails.booking },
  ];

  return (
    <section id="equipe" aria-labelledby="equipe-titre" className="scroll-mt-[69px] border-t border-line sm:scroll-mt-[77px]">
      <div className="wrap flex flex-col gap-3 py-14 sm:gap-8 sm:py-20 lg:gap-10 lg:py-24">
        <SectionHeading id="equipe-titre" label="Contacts" title="L’équipe" className="mb-2 sm:mb-0" />

        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] lg:gap-4">
          {team.map((m, i) => (
            <Reveal
              as="li"
              key={m.email}
              delay={(i % 4) * 80}
              className="flex"
            >
              <div className="flex w-full items-center gap-3.5 rounded-md bg-nuit-raised p-3.5 sm:p-4 lg:gap-4 lg:p-5 lg:transition-colors lg:duration-300 lg:hover:bg-lotus-deep">
              <span
                aria-hidden="true"
                className="disp flex size-12 flex-none items-center justify-center rounded-pill bg-lotus-deep text-[17px] font-extrabold text-lotus sm:size-[52px] sm:text-[18px] lg:size-14 lg:text-[20px]"
              >
                {m.name.charAt(0)}
              </span>
              <div className="flex min-w-0 flex-col gap-px sm:gap-0.5">
                <h3 className="disp text-[14px] leading-[1.15] font-semibold sm:text-[15px] lg:text-[17px]">{m.name}</h3>
                <span className="text-[13px] leading-[1.4] text-ink-muted lg:text-[14px]">{m.role}</span>
                <a
                  href={`mailto:${m.email}`}
                  className="flex min-h-11 items-center self-start text-[13px] font-semibold [overflow-wrap:anywhere] no-underline lg:text-[14px]"
                >
                  {m.email}
                </a>
              </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <dl className="m-0 flex flex-col gap-2 pt-4 sm:flex-row sm:gap-10 sm:pt-0 lg:flex-wrap lg:gap-x-12 lg:gap-y-4 lg:pt-2">
          {contacts.map((c) => (
            <div key={c.label} className="flex flex-col sm:gap-1">
              <dt className="lbl text-[10px] text-ink-muted lg:text-[11px]">{c.label}</dt>
              <dd className="m-0">
                <a
                  href={`mailto:${c.email}`}
                  className="inline-flex min-h-11 items-center text-[16px] font-bold no-underline sm:font-display sm:font-semibold lg:text-[18px]"
                >
                  {c.email}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
