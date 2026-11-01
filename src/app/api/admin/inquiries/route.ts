import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MASJID_ADMIN")) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
  return NextResponse.json({ inquiries: [] });
}
