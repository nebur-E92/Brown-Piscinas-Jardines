import React from "react";
import { getQRLogs, getQRSummary } from "../../lib/qrStore";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analítica QR",
  description: "Panel interno de analítica de QR por zonas y conversiones.",
};

export default async function AnaliticaQRPage() {
  const summary = await getQRSummary();
  const logs = await getQRLogs();

  return (
    <section className="max-w-6xl mx-auto py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="page-title m-0">Analítica QR</h1>
        <div className="flex gap-2 flex-wrap">
          <a
            href="/api/qr/export"
            className="px-3 py-2 text-sm rounded border border-neutral-300 hover:bg-neutral-50"
          >
            Exportar CSV
          </a>
          <form method="POST" action="/api/qr/reset">
            <button
              type="submit"
              className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
            >
              Resetear contadores
            </button>
          </form>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Resumen por zona</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">Zona</th>
                <th className="py-2">Visitas</th>
                <th className="py-2">Conversiones</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(summary).map(([zone, v]) => (
                <tr key={zone} className="border-t">
                  <td className="py-2">{zone}</td>
                  <td>{v.count}</td>
                  <td>{v.conv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white p-4 rounded shadow overflow-auto max-h-[480px]">
          <h2 className="font-semibold mb-3">Últimos accesos</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left">
                <th className="py-2">Fecha</th>
                <th className="py-2">Zona</th>
                <th className="py-2">Dispositivo</th>
                <th className="py-2">UA</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice().reverse().map((l: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="py-2">{new Date(l.ts).toLocaleString('es-ES')}</td>
                  <td>{l.zone}</td>
                  <td>{l.device}</td>
                  <td className="max-w-[300px] truncate" title={l.ua}>{l.ua}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-4">Para persistencia en producción, define la variable `N8N_QR_WEBHOOK_URL` y reenviaremos cada evento al flujo n8n.</p>
    </section>
  );
}
