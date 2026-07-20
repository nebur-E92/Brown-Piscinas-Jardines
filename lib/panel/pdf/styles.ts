import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 35,
    color: "#1a1a1a",
  },
  // Cabecera
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#1a1a1a",
  },
  logoImage: {
    width: 43,
    height: 56,
    objectFit: "contain",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  headerInfo: {
    fontSize: 8,
    color: "#444",
    marginBottom: 1,
  },
  // Secciones
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    padding: 5,
    marginTop: 10,
    marginBottom: 5,
  },
  // Tablas
  table: {
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    minHeight: 18,
    alignItems: "center",
  },
  tableRowHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#999",
    minHeight: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  tableCell: {
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tableCellBold: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
  },
  // Actuaciones
  actRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    minHeight: 16,
    alignItems: "center",
    paddingVertical: 2,
  },
  actName: {
    flex: 1,
    paddingLeft: 4,
    fontSize: 8,
  },
  actStatus: {
    width: 30,
    textAlign: "center",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  actDetail: {
    flex: 1,
    paddingLeft: 4,
    fontSize: 7,
    color: "#666",
  },
  // Estado general
  stateRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  stateLabel: {
    width: 100,
    fontSize: 8,
    color: "#666",
  },
  stateValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  // Textos libres
  textBlock: {
    marginBottom: 6,
  },
  textLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#444",
    marginBottom: 2,
  },
  textContent: {
    fontSize: 8,
    lineHeight: 1.4,
  },
  // Pie / conformidad
  footer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  footerLeyenda: {
    fontSize: 7,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 8,
  },
  firmaBlock: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginTop: 5,
  },
  firmaLabel: {
    fontSize: 7,
    color: "#666",
    marginRight: 10,
  },
  firmaImg: {
    width: 80,
    height: 40,
  },
  // Página número
  pageNumber: {
    position: "absolute",
    fontSize: 7,
    bottom: 20,
    right: 35,
    color: "#aaa",
  },
});
