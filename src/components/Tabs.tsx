import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";

// Onglets accessibles : tabindex itinérant, flèches gauche/droite, Début/Fin, panneaux liés.
type Tab<T extends string> = { value: T; label: string; count?: number };

type Props<T extends string> = {
  label: string;
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function useTabIds(prefix?: string) {
  const id = useId();
  return {
    tab: (value: string) => `${prefix ?? id}-tab-${value}`,
    panel: (value: string) => `${prefix ?? id}-panel-${value}`,
  };
}

export function Tabs<T extends string>({ label, tabs, value, onChange, className = "", ids }: Props<T> & { ids: ReturnType<typeof useTabIds> }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[
      event.key
    ];
    if (next === undefined) return;
    event.preventDefault();
    const tab = tabs[next];
    if (!tab) return;
    onChange(tab.value);
    refs.current[next]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={`flex gap-7 sm:gap-8 ${className}`}>
      {tabs.map((t, i) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={ids.tab(t.value)}
            aria-selected={on}
            aria-controls={ids.panel(t.value)}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`tab ${on ? "tab-on" : ""}`}
          >
            {t.label}
            {t.count !== undefined && <span className="lbl ml-2.5 hidden text-[11px] text-ink-muted sm:inline">{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ ids, value, active, children, className = "" }: { ids: ReturnType<typeof useTabIds>; value: string; active: boolean; children: ReactNode; className?: string }) {
  return (
    <div role="tabpanel" id={ids.panel(value)} aria-labelledby={ids.tab(value)} hidden={!active} tabIndex={0} className={`outline-none ${className}`}>
      {children}
    </div>
  );
}
