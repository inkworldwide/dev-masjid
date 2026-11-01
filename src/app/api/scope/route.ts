import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const masjidId = searchParams.get("masjidId");
  const redirectTo = searchParams.get("redirect") || "/";

  const response = NextResponse.redirect(new URL(redirectTo, req.url));

  if (masjidId) {
    response.cookies.set("selected_masjid_id", masjidId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return response;
}
