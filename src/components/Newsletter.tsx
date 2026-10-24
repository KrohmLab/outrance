import { useId, useRef, useState, type FormEvent } from "react";
import { site } from "../site";
import { AlertIcon, CheckIcon } from "./icons";

// Newsletter avec ses quatre états (repos, envoi, succès, erreur), d’après Composants.dc.html.
// L’adresse part vers /api/newsletter (worker/index.ts), qui l’inscrit dans beehiiv : rien n’est chargé
// depuis beehiiv dans le navigateur. Le champ « website », invisible, piège les robots.
type State = "idle" | "sending" | "success" | "error";

async function subscribe(email: string, website: string): Promise<void> {
  const res = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, website, page: window.location.pathname }),
  });
  if (!res.ok) throw new Error(`Inscription refusée (${res.status})`);
}

export function Newsletter({ id, className = "" }: { id?: string; className?: string }) {
  const inputId = useId();
  const errorId = useId();
  const [state, setState] = useState<State>("idle");
  const [invalid, setInvalid] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("email") as HTMLInputElement;
    const trap = event.currentTarget.elements.namedItem("website") as HTMLInputElement | null;
    if (!input.validity.valid) {
      setInvalid(true);
      input.focus();
      return;
    }
    setInvalid(false);
    setState("sending");
    try {
      await subscribe(input.value, trap?.value ?? "");
      setState("success");
    } catch {
      setState("error");
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  return (
    <section id={id} aria-labelledby={`${inputId}-title`} className={`flex flex-col gap-4 rounded-md bg-nuit-raised p-6 sm:p-8 ${className}`}>
      <h2 id={`${inputId}-title`} className="disp text-[clamp(22px,2.6vw,32px)] leading-none font-bold">
        {site.newsletter.title}
      </h2>
      <p className="m-0 max-w-[560px] text-ink-muted">{site.newsletter.text}</p>

      {state === "success" || state === "error" ? (
        <div
          ref={resultRef}
          tabIndex={-1}
          role={state === "error" ? "alert" : "status"}
          className={`flex items-start gap-4 rounded-md p-5 outline-none ${state === "success" ? "bg-lotus-deep" : "border border-line bg-nuit"}`}
        >
          <span className={`flex size-12 flex-none items-center justify-center rounded-pill border-2 ${state === "success" ? "border-lotus text-lotus" : "border-ember text-ember"}`}>
            {state === "success" ? <CheckIcon size={24} /> : <AlertIcon size={24} />}
          </span>
          <div className="flex flex-col gap-1.5">
            <p className="disp m-0 text-[17px] font-semibold">{state === "success" ? "Bienvenue dans la tribu" : "Oups, ça n’a pas marché"}</p>
            <p className="m-0 text-ink-muted">
              {state === "success" ? (
                "Confirme ton adresse depuis l’e-mail qu’on vient de t’envoyer."
              ) : (
                <>
                  Réessaie dans un instant, ou écris-nous à <a href={`mailto:${site.emails.contact}`}>{site.emails.contact}</a>.
                </>
              )}
            </p>
            {state === "error" && (
              <button type="button" className="lnk w-fit cursor-pointer border-0 bg-transparent p-0" onClick={() => setState("idle")}>
                Réessayer <span className="ar" aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
          {/* Piège à robots : hors écran, ignoré des lecteurs d’écran et de la tabulation. */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />
          <label className="field min-w-0 flex-[1_1_260px]" htmlFor={inputId}>
            <span className="field-label">E-mail</span>
            <input
              id={inputId}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="ton@email.fr"
              disabled={state === "sending"}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? errorId : undefined}
              className="field-control"
            />
          </label>
          <button type="submit" className="btn btn-lotus min-h-[52px] min-w-[150px]" aria-busy={state === "sending"} disabled={state === "sending"}>
            {state === "sending" ? (
              <>
                <svg aria-hidden="true" viewBox="-12 -12 24 24" className="size-[22px] animate-spin">
                  <circle r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 20" strokeLinecap="round" />
                </svg>
                <span className="sr-only">Envoi en cours</span>
              </>
            ) : (
              "S’abonner"
            )}
          </button>
          {invalid && (
            <p id={errorId} className="m-0 w-full text-[13px] text-ember">
              Cette adresse e-mail semble incomplète.
            </p>
          )}
        </form>
      )}
    </section>
  );
}
