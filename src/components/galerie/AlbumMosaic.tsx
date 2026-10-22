import type { CSSProperties } from "react";
import type { Album } from "../../content/schemas";
import { formatDate } from "../../lib/dates";
import { Placeholder } from "../Placeholder";
import { gridValue, LAYOUTS, mosaic } from "./mosaic";

// Mosaïque d’albums (Galerie.dc.html) : 4 colonnes en desktop, 3 en tablette, 2 en mobile.
// Un album sans photo s’affiche avec le Placeholder et « Photos à venir », sans être cliquable.

type Props = { albums: Album[]; onOpen: (album: Album) => void };

export function AlbumMosaic({ albums, onOpen }: Props) {
  const m = mosaic(albums.length, LAYOUTS.mobile.cols, LAYOUTS.mobile.pattern);
  const t = mosaic(albums.length, LAYOUTS.tablet.cols, LAYOUTS.tablet.pattern);
  const d = mosaic(albums.length, LAYOUTS.desktop.cols, LAYOUTS.desktop.pattern);

  return (
    <ul className="m-0 grid list-none auto-rows-[180px] grid-cols-2 gap-2.5 p-0 sm:auto-rows-[200px] sm:grid-cols-3 sm:gap-3 lg:auto-rows-[220px] lg:grid-cols-4 lg:gap-4">
      {albums.map((album, i) => {
        const [mi, ti, di] = [m[i], t[i], d[i]].map((a) => (a ? gridValue(a) : { column: "auto", row: "auto" }));
        const style = {
          "--gc-m": mi?.column,
          "--gr-m": mi?.row,
          "--gc-t": ti?.column,
          "--gr-t": ti?.row,
          "--gc-d": di?.column,
          "--gr-d": di?.row,
        } as CSSProperties;
        return (
          <li
            key={album.event}
            style={style}
            className="flex [grid-column:var(--gc-m)] [grid-row:var(--gr-m)] sm:[grid-column:var(--gc-t)] sm:[grid-row:var(--gr-t)] lg:[grid-column:var(--gc-d)] lg:[grid-row:var(--gr-d)]"
          >
            <AlbumTile album={album} onOpen={() => onOpen(album)} />
          </li>
        );
      })}
    </ul>
  );
}

const TILE = "relative flex min-w-0 flex-1 items-end overflow-hidden rounded-md bg-placeholder p-0 text-left text-ink";

function AlbumTile({ album, onOpen }: { album: Album; onOpen: () => void }) {
  const cover = album.photos[0];
  const count = album.photos.length;
  const meta = count > 0 ? `${count} photo${count > 1 ? "s" : ""}` : "Photos à venir";
  const caption = (
    <span className="relative flex flex-col items-start gap-0.5 p-3 sm:gap-1.5 sm:p-5">
      <span className="lbl text-[10px] text-lotus sm:text-[11px]">{formatDate(album.date)}</span>
      <span className="disp text-[13px] leading-[1.15] font-semibold sm:text-[18px]">{album.title}</span>
      <span className="lbl text-[10px] text-ink-muted">
        {meta}
        {album.photographer && ` · Photo : ${album.photographer}`}
      </span>
    </span>
  );
  // Voile nuit au repos ; le voile lotus-deep apparaît en fondu au survol (deux calques : un dégradé ne s’interpole pas).
  const nightVeil = (
    <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(10,7,18,.9),rgba(10,7,18,0)_60%)]" />
  );

  if (!cover) {
    return (
      <div className={TILE}>
        <Placeholder className="absolute inset-0 p-0" />
        {nightVeil}
        {caption}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-label={`Ouvrir l’album ${album.title}`}
      onClick={onOpen}
      className={`group cursor-pointer border-0 font-[inherit] ${TILE}`}
    >
      <span className="absolute inset-0 transition-transform duration-700 ease-nuit group-hover:scale-[1.04] group-focus-visible:scale-[1.04]">
        <img
          src={cover.src}
          alt=""
          width={cover.width}
          height={cover.height}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      </span>
      {nightVeil}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(42,22,82,.92),rgba(42,22,82,.15)_70%)] opacity-0 transition-opacity duration-400 group-hover:opacity-100 group-focus-visible:opacity-100"
      />
      {caption}
    </button>
  );
}
