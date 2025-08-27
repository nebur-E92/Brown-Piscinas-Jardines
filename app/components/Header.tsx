import Image from 'next/image';

export default function Header() {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex flex-col items-center md:flex-row md:items-center gap-4 w-full">
       <Image
          src="/icons/logo.svg"
         alt="Brown logo"
          width={60}
          height={60}
         className="rounded-none p-0 m-0"
        />
        <h1 className="font-fredericka text-4xl tracking-wide drop-shadow-lg text-center w-full">
        BROWN PISCINAS & JARDINES
        </h1>
      </div>
      <nav className="flex flex-col items-end gap-4 ml-auto min-w-[180px]">
  <a href="/" className="text-black font-semibold hover:underline whitespace-nowrap">Inicio</a>
  <a href="#servicios" className="text-black font-semibold hover:underline whitespace-nowrap">Servicios</a>
  <a href="#como-trabajamos" className="text-black font-semibold hover:underline whitespace-nowrap">Cómo trabajamos</a>
  <a href="#contacto" className="text-black font-semibold hover:underline whitespace-nowrap">Contacto</a>
</nav>
    </header>
  );
}