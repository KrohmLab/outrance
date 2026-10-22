import { Link } from "react-router";

// Encart « Ne rate pas la prochaine » : renvoie vers la newsletter de l’accueil.
export function NewsletterCta() {
  return (
    <section className="wrap pb-8 sm:pb-[72px] lg:pb-24">
      <div className="flex flex-col gap-3 rounded-md bg-nuit-raised px-5 py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6 sm:p-8 lg:p-[clamp(28px,4vw,48px)]">
        <div className="flex max-w-[640px] flex-col gap-1.5 sm:gap-2">
          <h2 className="disp text-[20px] leading-[1.05] font-bold sm:text-[24px] lg:text-[clamp(22px,2.6vw,32px)]">Ne rate pas la prochaine</h2>
          <p className="m-0 text-[15px] text-ink-muted sm:text-base">
            Line-up, ouverture de la billetterie, early birds : tout arrive d’abord dans la newsletter.
          </p>
        </div>
        <Link className="btn btn-ghost border-lotus!" to="/#newsletter">
          Je m’inscris
        </Link>
      </div>
    </section>
  );
}
