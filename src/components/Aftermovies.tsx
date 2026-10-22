import { useState } from "react";
import type { Aftermovie } from "../content/schemas";
import { site } from "../site";
import { PlayIcon } from "./icons";
import { IrisDialog } from "./IrisDialog";
import { Placeholder } from "./Placeholder";

// Cartes d’aftermovies et lecteur vidéo plein écran (Galerie, Association).
// YouTube ne se charge qu’au clic sur Lecture, via youtube-nocookie.com ; l’iframe est retirée à la fermeture.

export function youtubeId(url: string | null): string | null {
  if (!url) return null;
  const m = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(url);
  return m?.[1] ?? null;
}

/** Texte de la carte, suivi du crédit quand il est connu. */
export function aftermovieText(a: Aftermovie) {
  return a.credit ? `${a.text} Par ${a.credit}.` : a.text;
}

export function AftermovieCard({ movie, onOpen, className = "" }: { movie: Aftermovie; onOpen: () => void; className?: string }) {
  return (
    <button type="button" aria-haspopup="dialog" onClick={onOpen} className={`card group cursor-pointer border-0 p-0 font-[inherit] ${className}`}>
      <Placeholder label="[Vignette vidéo]" zoom className="aspect-video w-full items-center justify-center">
        <span className="relative flex size-16 items-center justify-center rounded-pill border-[1.5px] border-lotus text-lotus transition-transform duration-300 group-hover:scale-110">
          <PlayIcon />
        </span>
      </Placeholder>
      <span className="flex flex-col gap-2 p-5 sm:p-6">
        <span className="disp text-[18px] leading-[1.15] font-semibold sm:text-[20px]">{movie.title}</span>
        <span className="text-[15px] text-ink-muted">{aftermovieText(movie)}</span>
      </span>
    </button>
  );
}

export function VideoPlayer({ movie, open, onClose }: { movie: Aftermovie | null; open: boolean; onClose: () => void }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const id = youtubeId(movie?.youtubeUrl ?? null);
  const close = () => {
    setPlaying(null);
    onClose();
  };

  return (
    <IrisDialog
      open={open}
      onClose={close}
      label="Lecteur vidéo"
      closeLabel="Fermer le lecteur"
      header={
        <>
          <span className="lbl text-[11px] text-lotus">Aftermovie</span>
          <span className="disp text-[18px] leading-[1.15] font-semibold sm:text-[24px]">{movie?.title}</span>
        </>
      }
    >
      <div className="relative aspect-video w-full overflow-hidden border-line bg-placeholder sm:rounded-md sm:border">
        {open && id && playing === id ? (
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={movie?.title ?? "Aftermovie"}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <Placeholder label={id ? "[Lecteur YouTube intégré, sans cookie]" : "[Vidéo à venir]"} className="absolute inset-0 items-center justify-center">
            {id ? (
              <button
                type="button"
                onClick={() => setPlaying(id)}
                aria-label={`Lire ${movie?.title ?? "la vidéo"}`}
                className="relative flex size-[72px] cursor-pointer items-center justify-center rounded-pill border-0 bg-lotus text-nuit transition-transform hover:scale-105 sm:size-[104px]"
              >
                <PlayIcon size={28} />
              </button>
            ) : (
              <span className="lbl relative px-4 text-center text-[11px] text-ink-muted">[Vidéo à venir]</span>
            )}
          </Placeholder>
        )}
      </div>
      <div className="flex flex-col gap-2 px-4 pb-6 sm:p-0">
        {movie && <p className="m-0 text-ink-muted">{aftermovieText(movie)}</p>}
        <a className="lnk w-fit" href={movie?.youtubeUrl ?? site.socials.youtube} target="_blank" rel="noopener">
          Voir sur YouTube <span aria-hidden="true">↗</span>
        </a>
      </div>
    </IrisDialog>
  );
}

/** Garde la dernière vidéo pendant l’animation de fermeture. */
export function useVideoPlayer() {
  const [movie, setMovie] = useState<Aftermovie | null>(null);
  const [open, setOpen] = useState(false);
  return {
    open: (m: Aftermovie) => {
      setMovie(m);
      setOpen(true);
    },
    props: { movie, open, onClose: () => setOpen(false) },
  };
}
