import type { ReactNode } from "react";

// En-tête de section des artboards Association : label lotus + h2 (30 / 40 / clamp jusqu’à 52 px).
export function SectionHeading({ id, label, title, className = "" }: { id: string; label: string; title: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <span className="lbl text-[12px] text-lotus lg:text-[13px]">{label}</span>
      <h2 id={id} className="disp text-[30px] leading-none font-bold tracking-[-0.01em] sm:text-[40px] lg:text-[clamp(40px,4vw,52px)]">
        {title}
      </h2>
    </div>
  );
}
