"use client";
import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit() {
    setTimeout(() => {
      setForm({
        nombre: "",
        email: "",
        telefono: "",
        mensaje: "",
      });
    }, 100); // Espera breve para que Formspree procese el envío
  }

  return (
    <form
      id="contacto"
      action="https://formspree.io/f/xqadaakq"
      method="POST"
      className="max-w-md mx-auto p-6 bg-white rounded shadow"
      onSubmit={handleSubmit}
    >
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
        placeholder="Mensaje*"
        className="mb-4 w-full p-2 border rounded"
        required
        value={form.mensaje}
        onChange={handleChange}
      />
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        Enviar
      </button>
    </form>
  );
}