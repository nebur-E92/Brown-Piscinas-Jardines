"use client";
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
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
          <a href="/servicios" className="hover:opacity-80 whitespace-nowrap">Servicios</a>
          <a href="/calcular-precio" className="hover:opacity-80 whitespace-nowrap">Calcular precio</a>
          <a href="/opiniones" className="hover:opacity-80 whitespace-nowrap">Opiniones</a>
          <a href="/contacto" className="hover:opacity-80 whitespace-nowrap">Contacto</a>
        </nav>
        {/* Mobile trigger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded"
          aria-label="Abrir menú"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <nav className="px-4 py-3 space-y-2">
            <a onClick={() => setOpen(false)} href="/" className="block py-2">Inicio</a>
            <a onClick={() => setOpen(false)} href="/servicios" className="block py-2">Servicios</a>
            <a onClick={() => setOpen(false)} href="/calcular-precio" className="block py-2">Calcular precio</a>
            <a onClick={() => setOpen(false)} href="/opiniones" className="block py-2">Opiniones</a>
            <a onClick={() => setOpen(false)} href="/contacto" className="block py-2">Contacto</a>
          </nav>
        </div>
      )}
    </header>
  );
}
