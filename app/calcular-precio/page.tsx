import PriceCalculator from "../components/PriceCalculator";

export const metadata = {
  title: "Calcular precio",
  description: "Calcula un precio orientativo en segundos y solicita visita.",
};

export default function CalcularPrecioPage() {
  return (
    <section className="py-12">
      <PriceCalculator />
    </section>
  );
}
