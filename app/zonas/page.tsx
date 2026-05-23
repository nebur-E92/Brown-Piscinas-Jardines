import Link from "next/link";
import { LOCATIONS } from "../../lib/seo";

export const metadata = {
  title: "Zonas",
  description: "Zonas donde trabajamos en Salamanca y alrededores.",
};

export default function ZonasPage() {
  return (
    <section className="max-w-2xl mx-auto py-12">
      <h1 className="page-title mb-6">Zonas</h1>
      <ul className="space-y-3">
        {LOCATIONS.map((z) => (
          <li key={z.slug}><Link className="underline" href={`/zonas/${z.slug}`}>{z.name}</Link></li>
        ))}
      </ul>
    </section>
  );
}
