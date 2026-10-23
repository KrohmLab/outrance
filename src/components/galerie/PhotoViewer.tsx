import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Album, AlbumSummary, Photo } from "../../content/schemas";
import { formatDate } from "../../lib/dates";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";
import { IrisDialog } from "../IrisDialog";

// Visionneuse photo plein écran (Galerie.dc.html) : iris, compteur « 01 / N », précédent / suivant en boucle,
// flèches du clavier, glissé horizontal au toucher (transform posé directement, sans setState pendant le geste),
// bande de vignettes (desktop et tablette).

type Props = {
  album: Album | null;
  open: boolean;
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");
const NO_PHOTOS: never[] = [];
const SWIPE_DISTANCE = 50;
const SWIPE_SPEED = 0.5; // px/ms

export function PhotoViewer({ album, open, index, onIndex, onClose }: Props) {
  const photos = album?.photos ?? NO_PHOTOS;
  const total = photos.length;
  const current = total > 0 ? Math.min(index, total - 1) : 0;
  const photo = photos[current];
  const go = (delta: number) => {
    if (total > 1) onIndex((current + delta + total) % total);
  };
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });

  // Clavier : ← / → (en boucle), Début / Fin.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowLeft") goRef.current(-1);
      else if (e.key === "ArrowRight") goRef.current(1);
      else if (e.key === "Home") onIndex(0);
      else if (e.key === "End") onIndex(total - 1);
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, total, onIndex]);

  // Préchargement des photos voisines.
  useEffect(() => {
    if (!open || total < 2) return;
    for (const i of [current + 1, current - 1]) {
      const p = photos[(i + total) % total];
      if (p) new Image().src = p.src;
    }
  }, [open, current, total, photos]);

  // Vignette active gardée visible quand la bande déborde.
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const el = stripRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [open, current]);

  // Glissé horizontal (toucher, stylet).
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; t: number; dx: number; raf: number } | null>(null);
  const setX = (x: number, animate: boolean) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform .35s var(--ease-nuit)" : "none";
    el.style.transform = x ? `translateX(${x}px)` : "";
  };
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" || total < 2 || drag.current) return;
    drag.current = { id: e.pointerId, x: e.clientX, t: e.timeStamp, dx: 0, raf: 0 };
    setX(0, false);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x;
    if (d.raf) return;
    d.raf = requestAnimationFrame(() => {
      d.raf = 0;
      setX(d.dx, false);
    });
  };
  const endDrag = (e: ReactPointerEvent, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    cancelAnimationFrame(d.raf);
    const dx = e.clientX - d.x;
    const speed = Math.abs(dx) / Math.max(1, e.timeStamp - d.t);
    if (!cancelled && (Math.abs(dx) > SWIPE_DISTANCE || (Math.abs(dx) > 10 && speed > SWIPE_SPEED))) go(dx < 0 ? 1 : -1);
    setX(0, true);
  };

  return (
    <IrisDialog
      open={open}
      onClose={onClose}
      label="Visionneuse photo"
      closeLabel="Fermer la visionneuse"
      header={
        album && (
          <>
            <span className="lbl flex gap-3 text-[10px] sm:text-[11px]">
              <span className="hidden text-lotus sm:inline">{formatDate(album.date)}</span>
              {total > 0 && (
                <span aria-hidden="true" className="text-lotus sm:text-ink-muted">
                  {pad(current + 1)} / {pad(total)}
                </span>
              )}
            </span>
            <span className="disp text-[14px] leading-[1.15] font-semibold sm:text-[18px]">{album.title}</span>
          </>
        )
      }
    >
      <p className="sr-only" aria-live="polite">
        {total > 0 && open ? `Photo ${current + 1} sur ${total}` : ""}
      </p>
      <div className="grid grid-cols-1 items-center sm:grid-cols-[56px_minmax(0,1fr)_56px] sm:gap-3 sm:px-0 lg:grid-cols-[72px_minmax(0,1fr)_72px] lg:gap-4">
        <button type="button" className="round-btn hidden sm:inline-flex" aria-label="Photo précédente" onClick={() => go(-1)}>
          <ChevronLeftIcon />
        </button>
        <div
          className="mx-auto aspect-[3/2] w-full touch-pan-y overflow-hidden bg-placeholder select-none sm:max-w-[calc((100svh-300px)*1.5)] sm:rounded-md"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, false)}
          onPointerCancel={(e) => endDrag(e, true)}
        >
          <div ref={trackRef} className="size-full">
            {photo && (
              <img
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                decoding="async"
                draggable={false}
                className="size-full object-contain"
              />
            )}
          </div>
        </div>
        <button type="button" className="round-btn hidden justify-self-end sm:inline-flex" aria-label="Photo suivante" onClick={() => go(1)}>
          <ChevronRightIcon />
        </button>
      </div>

      {album?.photographer && (
        <p className="lbl m-0 px-4 text-center text-[11px] text-ink-muted sm:px-0">Photo : {album.photographer}</p>
      )}

      {/* Mobile : flèches en bas, glissé. */}
      <div className="flex items-center justify-between gap-3 px-4 pb-7 sm:hidden">
        <button type="button" className="round-btn" aria-label="Photo précédente" onClick={() => go(-1)}>
          <ChevronLeftIcon />
        </button>
        <span className="lbl text-[10px] text-ink-muted">Glisse pour parcourir</span>
        <button type="button" className="round-btn" aria-label="Photo suivante" onClick={() => go(1)}>
          <ChevronRightIcon />
        </button>
      </div>

      {/* Desktop et tablette : vignettes de 64 × 44 px. */}
      <div ref={stripRef} className="hidden overflow-x-auto pt-1 pb-2 sm:block">
        <div className="mx-auto flex w-max gap-2 pt-1">
          {photos.map((p, i) => {
            const on = i === current;
            return (
              <button
                key={p.src}
                type="button"
                aria-label={`Photo ${i + 1} sur ${total}`}
                aria-current={on ? "true" : undefined}
                onClick={() => onIndex(i)}
                className={`h-11 w-16 flex-none cursor-pointer overflow-hidden rounded-sm border-2 bg-nuit-raised p-0 transition-[border-color,transform] duration-200 ${on ? "-translate-y-1 border-lotus" : "border-line hover:border-border"}`}
              >
                <img src={p.thumb ?? p.src} alt="" loading="lazy" decoding="async" draggable={false} className="size-full object-cover" />
              </button>
            );
          })}
        </div>
      </div>
    </IrisDialog>
  );
}

/** État de la visionneuse : garde le dernier album pendant l’iris de fermeture ; l’ouverture repart de la photo demandée. */
const albumPhotos = new Map<string, Promise<Photo[]>>();

/** Photos d’un album, chargées une seule fois (fichier JSON pré-rendu). */
function loadPhotos(slug: string): Promise<Photo[]> {
  let photos = albumPhotos.get(slug);
  if (!photos) {
    photos = fetch(`/galerie/albums/${slug}.json`).then((res) => (res.ok ? (res.json() as Promise<Photo[]>) : Promise.reject(new Error(String(res.status)))));
    photos.catch(() => albumPhotos.delete(slug));
    albumPhotos.set(slug, photos);
  }
  return photos;
}

export function usePhotoViewer() {
  const [album, setAlbum] = useState<Album | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return {
    open: (a: AlbumSummary, start = 0) => {
      if (a.count === 0) return;
      loadPhotos(a.event).then(
        (photos) => {
          setAlbum({ event: a.event, title: a.title, date: a.date, photographer: a.photographer, photos });
          setIndex(Math.max(0, Math.min(start, photos.length - 1)));
          setOpen(true);
        },
        () => undefined, // Réseau coupé : l’album reste fermé, un nouveau clic réessaie.
      );
    },
    isOpen: open,
    props: { album, open, index, onIndex: setIndex, onClose: () => setOpen(false) },
  };
}
