import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const redirectTo = searchParams.get("redirect") || "/";

  const response = NextResponse.redirect(new URL(redirectTo, req.url));

  response.cookies.delete("selected_masjid_id");

  return response;
}
