import PriceCalculator from "../components/PriceCalculator";

export const metadata = {
  title: "Calcular servicio puntual",
  description: "Calcula un precio orientativo para servicios puntuales de piscina y jardín.",
};

export default function CalcularPrecioPage() {
  return (
    <section className="py-12">
      <PriceCalculator />
    </section>
  );
}
