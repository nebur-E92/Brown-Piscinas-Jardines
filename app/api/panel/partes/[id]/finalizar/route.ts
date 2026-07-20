import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../../../lib/panel/auth";
import { getDb } from "../../../../../../lib/panel/db";

type Params = Promise<{ id: string }>;

// POST /api/panel/partes/[id]/finalizar — congelar datos, asignar nº temporada
export async function POST(_req: NextRequest, { params }: { params: Params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();

  const result = await sql.begin(async (tx) => {
    // Leer parte
    const [parte] = await tx`
      SELECT * FROM partes_visita WHERE id = ${id}
    `;
    if (!parte) throw new Error("NOT_FOUND");

    // Bloquear la propiedad para serializar numeración entre partes concurrentes
    await tx`SELECT 1 FROM propiedades WHERE id = ${parte.propiedad_id} FOR UPDATE`;

    // Verificar que hay borrador activo
    const [borrador] = await tx`
      SELECT id, fecha FROM partes_versiones
      WHERE parte_id = ${id} AND estado = 'borrador'
    `;
    if (!borrador) throw new Error("NO_BORRADOR");

    // El año solo se deriva de la fecha al numerar por primera vez.
    // Las correcciones conservan la temporada del parte original.
    const fechaBorrador = borrador.fecha ? new Date(borrador.fecha) : null;
    const anioFecha = parte.numero_temporada == null && fechaBorrador
      ? fechaBorrador.getUTCFullYear()
      : parte.anio;

    // Actualizar anio del parte si la fecha cambió de año
    if (anioFecha !== parte.anio) {
      await tx`UPDATE partes_visita SET anio = ${anioFecha}, updated_at = now() WHERE id = ${id}`;
    }

    // Asignar número de temporada si no tiene
    let numero = parte.numero_temporada;
    if (numero == null) {
      const [{ nuevo_num }] = await tx`
        SELECT COALESCE(MAX(numero_temporada), 0) + 1 AS nuevo_num
        FROM partes_visita
        WHERE propiedad_id = ${parte.propiedad_id}
          AND anio = ${anioFecha}
          AND numero_temporada IS NOT NULL
      `;
      numero = nuevo_num;

      await tx`
        UPDATE partes_visita
        SET numero_temporada = ${numero}, updated_at = now()
        WHERE id = ${id}
      `;
    }

    // Construir snapshot de datos fijos (técnico = usuario autenticado)
    const [datos] = await tx`
      SELECT
        p.direccion, p.ref_servicio, p.tipo_cliente, p.tipo AS tipo_propiedad,
        c.nombre AS cliente_nombre, c.telefono AS cliente_telefono, c.email AS cliente_email
      FROM propiedades p
      JOIN clientes c ON c.id = p.cliente_id
      WHERE p.id = ${parte.propiedad_id}
    `;

    // Obtener datos del técnico desde el usuario autenticado
    const [tecnico] = await tx`
      SELECT nombre_profesional, firma_base64 FROM panel_users WHERE id = ${session.userId}
    `;

    const snapshot = {
      direccion: datos.direccion,
      ref_servicio: datos.ref_servicio,
      tipo_cliente: datos.tipo_cliente,
      tipo_propiedad: datos.tipo_propiedad,
      tecnico_nombre: tecnico?.nombre_profesional ?? null,
      firma_base64: tecnico?.firma_base64 ?? null,
      cliente_nombre: datos.cliente_nombre,
      cliente_telefono: datos.cliente_telefono,
      cliente_email: datos.cliente_email,
    };

    // Cambiar estado a finalizado
    await tx`
      UPDATE partes_versiones SET
        estado = 'finalizado',
        snapshot_datos_fijos = ${tx.json(snapshot)},
        updated_at = now()
      WHERE parte_id = ${id} AND estado = 'borrador'
    `;

    return { numero_temporada: numero };
  }).catch((err) => {
    if (err.message === "NOT_FOUND") return { error: "Parte no encontrado.", status: 404 };
    if (err.message === "NO_BORRADOR") return { error: "No hay borrador activo.", status: 409 };
    throw err;
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}

// DELETE /api/panel/partes/[id]/finalizar — revertir a borrador
export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });

  const { id } = await params;
  const sql = getDb();

  const result = await sql.begin(async (tx) => {
    const [parteBase] = await tx`
      SELECT propiedad_id FROM partes_visita WHERE id = ${id}
    `;
    if (!parteBase) throw new Error("NOT_FOUND");

    // Mismo cerrojo que la finalización: serializa toda la temporada.
    await tx`SELECT 1 FROM propiedades WHERE id = ${parteBase.propiedad_id} FOR UPDATE`;

    const [parte] = await tx`
      SELECT id, propiedad_id, anio, numero_temporada
      FROM partes_visita
      WHERE id = ${id}
      FOR UPDATE
    `;

    const [version] = await tx`
      SELECT id, estado, corrige_version_id
      FROM partes_versiones
      WHERE parte_id = ${id}
      ORDER BY version DESC
      LIMIT 1
      FOR UPDATE
    `;

    if (!version) throw new Error("NOT_FOUND");
    if (version.estado !== "finalizado") throw new Error("NOT_FINALIZADO");
    if (parte.numero_temporada == null) throw new Error("SIN_NUMERO");

    const esCorreccion = version.corrige_version_id != null;
    if (!esCorreccion) {
      const [{ max_numero }] = await tx`
        SELECT MAX(numero_temporada) AS max_numero
        FROM partes_visita
        WHERE propiedad_id = ${parte.propiedad_id}
          AND anio = ${parte.anio}
          AND numero_temporada IS NOT NULL
      `;

      if (Number(max_numero) !== Number(parte.numero_temporada)) {
        throw new Error("NO_ES_ULTIMO");
      }
    }

    await tx`
      UPDATE partes_versiones SET
        estado = 'borrador',
        snapshot_datos_fijos = NULL,
        updated_at = now()
      WHERE id = ${version.id} AND estado = 'finalizado'
    `;

    if (!esCorreccion) {
      await tx`
        UPDATE partes_visita SET
          numero_temporada = NULL,
          updated_at = now()
        WHERE id = ${id}
      `;
    }
    return { ok: true };
  }).catch((err) => {
    if (err.message === "NOT_FOUND") return { error: "Parte no encontrado.", status: 404 };
    if (err.message === "NOT_FINALIZADO") {
      return { error: "Solo se puede revertir un parte finalizado.", status: 409 };
    }
    if (err.message === "SIN_NUMERO") {
      return { error: "El parte finalizado no tiene número de temporada.", status: 409 };
    }
    if (err.message === "NO_ES_ULTIMO") {
      return {
        error: "Solo se puede revertir el último número de la temporada para evitar huecos.",
        status: 409,
      };
    }
    throw err;
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
