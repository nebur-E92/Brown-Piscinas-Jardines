import Image from 'next/image';

type MonthlyServiceCardProps = {
  image: string;
  title: string;
  description: string;
  advantages: string[];
  price: string;
  borderColor: string;
};

type SimpleMonthlyCardProps = {
  image: string;
  title: string;
  description: string;
  includes: string[];
  price: string;
  gradient?: string;
  bgImage?: string;
};

type PuntualServiceCardProps = {
  image: string;
  title: string;
  description: string;
  price: string;
  gradient: string;
};

function MonthlyServiceCard({ image, title, description, advantages, price, borderColor }: MonthlyServiceCardProps) {
  return (
    <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row items-center bg-black text-white rounded-xl shadow-xl mb-12 border p-6 gap-20">
      <div className="flex-shrink-0">
        <div className="bg-white rounded-xl p-1" style={{ boxSizing: 'border-box' }}>
          <Image
            src={image}
            alt={title}
            width={340}
            height={230}
            className="rounded-xl border border-white"
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-4">
        <h4 className="text-2xl font-bold">{title}</h4>
        <p className="font-semibold">{description}</p>
        <div>
          <span className="font-bold">Ventajas:</span>
          <ul className="list-disc ml-6">
            {advantages.map((adv: string, i: number) => <li key={i}>{adv}</li>)}
          </ul>
        </div>
        <div className="text-4xl font-bold mt-4">{price}</div>
      </div>
    </div>
  );
}

function SimpleMonthlyCard({ image, title, description, includes, price, gradient, bgImage }: SimpleMonthlyCardProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-2xl shadow-lg overflow-hidden"
      style={{
        width: '625px',
        height: '400px',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
     <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl"></div>
      <div className="relative z-10 flex flex-col h-full justify-between pt-10 pb-10 px-6 text-white">
        <h4 className="text-2xl font-bold mb-0">{title}</h4>
        <p className="mb-0 font-semibold">{description}</p>
        <span className="font-bold">Incluye:</span>
        <ul className="list-disc ml-6 mb-0 text-sm">
          {includes.map((inc: string, i: number) => <li key={i}>{inc}</li>)}
        </ul>
        <div className="text-3xl font-bold mt-2">{price}</div>
      </div>
    </div>
  );
}

function PuntualServiceCard({ image, title, description, price, gradient }: PuntualServiceCardProps) {
  return (
    <div className="flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden shadow-lg" style={{ background: gradient }}>
      <div className="w-full h-[220px]">
        <Image
          src={image}
          alt={title}
          width={400}
          height={220}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full p-10 flex flex-col justify-center text-white">
        <h4 className="text-lg font-bold mb-2">{title}</h4>
        <p className="mb-2 font-medium">{description}</p>
        <div className="text-xl font-bold">{price}</div>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section id="servicios" className="py-16 bg-white">
      {/* Títulos */}
      <h2 className="text-center text-4xl font-urbanist mb-4">SERVICIOS DE BROWN PISCINAS & JARDINES</h2>
      <h3 className="text-center text-2xl font-urbanist font-light mb-12">MANTENIMIENTOS MENSUALES</h3>

      {/* Tarjeta principal combinada */}
      <MonthlyServiceCard
        image="/images/service-combined.webp"
        title="Mantenimiento Combinado Piscina + Jardín"
        description="La solución más completa y económica: mantenimiento integral de tu piscina y jardín en una misma visita."
        advantages={[
          "Ahorro frente a contratar servicios por separado.",
          "Informe único de estado de piscina y jardín.",
          "Optimización de desplazamientos y tiempos."
        ]}
        price="Desde 250 € / mes"
        borderColor="border-black"
      />

      {/* Tarjeta piscina */}
      <div className="flex flex-row justify-center gap-12 max-w-[1300px] mx-auto mb-12">
        <SimpleMonthlyCard
          image="/images/service-pool.png"
          title="Mantenimiento de Piscina"
          description="Disfruta de tu piscina siempre limpia y lista para el baño."
          includes={[
            "Limpieza de superficie y fondo.",
            "Cepillado de paredes y línea de flotación.",
            "Revisión de skimmers, prefiltro y bomba.",
            "Control y ajuste de pH, cloro y otros parámetros."
          ]}
          price="Desde 125 € / mes"
          gradient=""
          bgImage="/images/service-pool.png"
  />

      {/* Tarjeta jardín */}
       <SimpleMonthlyCard
        image="/images/service-garden.webp"
        title="Mantenimiento de Jardín"
        description="Un jardín cuidado todo el año, verde y saludable."
        includes={[
          "Corte de césped y perfilado de bordes.",
          "Riego y revisión del sistema.",
          "Eliminación de hierbas no deseadas.",
          "Revisión general de plantas ornamentales."
        ]}
        price="Desde 130 € / mes"
        gradient=""
        bgImage="/images/service-garden.webp"
  />
</div>

      {/* Servicios puntuales */}
      <h3 className="text-center text-3xl font-urbanist mb-12">SERVICIOS PUNTUALES</h3>
<div className="flex flex-row justify-center gap-8 max-w-[1300px] mx-auto mb-12">
  <PuntualServiceCard
    image="/images/service-poolclean.webp"
    title="Limpieza puntual de piscina"
    description="Recupera tu piscina en una sola visita: limpieza a fondo y ajuste de parámetros para que vuelva a estar lista."
    price="Desde 60 €"
    gradient="linear-gradient(180deg, #082047ff 50%, #597ca7ff 100%)"
  />
  <PuntualServiceCard
    image="/images/service-mow.webp"
    title="Corte puntual de césped"
    description="Ideal para jardines que necesitan una puesta a punto rápida: corte uniforme y perfilado de bordes."
    price="Desde 70 €"
    gradient="linear-gradient(180deg, #0d3828ff 50%, #bbf7d0 100%)"
  />
  <PuntualServiceCard
    image="/images/service-desbroce.webp"
    title="Desbroce de terrenos"
    description="Elimina hierba alta y maleza en parcelas o solares. Trabajo con desbrozadora profesional."
    price="Desde 0,30 € / m²"
    gradient="linear-gradient(180deg, #382a0dff 50%, #83731dff 100%)"
  />
  <PuntualServiceCard
    image="/images/service-hedge.webp"
    title="Recorte de setos y arbustos"
    description="Perfiles limpios y a la altura adecuada, con retirada de restos vegetales incluida."
    price="Desde 2 € / metro lineal"
    gradient="linear-gradient(180deg, #573434ff 50%, #e99292ff 100%)"
  />
</div>
      <div className="flex justify-center mt-8">
        <a
          href="#contacto"
          className="inline-block px-6 py-3 bg-blue-900 text-white rounded shadow border border-blue-300 font-semibold"
          style={{ boxShadow: '0 2px 8px rgba(26,35,126,0.25)' }}
        >
          Solicita tu presupuesto
        </a>
      </div>
    </section>
  );
}