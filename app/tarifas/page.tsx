import Link from "next/link";

export const metadata = {
  title: "Tarifas — BROWN Piscinas & Jardines",
  description: "Tarifas de servicios puntuales de piscinas y jardines en Salamanca. Nuevas altas de mantenimiento periódico en lista de espera. IVA incluido.",
};

export default function TarifasPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Tarifas</h1>
      <p className="text-sm text-neutral-400 mb-2">Versión 4.0 · IVA incluido</p>
      <p className="text-sm text-neutral-600 mb-8">
        El precio final se calcula multiplicando la unidad de medida (m², ml o m² de lámina) por la tarifa base y por el factor de frecuencia pactado. Se aplican mínimos por visita en todos los servicios.{" "}
        <strong>Productos químicos no incluidos</strong> — se facturan aparte según consumo real.
      </p>
      <div className="mb-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
        <strong>Agenda periódica completa:</strong> las nuevas altas semanales o quincenales están en lista de espera. Las tarifas siguen publicadas como referencia; la contratación abierta actualmente es para servicios puntuales según disponibilidad.
      </div>

      {/* Factores de frecuencia */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-3 border-b pb-2">Factores de frecuencia</h2>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          {[
            { label: "Puntual", sub: "sin compromiso", factor: "× 1,00", desc: "" },
            { label: "Quincenal", sub: "2 visitas/mes", factor: "× 0,88", desc: "−12 %" },
            { label: "Semanal", sub: "4 visitas/mes", factor: "× 0,78", desc: "−22 %" },
          ].map(({ label, sub, factor, desc }) => (
            <div key={label} className="border rounded-xl p-4">
              <p className="font-semibold">{label}</p>
              <p className="text-xs text-neutral-400 mb-2">{sub}</p>
              <p className="text-xl font-bold">{factor}</p>
              {desc && <p className="text-xs text-green-600 font-medium">{desc}</p>}
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-500 mt-3">El factor se aplica al precio base de cada visita y se pacta al inicio del servicio. Un cambio de frecuencia requiere preaviso de 15 días.</p>
      </section>

      {/* 1. Césped */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-1 border-b pb-2">1. Césped</h2>
        <p className="text-xs text-neutral-500 mb-3">Solo para césped en estado de mantenimiento normal · Unidad: €/m² · Mínimo por visita: <strong>90 €</strong></p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="py-2 text-left font-semibold">Concepto</th>
              <th className="py-2 text-center font-semibold">Puntual</th>
              <th className="py-2 text-center font-semibold">Quincenal</th>
              <th className="py-2 text-center font-semibold">Semanal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Precio base / m²</td>
              <td className="py-2 text-center font-medium">0,36 €</td>
              <td className="py-2 text-center font-medium">0,32 €</td>
              <td className="py-2 text-center font-medium">0,28 €</td>
            </tr>
          </tbody>
        </table>
        <ul className="text-xs text-neutral-500 mt-2 space-y-1 list-disc pl-4">
          <li>Incluye corte, perfilado de bordes, soplado y retirada de restos hasta 150 L.</li>
          <li>Restos superiores a 150 L → suplemento fijo de 60 €.</li>
        </ul>
      </section>

      {/* 2. Setos */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-1 border-b pb-2">2. Setos y arbustos</h2>
        <p className="text-xs text-neutral-500 mb-3">Solo para setos en estado de mantenimiento normal · Unidad: €/ml · Mínimo por visita: <strong>110 €</strong></p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="py-2 text-left font-semibold">Tipo</th>
              <th className="py-2 text-center font-semibold">Puntual</th>
              <th className="py-2 text-center font-semibold">Quincenal</th>
              <th className="py-2 text-center font-semibold">Semanal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Hoja pequeña (alibustre, boj…)</td>
              <td className="py-2 text-center font-medium">7,00 €/ml</td>
              <td className="py-2 text-center font-medium">6,16 €/ml</td>
              <td className="py-2 text-center font-medium">5,46 €/ml</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Conífera (ciprés, tuya, leylandi…)</td>
              <td className="py-2 text-center font-medium">9,00 €/ml</td>
              <td className="py-2 text-center font-medium">7,92 €/ml</td>
              <td className="py-2 text-center font-medium">7,02 €/ml</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 text-neutral-500">Suplemento altura &gt; 2 m</td>
              <td className="py-2 text-center text-neutral-600">+1,20 €/ml</td>
              <td className="py-2 text-center text-neutral-400" colSpan={2}>sin factor de frecuencia</td>
            </tr>
            <tr>
              <td className="py-2 text-neutral-500">Suplemento altura &gt; 3 m</td>
              <td className="py-2 text-center text-neutral-600">+2,50 €/ml</td>
              <td className="py-2 text-center text-neutral-400" colSpan={2}>sin factor de frecuencia</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 3. Piscina */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-1 border-b pb-2">3. Piscina</h2>
        <p className="text-xs text-neutral-500 mb-3">Solo para piscinas en estado de mantenimiento normal · Unidad: €/m² de lámina (largo × ancho) · Mínimo por visita: <strong>110 €</strong></p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="py-2 text-left font-semibold">Concepto</th>
              <th className="py-2 text-center font-semibold">Puntual</th>
              <th className="py-2 text-center font-semibold">Quincenal</th>
              <th className="py-2 text-center font-semibold">Semanal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Precio base / m² de lámina</td>
              <td className="py-2 text-center font-medium">2,40 €</td>
              <td className="py-2 text-center font-medium">2,12 €</td>
              <td className="py-2 text-center font-medium">1,88 €</td>
            </tr>
          </tbody>
        </table>
        <ul className="text-xs text-neutral-500 mt-2 space-y-1 list-disc pl-4">
          <li>Incluye análisis y ajuste de pH y cloro, limpieza de skimmers y cestas, aspirado de fondo y revisión visual de equipos.</li>
          <li>No incluye productos químicos (se facturan según consumo real).</li>
          <li>No incluye vaciado ni llenado del vaso.</li>
        </ul>

        <h3 className="text-sm font-semibold mt-5 mb-2">Puesta en marcha / Cierre de temporada</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="py-2 text-left font-semibold">Tamaño</th>
              <th className="py-2 text-center font-semibold">Precio</th>
            </tr>
          </thead>
          <tbody>
            {[["Pequeña", "300 €"], ["Mediana", "450 €"], ["Grande", "600 €"]].map(([t, p]) => (
              <tr key={t} className="border-b">
                <td className="py-2">{t}</td>
                <td className="py-2 text-center font-medium">{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 4. Desbroce */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-1 border-b pb-2">4. Desbroce de terrenos</h2>
        <p className="text-xs text-neutral-500 mb-3">Siempre servicio puntual — sin factor de frecuencia</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b">
              <th className="py-2 text-left font-semibold">Superficie</th>
              <th className="py-2 text-center font-semibold">Precio / m²</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Hasta 500 m²", "1,10 €"],
              ["501 – 2.000 m²", "0,70 €"],
              ["Más de 2.000 m²", "Presupuesto personalizado"],
            ].map(([s, p]) => (
              <tr key={s} className="border-b">
                <td className="py-2">{s}</td>
                <td className="py-2 text-center font-medium">{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="text-xs text-neutral-500 mt-2 space-y-1 list-disc pl-4">
          <li>Incluye corte de vegetación con desbrozadora y limpieza ligera in situ.</li>
          <li>Aplica a cualquier estado del terreno, incluido abandono total.</li>
          <li>No incluye retirada de restos fuera del municipio ni gestión de residuos voluminosos.</li>
        </ul>
      </section>

      {/* Desplazamiento */}
      <section className="mb-10">
        <h2 className="text-lg font-bold mb-1 border-b pb-2">Desplazamiento</h2>
        <table className="w-full text-sm border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium">Hasta 10 km desde Salamanca</td>
              <td className="py-2 text-center text-green-700 font-semibold">Gratuito</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">A partir del km 11 (ida + vuelta)</td>
              <td className="py-2 text-center font-medium">0,60 €/km</td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Fuera de provincia</td>
              <td className="py-2 text-center font-medium">Presupuesto individual</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Condiciones generales */}
      <section className="bg-neutral-50 rounded-xl p-5 text-sm text-neutral-600 space-y-1 mb-8">
        <p className="font-semibold text-neutral-800 mb-2">Condiciones generales</p>
        <p>Todos los precios incluyen IVA.</p>
        <p>La primera intervención puede requerir tarifa diferenciada según el estado inicial de la instalación.</p>
        <p>Las tarifas están sujetas a revisión semestral con preaviso por escrito.</p>
        <p>Instalaciones en estado de abandono o recuperación: presupuesto personalizado tras visita técnica previa (excepto desbroce).</p>
      </section>

      <div className="text-center">
        <Link
          href="/calcular-precio"
          className="inline-flex items-center gap-2 bg-black text-white font-semibold px-8 py-3.5 rounded-full hover:bg-neutral-800 transition-all"
        >
          Calcular mi precio →
        </Link>
      </div>
    </article>
  );
}
