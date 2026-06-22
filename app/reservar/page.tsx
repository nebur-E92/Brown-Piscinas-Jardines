import { Suspense } from "react";
import BookingFlow from "./_components/BookingFlow";

export const metadata = {
  title: "Reservar servicio puntual — BROWN Piscinas & Jardines",
  description: "Reserva servicios puntuales de piscina y jardín o solicita lista de espera para mantenimiento periódico en Salamanca.",
};

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const tipo      = sp.tipo ?? sp.servicio ?? undefined;
  const servicios = sp.servicios ?? undefined;
  const precio    = sp.precio ?? undefined;

  // Si viene de la calculadora, saltar al paso de fecha
  const tipoInicial = tipo ?? (servicios ? "servicio" : undefined);

  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Reserva un servicio puntual</h1>
          <p className="text-neutral-500 text-sm">
            Agenda disponible lunes, miércoles y viernes por la mañana. Para mantenimiento periódico, dejamos tu solicitud en lista de espera.
          </p>
        </div>
        <Suspense fallback={null}>
          <BookingFlow
            tipoInicial={tipoInicial}
            serviciosInicial={servicios}
            precioInicial={precio}
          />
        </Suspense>
      </div>
    </section>
  );
}
