"use client";
import Image from 'next/image';
import { useState } from 'react';
import { SERVICES } from '../../lib/seo';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/icons/logo.svg" alt="Brown logo" width={44} height={44} className="rounded-none p-0 m-0"/>
          <a href="/" className="font-semibold text-lg tracking-wide">BROWN PISCINAS & JARDINES</a>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="hover:opacity-80 whitespace-nowrap">Inicio</a>
          
          {/* Dropdown Servicios Desktop */}
          <div 
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <span className="hover:opacity-80 whitespace-nowrap cursor-pointer flex items-center gap-1">
              Servicios
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg py-2 min-w-[280px] z-50">
                {SERVICES.map((service) => (
                  <a
                    key={service.slug}
                    href={`/servicios/${service.slug}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    {service.name}
                  </a>
                ))}
              </div>
            )}
          </div>
          
          <a href="/calcular-precio" className="hover:opacity-80 whitespace-nowrap">Calcular precio</a>
          <a href="/opiniones" className="hover:opacity-80 whitespace-nowrap">Opiniones</a>
          <a href="/contacto" className="hover:opacity-80 whitespace-nowrap">Contacto</a>
        </nav>
        {/* Mobile trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center justify-center p-2 hover:bg-gray-100 transition rounded"
          aria-label="Abrir menú"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-black"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <nav className="px-4 py-3 space-y-2">
            <a onClick={() => setOpen(false)} href="/" className="block py-2">Inicio</a>
            
            {/* Dropdown Servicios Mobile */}
            <div>
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="w-full text-left py-2 flex items-center justify-between text-black bg-white border-0 focus:outline-none hover:bg-white hover:text-black hover:no-underline font-normal"
              >
                Servicios
                <svg 
                  className={`w-4 h-4 transition-transform text-black ${mobileServicesOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileServicesOpen && (
                <div className="pl-4 space-y-1">
                  {SERVICES.map((service) => (
                    <a
                      key={service.slug}
                      onClick={() => setOpen(false)}
                      href={`/servicios/${service.slug}`}
                      className="block py-2 text-sm text-gray-700"
                    >
                      {service.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
            
            <a onClick={() => setOpen(false)} href="/calcular-precio" className="block py-2">Calcular precio</a>
            <a onClick={() => setOpen(false)} href="/opiniones" className="block py-2">Opiniones</a>
            <a onClick={() => setOpen(false)} href="/contacto" className="block py-2">Contacto</a>
          </nav>
        </div>
      )}
    </header>
  );
}
