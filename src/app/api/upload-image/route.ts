import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob;
    const filename = formData.get("filename") as string;

    // 🧠 Validate file presence
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 🧠 Optional: Reject files over 5MB (configurable)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "blink-jewels",
            use_filename: true,
            unique_filename: true, // 💡 Allow Cloudinary to generate unique version
            overwrite: false,      // ✅ Prevent overwriting same name
            transformation: [{ quality: "auto" }, { fetch_format: "auto" }], // ✅ Compression
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary Upload Error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
