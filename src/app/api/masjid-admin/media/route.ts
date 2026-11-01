import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

let mediaStore: Record<string, any[]> = {};

function getInitialMedia(masjidName: string = "Masjid") {
  return [
    {
      id: "MED-101",
      title: "Main Prayer Hall & Mihrab",
      category: "PRAYER_HALL", // PRAYER_HALL | EXTERIOR | EVENTS | RAMADAN | CONSTRUCTION | GENERAL
      type: "IMAGE", // IMAGE | VIDEO
      url: "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
      description: "Air-conditioned carpeted main prayer hall capacity 1,500 musallis.",
      dateAdded: "2026-08-01",
      isFeatured: true,
    },
    {
      id: "MED-102",
      title: "Exterior Dome & Minarets View",
      category: "EXTERIOR",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80",
      description: "Front entrance courtyard and grand minaret lit up during evening Maghrib.",
      dateAdded: "2026-08-05",
      isFeatured: true,
    },
    {
      id: "MED-103",
      title: "Annual Quran Competition & Prize Distribution",
      category: "EVENTS",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80",
      description: "Students receiving awards during the Annual Tajweed & Hifz Ceremony.",
      dateAdded: "2026-08-12",
      isFeatured: false,
    },
    {
      id: "MED-104",
      title: "Community Iftar Dastarkhwan",
      category: "RAMADAN",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
      description: "Daily free community Iftar serving over 400 fasting community members.",
      dateAdded: "2026-04-10",
      isFeatured: true,
    },
    {
      id: "MED-105",
      title: "Wudu Area & Solar Water Heater Project",
      category: "CONSTRUCTION",
      type: "IMAGE",
      url: "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=1200&q=80",
      description: "Newly upgraded 60-tap wudu fountain with eco-friendly solar hot water setup.",
      dateAdded: "2026-07-20",
      isFeatured: false,
    },
    {
      id: "MED-106",
      title: "Friday Jummah Khutbah & Prayer Broadcast",
      category: "EVENTS",
      type: "VIDEO",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80",
      description: "Live recording of Friday sermon on Ethics of Mutual Brotherhood.",
      dateAdded: "2026-08-15",
      isFeatured: true,
    },
  ];
}

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const requestedMasjidId = searchParams.get("masjidId");

    let masjidId: string | null = null;
    if (user.role === "SUPER_ADMIN") {
      if (requestedMasjidId && requestedMasjidId !== "ALL") {
        masjidId = requestedMasjidId;
      } else {
        const first = await prisma.masjid.findFirst();
        masjidId = first?.id || null;
      }
    } else {
      const permission = await prisma.masjidAdminPermission.findFirst({
        where: { userId: user.id },
      });
      masjidId = permission?.masjidId || null;
    }

    if (!masjidId) return NextResponse.json({ media: [] });

    const masjid = await prisma.masjid.findUnique({ where: { id: masjidId } });

    if (!mediaStore[masjidId]) {
      const isDemoMasjid = masjid?.name.includes("Jama Masjid") || masjid?.name.toLowerCase().includes("enam");
      if (isDemoMasjid) {
        const initialItems = getInitialMedia(masjid?.name);
        if (masjid?.coverImage) {
          initialItems.unshift({
            id: "MED-COVER",
            title: "Official Masjid Cover Photo",
            category: "EXTERIOR",
            type: "IMAGE",
            url: masjid.coverImage,
            description: "Primary verified photo of the mosque.",
            dateAdded: "2026-01-01",
            isFeatured: true,
          });
        }
        mediaStore[masjidId] = initialItems;
      } else {
        mediaStore[masjidId] = [];
      }
    }

    return NextResponse.json({
      success: true,
      masjidId,
      masjidName: masjid?.name || "Masjid",
      media: mediaStore[masjidId],
    });
  } catch (err) {
    console.error("Error fetching media gallery:", err);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      masjidId: targetMasjidId,
      title,
      category,
      type,
      url,
      description,
      isFeatured,
    } = body;

    let masjidId = targetMasjidId;
    if (!masjidId) {
      if (user.role === "SUPER_ADMIN") {
        const first = await prisma.masjid.findFirst();
        masjidId = first?.id || null;
      } else {
        const permission = await prisma.masjidAdminPermission.findFirst({
          where: { userId: user.id },
        });
        masjidId = permission?.masjidId || null;
      }
    }

    if (!masjidId) return NextResponse.json({ error: "Masjid ID is required" }, { status: 400 });
    if (!title || !url) {
      return NextResponse.json({ error: "Title and Media URL are required" }, { status: 400 });
    }

    if (!mediaStore[masjidId]) {
      mediaStore[masjidId] = getInitialMedia();
    }

    const newId = `MED-${Math.floor(200 + Math.random() * 800)}`;
    const newItem = {
      id: newId,
      title,
      category: category || "GENERAL",
      type: type || "IMAGE",
      url,
      thumbnail: type === "VIDEO" ? "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80" : url,
      description: description || "",
      dateAdded: new Date().toISOString().split("T")[0],
      isFeatured: !!isFeatured,
    };

    mediaStore[masjidId].unshift(newItem);

    return NextResponse.json({
      success: true,
      item: newItem,
      media: mediaStore[masjidId],
    });
  } catch (err) {
    console.error("Error adding media item:", err);
    return NextResponse.json({ error: "Failed to add media item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const targetMasjidId = searchParams.get("masjidId");

    let masjidId = targetMasjidId;
    if (!masjidId) {
      if (user.role === "SUPER_ADMIN") {
        const first = await prisma.masjid.findFirst();
        masjidId = first?.id || null;
      } else {
        const permission = await prisma.masjidAdminPermission.findFirst({
          where: { userId: user.id },
        });
        masjidId = permission?.masjidId || null;
      }
    }

    if (!masjidId || !id) {
      return NextResponse.json({ error: "Masjid ID and Media ID are required" }, { status: 400 });
    }

    if (mediaStore[masjidId]) {
      mediaStore[masjidId] = mediaStore[masjidId].filter((m) => m.id !== id);
    }

    return NextResponse.json({
      success: true,
      media: mediaStore[masjidId] || [],
    });
  } catch (err) {
    console.error("Error deleting media item:", err);
    return NextResponse.json({ error: "Failed to delete media item" }, { status: 500 });
  }
}
