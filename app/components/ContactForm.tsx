"use client";
import { useEffect, useState } from "react";

type Props = { defaults?: Partial<Record<string, string>> };

export default function ContactForm({ defaults }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
    servicio: "",
    servicios: "",
    tamano: "",
    frecuencia: "",
    municipio: "",
    precio: "",
    qr_source: "",
    privacidad: false,
  });

  useEffect(() => {
    if (defaults) setForm((f) => ({ ...f, ...defaults } as any));
    if (typeof document !== "undefined") {
      const qrSource = document.cookie
        .split("; ")
        .find((row) => row.startsWith("qr_source="))
        ?.split("=")[1];
      if (qrSource) setForm((f) => ({ ...f, qr_source: qrSource }));
    }
  }, [defaults]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target as any;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  const inputCls =
    "w-full bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neutral-400 transition";

  return (
    <section id="contacto" className="py-20 border-t border-neutral-800">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 text-center mb-3">
          Contacto
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2">
          ¿Hablamos?
        </h2>
        <p className="text-neutral-400 text-center mb-10 text-sm">
          Cuéntanos qué necesitas y te respondemos en menos de 24 h.
        </p>

        <form action="/api/contact" method="POST" className="space-y-4">
          {/* Campos ocultos */}
          <input type="hidden" name="servicio"   value={form.servicio} />
          <input type="hidden" name="servicios"  value={form.servicios} />
          <input type="hidden" name="tamano"     value={form.tamano} />
          <input type="hidden" name="frecuencia" value={form.frecuencia} />
          <input type="hidden" name="municipio"  value={form.municipio} />
          <input type="hidden" name="precio"     value={form.precio} />
          <input type="hidden" name="qr_source"  value={form.qr_source} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              className={inputCls}
              value={form.nombre}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              className={inputCls}
              value={form.telefono}
              onChange={handleChange}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email *"
            required
            className={inputCls}
            value={form.email}
            onChange={handleChange}
          />

          <textarea
            name="mensaje"
            placeholder="Describe tu necesidad *"
            required
            rows={4}
            className={inputCls + " resize-none"}
            value={form.mensaje}
            onChange={handleChange}
          />

          <label className="flex items-start gap-3 text-xs text-neutral-400 cursor-pointer">
            <input
              type="checkbox"
              name="privacidad"
              required
              checked={!!form.privacidad}
              onChange={handleChange}
              className="mt-0.5 accent-white"
            />
            <span>
              He leído y acepto la{" "}
              <a href="/legal/privacidad" className="underline text-neutral-300 hover:text-white transition">
                Política de privacidad
              </a>
              . Responsable: Rubén Herrero García · {" "}
              <a href="mailto:brownpiscinasyjardines@gmail.com" className="underline text-neutral-300 hover:text-white transition">
                brownpiscinasyjardines@gmail.com
              </a>
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-white text-black font-semibold py-3.5 rounded-full hover:bg-neutral-100 active:scale-[0.98] transition-all"
          >
            Enviar mensaje
          </button>
        </form>
      </div>
    </section>
  );
}
