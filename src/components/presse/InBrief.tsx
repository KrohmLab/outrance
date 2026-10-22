import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "../icons";
import { TabPanel, Tabs, useTabIds } from "../Tabs";

// « Outrance en bref » : textes prêts à l’emploi (version courte / longue) avec copie, et chiffres clés.
type Length = "short" | "long";
type CopyState = "idle" | "copied" | "error";
export type StatTile = { value: string; label: string };

const LENGTHS: { value: Length; label: string }[] = [
  { value: "short", label: "Version courte" },
  { value: "long", label: "Version longue" },
];

type Props = { blurbs: Record<Length, string>; stats: StatTile[] };

export function InBrief({ blurbs, stats }: Props) {
  const [len, setLen] = useState<Length>("short");
  const [copy, setCopy] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ids = useTabIds("bref");

  useEffect(() => () => clearTimeout(timer.current), []);

  const pick = (value: Length) => {
    clearTimeout(timer.current);
    setLen(value);
    setCopy("idle");
  };

  // Repli si la copie échoue (permission refusée, contexte non sécurisé) : le texte est sélectionné pour une copie manuelle.
  const selectText = () => {
    const panel = document.getElementById(ids.panel(len));
    const selection = window.getSelection();
    if (!panel || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(panel);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const onCopy = async () => {
    clearTimeout(timer.current);
    try {
      if (!navigator.clipboard) throw new Error("Presse-papiers indisponible");
      await navigator.clipboard.writeText(blurbs[len]);
      setCopy("copied");
      timer.current = setTimeout(() => setCopy("idle"), 4000);
    } catch {
      setCopy("error");
      selectText();
    }
  };

  return (
    <section aria-labelledby="bref-titre" className="bg-lotus-deep">
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(min(100%,440px),1fr))] gap-14 py-16 sm:py-[88px]">
        <div className="flex min-w-0 flex-col gap-6">
          <p className="lbl m-0 text-lotus">Outrance en bref</p>
          <h2 id="bref-titre" className="disp text-[clamp(34px,4.4vw,56px)] leading-none font-bold tracking-[-0.01em]">
            Textes prêts à l’emploi
          </h2>
          <Tabs label="Longueur du texte" tabs={LENGTHS} value={len} onChange={pick} ids={ids} className="border-b border-border/50" />
          <div className="flex flex-col gap-4 rounded-md bg-nuit p-6 sm:p-7">
            {LENGTHS.map((l) => (
              <TabPanel
                key={l.value}
                ids={ids}
                value={l.value}
                active={l.value === len}
                className="flex flex-col gap-4 text-[17px] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-uv focus-visible:outline-solid"
              >
                {blurbs[l.value].split(/\n{2,}/).map((para) => (
                  <p key={para} className="m-0">
                    {para}
                  </p>
                ))}
              </TabPanel>
            ))}
            <div className="flex flex-col items-start gap-2">
              <button type="button" onClick={() => void onCopy()} className="btn btn-ghost min-h-11 border-lotus">
                {copy === "copied" ? (
                  <>
                    <CheckIcon size={18} />
                    Copié
                  </>
                ) : (
                  "Copier le texte"
                )}
              </button>
              <p role="status" className="m-0 text-[15px]">
                {copy === "copied" && <span className="sr-only">Texte copié dans le presse-papiers.</span>}
                {copy === "error" && <span className="text-ember">Copie impossible : sélectionnez le texte manuellement.</span>}
              </p>
            </div>
          </div>
        </div>
        <ul role="list" aria-label="Chiffres clés" className="m-0 grid list-none grid-cols-2 content-center gap-x-6 gap-y-8 p-0">
          {stats.map((s, i) => (
            <li key={s.label} className="flex min-w-0 flex-col gap-1">
              <span
                className={`disp text-[clamp(40px,10vw,56px)] leading-none font-extrabold ${
                  Math.floor(i / 2) % 2 ? "text-lotus" : "text-ink"
                }`}
              >
                {s.value}
              </span>
              <span className="lbl text-ink-muted">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
