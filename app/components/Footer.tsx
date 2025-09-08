import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-row justify-between items-start gap-8">
          {/* Columna 1: Logo */}
          <div>
            <Image
              src="/icons/logo-inverted.svg"
              alt="Brown logo"
              width={60}
              height={60}
              className="rounded-none p-0 m-0"
            />
          </div>
          {/* Columna 2 */}
          <div>
            <h4 className="font-bold mb-2">Legal</h4>
            <ul>
              <li>
                <a href="/docs/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href="/docs/cookies-policy.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                  Política de cookies
                </a>
              </li>
              <li>
                <a href="/docs/Tarifas-Brown.pdf" target="_blank" rel="noopener noreferrer" className="underline">
                  Tarifas
                </a>
              </li>
              <li>
                <a href="https://www.brownpiscinasyjardines.es/" target="_blank" rel="noopener noreferrer" className="underline">Blog</a>
              </li>
              <li>
                <a href="/docs/aviso-legal.pdf" target="_blank" rel="noopener noreferrer" className="underline">Aviso legal</a>
              </li>
            </ul>
          </div>
          {/* Columna 3 */}
          <div>
            <h4 className="font-bold mb-2">Contacto</h4>
            <ul>
              <li>Tel: 625 199 394</li>
              <li>Email: brownpiscinasyjardines@gmail.com</li>
              <li>Ubicación: Salamanca y alrededores</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-gray-400">
          © 2025 Brown Piscinas & Jardines
        </div>
      </div>
    </footer>
  );
}