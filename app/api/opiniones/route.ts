import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!key || !placeId) {
    return NextResponse.json({ error: "Faltan GOOGLE_MAPS_API_KEY o GOOGLE_PLACE_ID" }, { status: 500 });
  }

  // New Places API (v1) endpoint
  const url = `https://places.googleapis.com/v1/places/${placeId}`;
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": key,
    "X-Goog-FieldMask": "rating,userRatingCount,reviews.authorAttribution,reviews.rating,reviews.text,reviews.relativePublishTimeDescription,reviews.publishTime"
  };

  try {
    const res = await fetch(url, { headers });
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: json.error?.message || "Error al obtener reseñas" }, { status: 502 });
    }

    const reviews = Array.isArray(json.reviews) ? json.reviews.map((r: any) => ({
      author_name: r.authorAttribution?.displayName || "Anónimo",
      rating: r.rating || 0,
      text: r.text?.text || "",
      relative_time_description: r.relativePublishTimeDescription || "",
      profile_photo_url: r.authorAttribution?.photoUri,
      time: r.publishTime ? new Date(r.publishTime).getTime() / 1000 : undefined,
    })) : [];

    return NextResponse.json({
      rating: json.rating || null,
      total: json.userRatingCount || null,
      reviews,
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
  }
}
