import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      const firstMasjid = await prisma.masjid.findFirst();
      masjidId = firstMasjid?.id || null;
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) {
      const fallback = await prisma.masjid.findFirst();
      masjidId = fallback?.id || null;
    }

    if (!masjidId) return NextResponse.json({ documents: [] });

    const documents = await prisma.masjidDocument.findMany({
      where: { masjidId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch documents." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, fileUrl, type, visibility, description } = body;

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      const firstMasjid = await prisma.masjid.findFirst();
      masjidId = firstMasjid?.id || null;
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) {
      const fallback = await prisma.masjid.findFirst();
      masjidId = fallback?.id || null;
    }

    if (!masjidId) return NextResponse.json({ error: "No assigned Masjid found." }, { status: 400 });

    const document = await prisma.masjidDocument.create({
      data: {
        masjidId,
        title,
        fileUrl: fileUrl || "https://pdfobject.com/pdf/sample.pdf",
        type: type || "Waqf Certificate",
        visibility: visibility || "PUBLIC",
        status: "VERIFIED",
        uploadedBy: user.name,
        description,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create document." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, visibility, title } = body;

    const document = await prisma.masjidDocument.update({
      where: { id },
      data: {
        ...(visibility ? { visibility } : {}),
        ...(title ? { title } : {}),
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update document." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // STRICT GOVERNANCE RULE: Only Super Admin can delete legal documents
    if (user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin is authorized to delete uploaded documents." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Document ID required." }, { status: 400 });

    await prisma.masjidDocument.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
  }
}
