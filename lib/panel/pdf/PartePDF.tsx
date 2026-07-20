import React from "react";
import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import { styles } from "./styles";

type Medicion = { codigo: string; valor: number | null; opcion: string | null; obs: string | null };
type Actuacion = { nombre: string; ambito: string; estado: string; detalle: string | null };

export type PartePDFData = {
  logo_src: string;
  // Parte
  numero_temporada: number | null;
  anio: number;
  // Versión
  version: number;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  mediciones: Medicion[];
  actuaciones: Actuacion[];
  estado_agua: string | null;
  estado_liner: string | null;
  estado_equipos: string | null;
  estado_jardin: string | null;
  cierre_preventivo: boolean;
  cierre_motivo: string | null;
  incidencias: string | null;
  recomendaciones: string | null;
  stock_titular: string | null;
  restos_vegetales: string | null;
  enviada_at: string | null;
  // Snapshot
  snapshot: {
    direccion: string | null;
    ref_servicio: string | null;
    tipo_cliente: string | null;
    tipo_propiedad: string;
    tecnico_nombre: string | null;
    firma_base64: string | null;
    cliente_nombre: string;
    cliente_telefono: string | null;
    cliente_email: string | null;
  };
};

const RANGOS: Record<string, { min: string; max: string; unidad: string }> = {
  cloro_libre:     { min: "0,5",  max: "2,0",  unidad: "mg/l" },
  cloro_combinado: { min: "0",    max: "0,6",  unidad: "mg/l" },
  ph:              { min: "7,2",  max: "7,8",  unidad: "" },
  temperatura:     { min: "-",    max: "-",    unidad: "°C" },
  cianurico:       { min: "-",    max: "75",   unidad: "mg/l" },
  salinidad:       { min: "3000", max: "5000", unidad: "ppm" },
};

const PARAM_LABELS: Record<string, string> = {
  cloro_libre: "Cloro libre",
  cloro_combinado: "Cloro combinado",
  ph: "pH",
  temperatura: "Temperatura",
  turbidez: "Turbidez",
  cianurico: "Ác. cianúrico",
  salinidad: "Sal (ppm)",
};

const ESTADO_LABELS: Record<string, string> = {
  optimo: "Óptimo", aceptable: "Aceptable", deficiente: "Deficiente", critico: "Crítico",
  sin_incidencias: "Sin incidencias", con_incidencias: "Con incidencias",
  correcto: "Correcto", averia: "Avería", comunicada: "Comunicada",
};

const TIPO_CLIENTE_LABEL: Record<string, string> = {
  particular: "Particular", comunidad: "Comunidad", casa_rural: "Casa rural",
};

function fmtDate(d: string | null): string {
  if (!d) return "-";
  const [y, m, dd] = d.split("T")[0].split("-");
  return `${dd}/${m}/${y}`;
}

function fmtTime(d: string | null): string {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
}

export function PartePDF({ data }: { data: PartePDFData }) {
  const s = data.snapshot;
  const incluyePiscina = s.tipo_propiedad === "piscina" || s.tipo_propiedad === "combinado";
  const incluyeJardin = s.tipo_propiedad === "jardin" || s.tipo_propiedad === "combinado";
  const actPiscina = data.actuaciones?.filter((a) => a.ambito === "piscina") ?? [];
  const actJardin = data.actuaciones?.filter((a) => a.ambito === "jardin") ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* 1. CABECERA */}
        <View style={styles.header}>
          <Image src={data.logo_src} style={styles.logoImage} />
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>PARTE DE VISITA TÉCNICA</Text>
            <Text style={styles.headerInfo}>Ref: {s.ref_servicio ?? "-"}</Text>
            <Text style={styles.headerInfo}>Fecha: {fmtDate(data.fecha)}</Text>
            <Text style={styles.headerInfo}>Visita nº {data.numero_temporada ?? "-"} / {data.anio}</Text>
            {data.version > 1 && <Text style={styles.headerInfo}>Versión: {data.version}</Text>}
          </View>
        </View>

        <View style={styles.sectionTitle}>
          <Text>1. DATOS DE LA VISITA</Text>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: "#666" }}>Cliente</Text>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{s.cliente_nombre}</Text>
            {s.cliente_telefono && <Text style={{ fontSize: 8 }}>{s.cliente_telefono}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: "#666" }}>Instalación</Text>
            <Text style={{ fontSize: 9 }}>{s.direccion ?? "-"}</Text>
            <Text style={{ fontSize: 8, color: "#666" }}>
              {s.tipo_cliente ? TIPO_CLIENTE_LABEL[s.tipo_cliente] ?? s.tipo_cliente : ""}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 8, color: "#666" }}>Horario</Text>
            <Text style={{ fontSize: 8 }}>Entrada: {fmtTime(data.hora_entrada)}</Text>
            <Text style={{ fontSize: 8 }}>Salida: {fmtTime(data.hora_salida)}</Text>
          </View>
        </View>

        {/* 2. PARÁMETROS DEL AGUA */}
        <View style={styles.sectionTitle}>
          <Text>2. PARÁMETROS DEL AGUA</Text>
        </View>
        {incluyePiscina ? (
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>Parámetro</Text>
              <Text style={[styles.tableCellBold, { flex: 1, textAlign: "center" }]}>Valor</Text>
              <Text style={[styles.tableCellBold, { flex: 1, textAlign: "center" }]}>Rango RD 742/2013</Text>
              <Text style={[styles.tableCellBold, { flex: 2 }]}>Observación</Text>
            </View>
            {(data.mediciones ?? []).map((m) => {
              const rango = RANGOS[m.codigo];
              return (
                <View key={m.codigo} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{PARAM_LABELS[m.codigo] ?? m.codigo}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "center", fontFamily: "Helvetica-Bold" }]}>
                    {m.valor != null ? String(m.valor).replace(".", ",") : m.opcion ?? "-"}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: "center", fontSize: 7, color: "#888" }]}>
                    {rango ? `${rango.min}-${rango.max}` : "-"}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2, fontSize: 7, color: "#666" }]}>{m.obs ?? ""}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={{ fontSize: 8, color: "#999", marginBottom: 5, paddingLeft: 4 }}>
            Servicio no incluye piscina - N/A
          </Text>
        )}

        {/* 3. ACTUACIONES PISCINA */}
        <View style={styles.sectionTitle}>
          <Text>3. ACTUACIONES PISCINA</Text>
        </View>
        {incluyePiscina ? (
          <ActuacionesTable items={actPiscina} />
        ) : (
          <Text style={{ fontSize: 8, color: "#999", marginBottom: 5, paddingLeft: 4 }}>N/A</Text>
        )}

        {/* 4. ACTUACIONES JARDÍN */}
        <View style={styles.sectionTitle}>
          <Text>4. ACTUACIONES JARDÍN</Text>
        </View>
        {incluyeJardin ? (
          <View>
            <ActuacionesTable items={actJardin} />
            {data.restos_vegetales && (
              <Text style={{ fontSize: 8, marginTop: 3, paddingLeft: 4 }}>
                Restos vegetales: {data.restos_vegetales === "mas_150l" ? "> 150 L (+60 €)" : "<= 150 L"}
              </Text>
            )}
          </View>
        ) : (
          <Text style={{ fontSize: 8, color: "#999", marginBottom: 5, paddingLeft: 4 }}>N/A</Text>
        )}

        {/* 5. ESTADO GENERAL */}
        <View style={styles.sectionTitle}>
          <Text>5. ESTADO GENERAL DE LA INSTALACIÓN</Text>
        </View>
        <View style={{ paddingHorizontal: 4, marginBottom: 5 }}>
          {incluyePiscina && (
            <>
              <StateRow label="Agua" value={data.estado_agua} />
              <StateRow label="Liner" value={data.estado_liner} />
              <StateRow label="Equipos" value={data.estado_equipos} />
            </>
          )}
          {incluyeJardin && <StateRow label="Jardín" value={data.estado_jardin} />}
          {data.cierre_preventivo && (
            <View style={[styles.stateRow, { marginTop: 4 }]}>
              <Text style={[styles.stateValue, { color: "#c00" }]}>
                CIERRE PREVENTIVO: {data.cierre_motivo ?? "Sin motivo especificado"}
              </Text>
            </View>
          )}
        </View>

        {/* 6. INCIDENCIAS Y RECOMENDACIONES */}
        <View style={styles.sectionTitle}>
          <Text>6. INCIDENCIAS Y RECOMENDACIONES</Text>
        </View>
        <View style={{ paddingHorizontal: 4, marginBottom: 5 }}>
          <TextBlock label="Incidencias observadas" text={data.incidencias} />
          <TextBlock label="Recomendaciones hasta próxima visita" text={data.recomendaciones} />
          <TextBlock label="Productos que debe tener en stock el titular" text={data.stock_titular} />
        </View>

        {/* 7. CONFORMIDAD */}
        <View style={styles.sectionTitle}>
          <Text>7. CONFORMIDAD</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerLeyenda}>
            {data.enviada_at
              ? `Parte remitido al titular el ${fmtDate(data.enviada_at)}. Se entiende conforme salvo comunicación en contrario en el plazo de 48 horas.`
              : "Parte finalizado y pendiente de registrar su envío al titular."}
          </Text>

          <View style={styles.firmaBlock}>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.firmaLabel}>Técnico: {s.tecnico_nombre ?? "-"}</Text>
              {s.firma_base64 && (
                <Image src={s.firma_base64} style={styles.firmaImg} />
              )}
            </View>
          </View>
        </View>

        {/* Número de página */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

// -- Subcomponentes --

function ActuacionesTable({ items }: { items: Actuacion[] }) {
  const STATUS_LABEL: Record<string, string> = { si: "SI", no: "-", na: "N/A" };
  return (
    <View style={styles.table}>
      {items.map((a) => (
        <View key={a.nombre} style={styles.actRow}>
          <Text style={styles.actStatus}>{STATUS_LABEL[a.estado] ?? a.estado}</Text>
          <Text style={styles.actName}>{a.nombre}</Text>
          <Text style={styles.actDetail}>{a.detalle ?? ""}</Text>
        </View>
      ))}
    </View>
  );
}

function StateRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.stateRow}>
      <Text style={styles.stateLabel}>{label}</Text>
      <Text style={styles.stateValue}>{value ? (ESTADO_LABELS[value] ?? value) : "-"}</Text>
    </View>
  );
}

function TextBlock({ label, text }: { label: string; text: string | null }) {
  return (
    <View style={styles.textBlock}>
      <Text style={styles.textLabel}>{label}</Text>
      <Text style={styles.textContent}>{text || "Sin observaciones."}</Text>
    </View>
  );
}
