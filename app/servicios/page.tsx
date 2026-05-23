import Link from "next/link";
import { SERVICES } from "../../lib/seo";

export const metadata = {
  title: "Servicios",
  description: "Servicios de mantenimiento de piscinas y jardines en Salamanca.",
};

export default function ServiciosPage() {
  return (
    <section className="max-w-2xl mx-auto py-12">
      <h1 className="page-title mb-6">Servicios</h1>
      <ul className="space-y-3">
        {SERVICES.map((s) => (
          <li key={s.slug}>
            <Link href={`/servicios/${s.slug}`} className="underline">
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
