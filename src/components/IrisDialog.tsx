import { useRef, type ReactNode, type RefObject } from "react";
import { useHydrated } from "../lib/useHydrated";
import { useModal } from "../lib/useModal";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons";

// Visionneuses plein écran (photo, vidéo) : ouverture en iris de 700 ms sur fond nuit à 96 %.
// Fermeture par Échap, par le bouton ou par un clic sur le fond (hors du contenu).
type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  closeLabel: string;
  /** En-tête au-dessus du contenu (label, titre). */
  header?: ReactNode;
  children: ReactNode;
  initialFocus?: RefObject<HTMLElement | null>;
};

export function IrisDialog({ open, onClose, label, closeLabel, header, children, initialFocus }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const hydrated = useHydrated();
  useModal({ open, onClose, containers: [ref], initialFocus: initialFocus ?? closeRef });

  if (!hydrated) return null;
  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      inert={!open}
      data-open={open || undefined}
      className="iris fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-nuit/96 sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="iris-content flex w-full max-w-[1120px] flex-col gap-5">
        <div className="flex items-end justify-between gap-4 px-4 pt-4 sm:p-0">
          <div className="flex min-w-0 flex-col gap-1">{header}</div>
          <button ref={closeRef} type="button" className="round-btn round-btn-close" aria-label={closeLabel} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
