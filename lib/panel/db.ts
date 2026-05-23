import postgres from "postgres";

let _sql: postgres.Sql | null = null;

export function getDb(): postgres.Sql {
  if (!_sql) {
    if (!process.env.PANEL_DATABASE_URL) {
      throw new Error("PANEL_DATABASE_URL no está definida en las variables de entorno.");
    }
    _sql = postgres(process.env.PANEL_DATABASE_URL, { prepare: false });
  }
  return _sql;
}
