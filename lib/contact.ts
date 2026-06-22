export const WHATSAPP_INITIAL_MESSAGE =
  "Hola, vengo de la web. Quiero orientar una solicitud. Servicio: __. Medidas aproximadas: __. Ubicacion: __.";

export function getWhatsAppHref(): string | null {
  const directLink = process.env.NEXT_PUBLIC_WA_BUSINESS_LINK?.trim();
  if (directLink) return directLink;

  const number = process.env.NEXT_PUBLIC_WA_BUSINESS_NUMBER?.replace(/\D/g, "");
  if (!number) return null;

  return `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_INITIAL_MESSAGE)}`;
}
