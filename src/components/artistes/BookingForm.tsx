import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import type { Artist } from "../../content/schemas";
import { site } from "../../site";

// Formulaire de booking (vouvoiement) : aucun envoi par le site. Il ouvre la messagerie de la personne
// avec une demande pré-remplie à booking@outrance.org (CLAUDE.md : n’invente aucune API).
type State = "idle" | "sending" | "success" | "error";
type FieldName = "name" | "email" | "artist" | "message";

const ERRORS: Record<FieldName, string> = {
  name: "Merci d’indiquer votre nom.",
  email: "Cette adresse e-mail semble incomplète.",
  artist: "Merci de choisir un artiste.",
  message: "Merci de préciser le lieu, le format et votre message.",
};

type Props = {
  artists: Pick<Artist, "slug" | "name">[];
  selected: string;
  onSelect: (slug: string) => void;
  selectRef: RefObject<HTMLSelectElement | null>;
};

export function BookingForm({ artists, selected, onSelect, selectRef }: Props) {
  const id = useId();
  const [state, setState] = useState<State>("idle");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const resultRef = useRef<HTMLDivElement>(null);
  const booking = site.emails.booking;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value.trim();
    const next: Partial<Record<FieldName, string>> = {};
    (["name", "email", "artist", "message"] as FieldName[]).forEach((n) => {
      const el = form.elements.namedItem(n) as HTMLInputElement;
      if (!el.validity.valid) next[n] = ERRORS[n];
    });
    setErrors(next);
    const firstInvalid = (Object.keys(next) as FieldName[])[0];
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLElement).focus();
      return;
    }

    const artistName = artists.find((a) => a.slug === get("artist"))?.name ?? get("artist");
    const subject = `Demande de booking — ${artistName}`;
    const body = [
      `Nom : ${get("name")}`,
      `E-mail : ${get("email")}`,
      `Artiste : ${artistName}`,
      get("date") ? `Date envisagée : ${get("date")}` : null,
      "",
      get("message"),
    ]
      .filter((l) => l !== null)
      .join("\n");

    setState("sending");
    // Si la messagerie s’ouvre, la page perd le focus ; sinon on propose l’adresse directe.
    let left = false;
    const onBlur = () => (left = true);
    window.addEventListener("blur", onBlur, { once: true });
    window.location.href = `mailto:${booking}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => {
      window.removeEventListener("blur", onBlur);
      setState(left || document.visibilityState === "hidden" ? "success" : "error");
      requestAnimationFrame(() => resultRef.current?.focus());
    }, 1200);
  };

  const field = (name: FieldName) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
  });
  const errorText = (name: FieldName) =>
    errors[name] ? (
      <span id={`${id}-${name}-err`} className="text-[13px] text-ember">
        {errors[name]}
      </span>
    ) : null;

  return (
    <div className="flex flex-col gap-6">
      {(state === "success" || state === "error") && (
        <div
          ref={resultRef}
          tabIndex={-1}
          role={state === "error" ? "alert" : "status"}
          className={`rounded-md p-5 outline-none ${state === "success" ? "bg-lotus-deep" : "border border-ember bg-nuit-raised"}`}
        >
          {state === "success" ? (
            <p className="m-0">Votre messagerie s’est ouverte avec votre demande pré-remplie : il ne vous reste qu’à l’envoyer.</p>
          ) : (
            <p className="m-0">
              Votre messagerie ne s’est pas ouverte ? Écrivez-nous directement à <a href={`mailto:${booking}`}>{booking}</a>.
            </p>
          )}
        </div>
      )}

      <form noValidate onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
        <label className="field">
          <span className="field-label">Nom</span>
          <input name="name" required autoComplete="name" className="field-control" {...field("name")} />
          {errorText("name")}
        </label>
        <label className="field">
          <span className="field-label">Adresse e-mail</span>
          <input name="email" type="email" required autoComplete="email" className="field-control" {...field("email")} />
          {errorText("email")}
        </label>
        <label className="field">
          <span className="field-label">Artiste</span>
          <select
            ref={selectRef}
            name="artist"
            required
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
            className="field-control"
            {...field("artist")}
          >
            <option value="">Choisir un artiste</option>
            {artists.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
          {errorText("artist")}
        </label>
        <label className="field">
          <span className="field-label">Date envisagée</span>
          <input name="date" placeholder="jj/mm/aaaa" className="field-control" />
        </label>
        <label className="field sm:col-span-2">
          <span className="field-label">Lieu, format, message</span>
          <textarea name="message" required className="field-control" {...field("message")} />
          {errorText("message")}
        </label>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button type="submit" className="btn btn-lotus min-h-[52px]" aria-busy={state === "sending"} disabled={state === "sending"}>
            {state === "sending" ? "Ouverture de la messagerie…" : "Envoyer la demande"}
          </button>
          <span className="text-[14px] text-ink-muted">
            Votre messagerie s’ouvrira avec la demande pré-remplie pour <a href={`mailto:${booking}`}>{booking}</a>.
          </span>
        </div>
      </form>
    </div>
  );
}
