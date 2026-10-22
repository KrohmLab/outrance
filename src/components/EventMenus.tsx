import type { ReactNode } from "react";
import { downloadIcs, fullTitle, googleCalendarUrl, type CalendarEvent } from "../lib/calendar";
import { site } from "../site";
import { CalendarAddIcon, ShareIcon } from "./icons";
import { PopoverDialog } from "./PopoverDialog";
import { useToast } from "./Toast";

export function eventUrl(slug: string) {
  return `${site.url}/evenements/${slug}`;
}

const host = new URL(site.url).host;

type TriggerStyle = "lnk" | "ghost";

function triggerClass(style: TriggerStyle) {
  return style === "lnk" ? "lnk cursor-pointer border-0 bg-transparent p-0" : "btn btn-ghost";
}

/** Menu « Ajouter à mon agenda » : Google Agenda, Apple Calendrier et Outlook (.ics). */
export function CalendarMenu({ event, label = "Ajouter à mon agenda", style = "lnk" }: { event: CalendarEvent; label?: string; style?: TriggerStyle }) {
  const url = eventUrl(event.slug);
  return (
    <PopoverDialog
      label={`${label} : ${fullTitle(event)}`}
      trigger={(props) => (
        <button type="button" className={triggerClass(style)} {...props}>
          <CalendarAddIcon />
          {label}
        </button>
      )}
    >
      {(close) => (
        <>
          <a className="menu-item" href={googleCalendarUrl(event, url)} target="_blank" rel="noopener" onClick={close}>
            Google Agenda <span aria-hidden="true">↗</span>
          </a>
          {["Apple Calendrier", "Outlook"].map((name) => (
            <button
              key={name}
              type="button"
              className="menu-item"
              onClick={() => {
                downloadIcs(event, url, host);
                close();
              }}
            >
              {name} <span className="lbl text-[10px] text-ink-muted">.ics</span>
            </button>
          ))}
        </>
      )}
    </PopoverDialog>
  );
}

function canShareNatively() {
  return typeof navigator !== "undefined" && "share" in navigator && window.matchMedia("(pointer: coarse)").matches;
}

/**
 * « Partager » : partage natif du téléphone quand il existe (tactile), sinon menu
 * Copier le lien / WhatsApp. Messenger et Story Instagram demandent des éléments absents
 * (app_id Facebook, visuel 9:16) : ils ne sont pas proposés.
 */
export function ShareMenu({ title, slug, style = "lnk" }: { title: string; slug: string; style?: TriggerStyle }) {
  const toast = useToast();
  const url = eventUrl(slug);

  const copy = async (close: () => void) => {
    close();
    try {
      await navigator.clipboard.writeText(url);
      toast("Lien copié dans le presse-papiers");
    } catch {
      toast("La copie a échoué, réessaie", "error");
    }
  };

  return (
    <PopoverDialog
      label={`Partager : ${title}`}
      minWidth={250}
      trigger={({ onClick, ...props }) => (
        <button
          type="button"
          className={triggerClass(style)}
          {...props}
          onClick={() => {
            if (canShareNatively()) {
              navigator.share({ title, url }).catch(() => {});
            } else {
              onClick();
            }
          }}
        >
          <ShareIcon />
          Partager
        </button>
      )}
    >
      {(close): ReactNode => (
        <>
          <button type="button" className="menu-item" onClick={() => void copy(close)}>
            Copier le lien
          </button>
          <a
            className="menu-item"
            href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
            target="_blank"
            rel="noopener"
            onClick={close}
          >
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
        </>
      )}
    </PopoverDialog>
  );
}
