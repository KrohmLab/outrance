import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "../lib/useHydrated";
import { useModal } from "../lib/useModal";

// Menu contextuel (« Ajouter à mon agenda », « Partager ») traité comme un vrai dialogue (CLAUDE.md) :
// rendu hors de #contenu, piège de focus, Échap, clic extérieur, focus rendu au déclencheur.
// Apparition en 300 ms (opacité + translateY(-6px) scale(.97)), d’après Composants.dc.html.

type TriggerProps = {
  ref: RefObject<HTMLButtonElement | null>;
  "aria-haspopup": "dialog";
  "aria-expanded": boolean;
  "aria-controls": string;
  onClick: () => void;
};

type Props = {
  label: string;
  trigger: (props: TriggerProps) => ReactNode;
  children: (close: () => void) => ReactNode;
  minWidth?: number;
};

export function PopoverDialog({ label, trigger, children, minWidth = 260 }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const hydrated = useHydrated();

  useModal({ open, onClose: close, containers: [panelRef], returnFocus: triggerRef });

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const width = Math.min(minWidth, window.innerWidth - 32);
    const left = Math.max(16, Math.min(r.left, window.innerWidth - width - 16));
    setPos({ top: r.bottom + 8, left });
  }, [open, minWidth]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) close();
    };
    const onResize = () => close();
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  const panel = (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      inert={!open}
      data-open={open || undefined}
      style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, minWidth: Math.min(minWidth, 9999) }}
      className="popover fixed z-[55] flex max-w-[calc(100vw-32px)] flex-col rounded-md border border-line bg-nuit p-2"
    >
      {children(close)}
    </div>
  );

  return (
    <>
      {trigger({
        ref: triggerRef,
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "aria-controls": id,
        onClick: () => setOpen((o) => !o),
      })}
      {hydrated && createPortal(panel, document.body)}
    </>
  );
}
