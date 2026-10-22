// Filtres en pastilles (.chip) : boutons à bascule exclusive, aria-pressed.
type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** En mobile, les pastilles se partagent la largeur. */
  stretch?: boolean;
  className?: string;
};

export function ChipGroup<T extends string>({ label, options, value, onChange, stretch, className = "" }: Props<T>) {
  return (
    <div role="group" aria-label={label} className={`flex gap-2 ${className}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`chip ${stretch ? "flex-1 sm:flex-none" : ""} ${on ? "chip-on" : ""}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
