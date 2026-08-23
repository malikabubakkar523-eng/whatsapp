import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Size limit: 25MB
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 25MB limit" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name || "upload";
    const ext = path.extname(originalName) || ".jpg";
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${baseName}${ext}`;
    const fileType = file.type || "application/octet-stream";

    let publicUrl = "";

    // 1. Try writing to public/uploads directory (Works on Node.js / Docker / Localhost)
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
      const filePath = path.join(UPLOADS_DIR, uniqueFileName);
      fs.writeFileSync(filePath, buffer);
      publicUrl = `/uploads/${uniqueFileName}`;
    } catch (fsErr) {
      // 2. If running on Vercel Serverless (Read-only filesystem), fallback to resilient Data URL
      console.warn("Filesystem read-only (Vercel Serverless). Using Base64 Data URL fallback.");
      const base64Data = buffer.toString("base64");
      publicUrl = `data:${fileType};base64,${base64Data}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileType,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
