import { getDb } from "../../../../lib/panel/db";
import { getSession } from "../../../../lib/panel/auth";
import { redirect } from "next/navigation";
import { ConfigTecnicoForm } from "./_components/ConfigTecnicoForm";

export const dynamic = "force-dynamic";

export default async function ConfigPage() {
  const session = await getSession();
  if (!session) redirect("/panel-login");

  const sql = getDb();
  const [user] = await sql`
    SELECT id, email, nombre_profesional, firma_base64
    FROM panel_users WHERE id = ${session.userId}
  `;

  return (
    <div className="w-full max-w-xl p-4 sm:p-6 md:p-8">
      <h1 className="text-xl font-bold mb-6">Configuración</h1>
      <ConfigTecnicoForm
        nombreProfesional={user.nombre_profesional ?? ""}
        firmaBase64={user.firma_base64 ?? ""}
      />
    </div>
  );
}
