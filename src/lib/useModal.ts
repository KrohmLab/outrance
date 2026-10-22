import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

let lockCount = 0;
let savedOverflow = "";

/** Bloque le scroll de la page ; plusieurs overlays peuvent l’empiler. */
function lockScroll() {
  const root = document.documentElement;
  if (lockCount++ === 0) {
    savedOverflow = root.style.overflow;
    root.style.overflow = "hidden";
  }
  return () => {
    if (--lockCount === 0) root.style.overflow = savedOverflow;
  };
}

/** Rend le reste de la page inerte (contenu et pied de page), sauf les overlays rendus hors de #contenu. */
function inertBackground(except: HTMLElement[]) {
  const targets = [document.getElementById("contenu"), document.getElementById("pied-de-page"), document.querySelector("header")]
    .filter((el): el is HTMLElement => el !== null)
    .filter((el) => !except.some((x) => el.contains(x) || x.contains(el)));
  const previous = targets.map((el) => el.inert);
  targets.forEach((el) => (el.inert = true));
  return () => targets.forEach((el, i) => (el.inert = previous[i] ?? false));
}

export function focusables(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => el.getClientRects().length > 0 && !el.closest("[inert]"),
  );
}

type Options = {
  open: boolean;
  onClose: () => void;
  /** Conteneurs dans lesquels le focus reste piégé (le dialogue, éventuellement le header). */
  containers: RefObject<HTMLElement | null>[];
  /** Élément (ou zone dont le premier élément focalisable) à focaliser à l’ouverture ; par défaut le premier focalisable. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Où rendre le focus à la fermeture ; par défaut l’élément actif avant l’ouverture. */
  returnFocus?: RefObject<HTMLElement | null>;
  /** Le header reste interactif (menu burger) : il ne devient pas inerte. */
  keepHeader?: boolean;
};

/**
 * Comportement commun des dialogues modaux (CLAUDE.md) : piège de focus, Échap, page inerte,
 * scroll bloqué, focus rendu à l’élément d’origine. La fermeture par le fond est gérée par le composant.
 */
export function useModal({ open, onClose, containers, initialFocus, returnFocus, keepHeader }: Options) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const boxes = containers.map((r) => r.current).filter((el): el is HTMLElement => el !== null);
    if (boxes.length === 0) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const returnTarget = returnFocus?.current ?? opener;
    const header = document.querySelector("header");
    const unInert = inertBackground(keepHeader && header ? [...boxes, header] : boxes);
    const unlock = lockScroll();

    const target = initialFocus?.current;
    const first = target ? (target.matches(FOCUSABLE) ? target : (focusables(target)[0] ?? target)) : (boxes.flatMap(focusables)[0] ?? boxes[0]);
    first?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = boxes.flatMap(focusables);
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (!firstItem || !lastItem) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      const inside = active !== null && items.includes(active);
      if (event.shiftKey && (active === firstItem || !inside)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && (active === lastItem || !inside)) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      unInert();
      unlock();
      if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });
    };
    // Les refs sont stables ; seul `open` déclenche l’effet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}
