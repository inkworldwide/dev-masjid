import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const masjids = await prisma.masjid.findMany({
      select: { id: true, name: true, enabledModules: true },
      orderBy: { createdAt: "desc" }
    });

    // Transform to matrix format for UI: { "manage_events": { "masjid-id": true } }
    const matrix: Record<string, Record<string, boolean>> = {};
    const masjidsList = masjids.map((m) => ({ key: m.id, label: m.name }));

    for (const masjid of masjids) {
      const modules = (masjid.enabledModules as string[]) || [];
      for (const mod of modules) {
        if (!matrix[mod]) matrix[mod] = {};
        matrix[mod][masjid.id] = true;
      }
    }

    return NextResponse.json({ matrix, masjidsList });
  } catch (error) {
    console.error("Failed to fetch RBAC matrix:", error);
    return NextResponse.json({ error: "Failed to fetch RBAC data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { matrix } = await req.json();
    if (!matrix) {
      return NextResponse.json({ error: "Matrix is required" }, { status: 400 });
    }

    // Transform matrix back to per-masjid arrays
    // matrix: { "module_name": { "masjid_id": true } }
    const masjidModules: Record<string, string[]> = {};

    for (const [moduleName, masjidMap] of Object.entries(matrix as Record<string, Record<string, boolean>>)) {
      for (const [masjidId, isEnabled] of Object.entries(masjidMap)) {
        if (!masjidModules[masjidId]) {
          masjidModules[masjidId] = [];
        }
        if (isEnabled) {
          masjidModules[masjidId].push(moduleName);
        }
      }
    }

    // Update the database
    // We update them individually since Prisma doesn't have a bulk update for different JSON arrays
    const updatePromises = Object.entries(masjidModules).map(([masjidId, modules]) => 
      prisma.masjid.update({
        where: { id: masjidId },
        data: { enabledModules: modules }
      })
    );

    // Also need to clear out modules for masjids that are entirely false in the matrix,
    // but the above logic only updates those that have at least one entry.
    // It's safer to fetch all masjids, build the arrays, and update all.

    const allMasjids = await prisma.masjid.findMany({ select: { id: true } });
    
    const finalUpdatePromises = allMasjids.map((masjid) => {
      const modulesForThisMasjid = masjidModules[masjid.id] || [];
      return prisma.masjid.update({
        where: { id: masjid.id },
        data: { enabledModules: modulesForThisMasjid }
      });
    });

    await Promise.all(finalUpdatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save RBAC matrix:", error);
    return NextResponse.json({ error: "Failed to save RBAC data" }, { status: 500 });
  }
}
