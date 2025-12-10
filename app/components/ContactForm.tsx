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
    privacidad: false,
  });

  useEffect(() => {
    if (defaults) setForm((f) => ({ ...f, ...defaults } as any));
  }, [defaults]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  return (
    <form
      id="contacto"
      action="/api/contact"
      method="POST"
      className="max-w-md mx-auto p-6 bg-white rounded shadow"
    >
      <input type="hidden" name="servicio" value={form.servicio} />
      <input type="hidden" name="servicios" value={form.servicios} />
      <input type="hidden" name="tamano" value={form.tamano} />
      <input type="hidden" name="frecuencia" value={form.frecuencia} />
      <input type="hidden" name="municipio" value={form.municipio} />
      <input type="hidden" name="precio" value={form.precio} />

      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        className="mb-4 w-full p-2 border rounded"
        value={form.nombre}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email*"
        className="mb-4 w-full p-2 border rounded"
        required
        value={form.email}
        onChange={handleChange}
      />
      <input
        type="tel"
        name="telefono"
        placeholder="Teléfono"
        className="mb-4 w-full p-2 border rounded"
        value={form.telefono}
        onChange={handleChange}
      />
      <textarea
        name="mensaje"
        placeholder="Describe tu necesidad*"
        className="mb-2 w-full p-2 border rounded"
        required
        value={form.mensaje}
        onChange={handleChange}
      />
      <div className="mb-4 text-xs text-neutral-600">
        Al enviar, aceptas el tratamiento de tus datos para gestionar tu solicitud. Responsable: Brown Piscinas & Jardines. Email: brownpiscinasyjardines@gmail.com. Más info en <a href="/legal/privacidad" className="underline">Política de privacidad</a>.
      </div>
      <label className="flex items-center gap-2 text-sm mb-4">
        <input type="checkbox" name="privacidad" required checked={!!form.privacidad} onChange={handleChange} />
        He leído y acepto la Política de privacidad
      </label>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Enviar
      </button>
    </form>
  );
}