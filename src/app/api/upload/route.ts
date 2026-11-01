import { NextResponse } from "next/server";
import { storageService } from "@/lib/storage";
import { getAuthenticatedUser } from "@/lib/auth";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 25MB limit." }, { status: 400 });
    }

    const uploadResult = await storageService.uploadImage(file, file.name);

    return NextResponse.json({
      message: "File uploaded successfully",
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    });
  } catch (error: any) {
    console.error("Upload route error:", error);
    return NextResponse.json({ error: "An unexpected error occurred during file upload." }, { status: 500 });
  }
}
