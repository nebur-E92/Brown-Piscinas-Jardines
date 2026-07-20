"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const INPUT = "w-full border border-neutral-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-black";

export function ConfigTecnicoForm({
  nombreProfesional,
  firmaBase64,
}: {
  nombreProfesional: string;
  firmaBase64: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState(nombreProfesional);
  const [firma, setFirma] = useState(firmaBase64);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 400;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let quality = 0.7;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        // Reducir calidad si supera 20KB
        while (dataUrl.length > 27_000 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setFirma(dataUrl);
    } catch {
      setError("No se pudo procesar la imagen.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/panel/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_profesional: nombre || null,
          firma_base64: firma || null,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al guardar.");
        return;
      }

      setMsg("Guardado correctamente.");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Nombre profesional</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Rubén Herrero García"
          className={INPUT}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Firma del técnico</label>
        {firma && (
          <div className="mb-2 p-2 border rounded bg-neutral-50">
            <img src={firma} alt="Firma" className="max-h-20 mx-auto" />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
        />
        <p className="text-[11px] text-neutral-400 mt-1">Se comprimirá a JPEG ≤20 KB.</p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {msg && <p className="text-xs text-green-600">{msg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Guardar configuración"}
      </button>
    </form>
  );
}
