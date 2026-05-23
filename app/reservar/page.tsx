import { Suspense } from "react";
import BookingFlow from "./_components/BookingFlow";

export const metadata = {
  title: "Reservar cita — BROWN Piscinas & Jardines",
  description: "Reserva tu visita técnica gratuita o programa un servicio de mantenimiento de piscina o jardín en Salamanca.",
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
          <h1 className="text-3xl font-bold mb-2">Reserva tu cita</h1>
          <p className="text-neutral-500 text-sm">
            Elige día y franja horaria. Confirmaremos en menos de 24 h.
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
