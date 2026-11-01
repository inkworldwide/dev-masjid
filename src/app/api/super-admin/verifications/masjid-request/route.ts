import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { DEFAULT_ENABLED_MODULES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { requestId, action, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: "Request ID and action are required." }, { status: 400 });
    }

    const additionReq = await prisma.masjidAdditionRequest.findUnique({
      where: { id: requestId },
    });

    if (!additionReq) {
      return NextResponse.json({ error: "Masjid addition request not found." }, { status: 404 });
    }

    if (action === "APPROVE") {
      const cityName = additionReq.city.trim();
      const citySlug = cityName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      let city = await prisma.city.findFirst({
        where: {
          OR: [
            { slug: citySlug },
            { name: { equals: cityName, mode: "insensitive" } },
          ],
        },
      });

      if (!city) {
        city = await prisma.city.create({
          data: {
            name: cityName,
            slug: citySlug,
          },
        });
      }

      // Check if a Masjid with this name already exists in this city to prevent duplicates
      let targetMasjid = await prisma.masjid.findFirst({
        where: {
          name: { equals: additionReq.masjidName.trim(), mode: "insensitive" },
          cityId: city.id,
        },
      });

      if (!targetMasjid) {
        const baseSlug = additionReq.masjidName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const masjidSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

        targetMasjid = await prisma.masjid.create({
          data: {
            name: additionReq.masjidName.trim(),
            slug: masjidSlug,
            cityId: city.id,
            address: additionReq.location.trim(),
            location: additionReq.location.trim(),
            plotSize: "1000 Sq Yds",
            contactNumber: additionReq.contactPhone || "",
            description: additionReq.additionalInfo || `Community mosque located in ${cityName}.`,
            status: "VERIFIED",
            coverImage: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&q=80",
            pictures: [],
            facilities: ["Women's Prayer Area", "Wudu Area", "Parking", "Wheelchair Access"],
            pincode: "000000",
            enabledModules: DEFAULT_ENABLED_MODULES,
          },
        });
      } else if (targetMasjid.status !== "VERIFIED") {
        targetMasjid = await prisma.masjid.update({
          where: { id: targetMasjid.id },
          data: { status: "VERIFIED" },
        });
      }

      // Update the addition request
      await prisma.masjidAdditionRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          approvedMasjidId: targetMasjid.id,
          reviewedBy: user.id,
          rejectionReason: null,
        },
      });

      // If user who requested it has no masjid, assign it
      if (additionReq.requestingUserId) {
        const reqUser = await prisma.user.findUnique({
          where: { id: additionReq.requestingUserId },
        });
        if (reqUser && !reqUser.masjidId) {
          await prisma.user.update({
            where: { id: reqUser.id },
            data: { masjidId: targetMasjid.id },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Masjid Addition Request approved and new Masjid created/verified.",
        masjid: targetMasjid,
      });
    } else if (action === "REJECT") {
      await prisma.masjidAdditionRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || "Addition request rejected by Super Admin.",
          reviewedBy: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Masjid Addition Request marked as rejected.",
      });
    } else {
      return NextResponse.json({ error: "Invalid action. Must be APPROVE or REJECT." }, { status: 400 });
    }
  } catch (err) {
    console.error("Error processing masjid addition request:", err);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
    }

    await prisma.masjidAdditionRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Masjid Addition Request deleted successfully." });
  } catch (err) {
    console.error("Error deleting masjid addition request:", err);
    return NextResponse.json({ error: "Failed to delete request." }, { status: 500 });
  }
}
