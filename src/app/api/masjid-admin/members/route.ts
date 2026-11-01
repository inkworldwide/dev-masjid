import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

// In-memory store for community members per masjid
let memberStore: Record<string, any[]> = {};

function getInitialMembers(masjidName: string = "Masjid") {
  return [
    {
      id: "MEM-1001",
      name: "Al-Hajj Mohsin Khan",
      phone: "+91 98765 43210",
      email: "mohsin.khan@gmail.com",
      address: "House #12, Near Main Bazaar, Nagwara",
      membershipType: "PATRON", // PATRON | VOLUNTEER | MONTHLY_DONOR | GENERAL
      role: "Senior Committee Member",
      status: "ACTIVE",
      joinedDate: "2024-01-15",
      monthlyContribution: "₹ 5,000",
      notes: "Coordinates Friday Wudu arrangements & Senior Citizen Assistance.",
    },
    {
      id: "MEM-1002",
      name: "Syed Abdul Rahman",
      phone: "+91 99887 76655",
      email: "abdul.rahman@outlook.com",
      address: "Flat 4B, Emerald Residency, Mosque Road",
      membershipType: "VOLUNTEER",
      role: "Youth Volunteer Head",
      status: "ACTIVE",
      joinedDate: "2024-03-10",
      monthlyContribution: "₹ 1,500",
      notes: "Leads Weekend Youth Halaqah & Madrasa Distribution.",
    },
    {
      id: "MEM-1003",
      name: "Tariq Mahmood",
      phone: "+91 98450 11223",
      email: "tariq.mahmood@yahoo.com",
      address: "Building 88, 2nd Cross, Near Metro Station",
      membershipType: "MONTHLY_DONOR",
      role: "Regular Musalli",
      status: "ACTIVE",
      joinedDate: "2024-05-20",
      monthlyContribution: "₹ 2,500",
      notes: "Automatic monthly donor for Electricity & Maintenance Fund.",
    },
    {
      id: "MEM-1004",
      name: "Farhan Ali",
      phone: "+91 97312 99881",
      email: "farhan.ali@gmail.com",
      address: "House 45, Layout 3, Green Park",
      membershipType: "GENERAL",
      role: "Regular Musalli",
      status: "ACTIVE",
      joinedDate: "2024-08-01",
      monthlyContribution: "₹ 500",
      notes: "Attends Fajr and Isha regularly. Assists in Ramzan Iftar prep.",
    },
    {
      id: "MEM-1005",
      name: "Dr. Danish Ahmed",
      phone: "+91 96112 33445",
      email: "danish.md@clinic.org",
      address: "Doctor Colony, Main Road",
      membershipType: "PATRON",
      role: "Free Health Clinic Volunteer",
      status: "ACTIVE",
      joinedDate: "2024-02-18",
      monthlyContribution: "₹ 10,000",
      notes: "Provides free monthly health checkups for elderly musallis.",
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

    if (!masjidId) return NextResponse.json({ members: [] });

    if (!memberStore[masjidId]) {
      const masjid = await prisma.masjid.findUnique({ where: { id: masjidId } });
      const isDemoMasjid = masjid?.name.includes("Jama Masjid") || masjid?.name.toLowerCase().includes("enam");
      memberStore[masjidId] = isDemoMasjid ? getInitialMembers(masjid?.name) : [];
    }

    return NextResponse.json({
      success: true,
      masjidId,
      members: memberStore[masjidId],
    });
  } catch (err) {
    console.error("Error fetching community members:", err);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      masjidId: targetMasjidId,
      name,
      phone,
      email,
      address,
      membershipType,
      role,
      monthlyContribution,
      notes,
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
    if (!name || !phone) {
      return NextResponse.json({ error: "Name and Phone Number are required" }, { status: 400 });
    }

    if (!memberStore[masjidId]) {
      memberStore[masjidId] = getInitialMembers();
    }

    const newId = `MEM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newMember = {
      id: newId,
      name,
      phone,
      email: email || "",
      address: address || "",
      membershipType: membershipType || "GENERAL",
      role: role || "General Musalli",
      status: "ACTIVE",
      joinedDate: new Date().toISOString().split("T")[0],
      monthlyContribution: monthlyContribution ? `₹ ${monthlyContribution}` : "₹ 0",
      notes: notes || "",
    };

    memberStore[masjidId].unshift(newMember);

    return NextResponse.json({
      success: true,
      member: newMember,
      members: memberStore[masjidId],
    });
  } catch (err) {
    console.error("Error adding community member:", err);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { masjidId: targetMasjidId, id, ...updates } = body;

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
      return NextResponse.json({ error: "Masjid ID and Member ID are required" }, { status: 400 });
    }

    if (memberStore[masjidId]) {
      memberStore[masjidId] = memberStore[masjidId].map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
    }

    return NextResponse.json({
      success: true,
      members: memberStore[masjidId] || [],
    });
  } catch (err) {
    console.error("Error updating member:", err);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
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
      return NextResponse.json({ error: "Masjid ID and Member ID are required" }, { status: 400 });
    }

    if (memberStore[masjidId]) {
      memberStore[masjidId] = memberStore[masjidId].filter((m) => m.id !== id);
    }

    return NextResponse.json({
      success: true,
      members: memberStore[masjidId] || [],
    });
  } catch (err) {
    console.error("Error deleting member:", err);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
