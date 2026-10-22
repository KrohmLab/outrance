import { data } from "react-router";
import { getEvent } from "../content/load.server";
import type { Route } from "./+types/evenement";

// Page en cours d’implémentation (étape 2).
export async function loader({ params }: Route.LoaderArgs) {
  const event = getEvent(params.slug);
  if (!event) throw data(null, { status: 404 });
  return { event };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return <section className="wrap py-24"><h1 className="disp text-display-l">{loaderData.event.title}</h1></section>;
}
