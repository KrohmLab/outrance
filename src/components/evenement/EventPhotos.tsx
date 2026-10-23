import type { AlbumSummary, Photo } from "../../content/schemas";
import { PhotoViewer, usePhotoViewer } from "../galerie/PhotoViewer";

// Photos de la soirée sur sa fiche : les premières vignettes de l’album (seules embarquées dans la page),
// chacune ouvre la visionneuse à cette photo ; le reste de l’album se charge à l’ouverture.

export type EventAlbum = { summary: AlbumSummary; preview: Photo[] };

const MOBILE = 6;

function More({ n, className }: { n: number; className: string }) {
  return (
    <span aria-hidden="true" className={`disp absolute inset-0 flex items-center justify-center bg-nuit/60 text-[20px] font-bold text-ink sm:text-[26px] ${className}`}>
      +{n}
    </span>
  );
}

export function EventPhotos({ album }: { album: EventAlbum }) {
  const viewer = usePhotoViewer();
  const { summary, preview } = album;
  const rest = summary.count - preview.length;

  return (
    <section id="photos" aria-labelledby="photos-titre" className="scroll-mt-24 border-t border-line">
      <div className="wrap flex flex-col gap-5 py-12 sm:gap-8 sm:py-[72px] lg:gap-10 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="flex flex-col gap-3">
            <span className="lbl text-lotus">Galerie</span>
            <h2 id="photos-titre" className="disp text-[32px] leading-none font-bold tracking-[-0.01em] sm:text-[44px] lg:text-[clamp(30px,3.6vw,48px)]">
              Photos de la soirée
            </h2>
          </div>
          <button type="button" className="lnk cursor-pointer border-0 bg-transparent p-0 font-[inherit]" aria-haspopup="dialog" onClick={() => viewer.open(summary)}>
            Voir les {summary.count} photos <span className="ar" aria-hidden="true">→</span>
          </button>
        </div>
        <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:grid-cols-4 sm:gap-3 lg:gap-4">
          {preview.map((photo, i) => (
            <li key={photo.src} className={i >= MOBILE ? "max-sm:hidden" : undefined}>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-label={`Ouvrir la photo ${i + 1} sur ${summary.count}`}
                onClick={() => viewer.open(summary, i)}
                className="card group relative block aspect-square w-full cursor-pointer border-0 p-0"
              >
                <img src={photo.thumb ?? photo.src} alt="" loading="lazy" decoding="async" className="zoom size-full object-cover" />
                {/* « +N » sur la dernière vignette visible : 6 en mobile, toutes à partir de 640 px. */}
                {i === MOBILE - 1 && summary.count > MOBILE && <More n={summary.count - MOBILE} className="sm:hidden" />}
                {i === preview.length - 1 && rest > 0 && <More n={rest} className={i === MOBILE - 1 ? "max-sm:hidden" : ""} />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <PhotoViewer {...viewer.props} />
    </section>
  );
}
