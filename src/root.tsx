import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ToastProvider } from "./components/Toast";
import { events } from "./content/load.server";
import { toSummary } from "./lib/featured";
import { buildTime } from "./lib/useNow";
import "./styles/theme.css";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export async function loader() {
  return { events: events.map(toSummary) };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-build-time={buildTime}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0712" />
        {/* Sans JavaScript, les éléments à apparition restent visibles. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <a
        href="#contenu"
        className="btn btn-lotus fixed top-3 left-3 z-50 -translate-y-24 focus-visible:translate-y-0"
      >
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
    </ToastProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const title = isRouteErrorResponse(error) ? `Erreur ${error.status}` : "Erreur";
  return (
    <main id="contenu" className="wrap flex min-h-[60vh] flex-col justify-center gap-5 py-20">
      <span className="lbl text-lotus">{title}</span>
      <h1 className="disp text-[clamp(36px,5vw,64px)] leading-[0.98] font-extrabold">Le son a coupé</h1>
      <p className="m-0 max-w-[480px] text-lg text-ink-muted">
        Quelque chose s’est mal passé. Recharge la page ou reviens à l’accueil.
      </p>
      <a className="lnk" href="/">
        Retour à l’accueil <span className="ar" aria-hidden="true">→</span>
      </a>
    </main>
  );
}
