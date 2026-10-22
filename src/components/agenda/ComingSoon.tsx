import { Link } from "react-router";
import { site } from "../../site";
import { TTL } from "./agenda-data";

/** Encart en pointillés « la suite arrive » : seul quand rien n’est à venir, sinon sous les cartes. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-md border-[1.5px] border-dashed border-line p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-7">
      <div className="flex flex-col gap-1">
        <h2 className={`${TTL} m-0 text-[16px] sm:text-[18px]`}>{title}</h2>
        <p className="m-0 text-[15px] text-ink-muted sm:text-base">
          Les prochaines dates tombent d’abord dans la newsletter et sur{" "}
          <a href={site.socials.instagram} rel="noopener">
            Instagram
          </a>
          .
        </p>
      </div>
      <Link className="lnk self-start sm:hidden" to="/#newsletter">
        Être prévenu <span className="ar" aria-hidden="true">→</span>
      </Link>
      <Link className="btn btn-ghost hidden border-lotus sm:inline-flex" to="/#newsletter">
        Être prévenu
      </Link>
    </div>
  );
}
