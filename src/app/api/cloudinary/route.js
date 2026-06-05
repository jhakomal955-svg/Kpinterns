import { uploadToCloudinary, uploadBufferToCloudinary } from "@/lib/cloudinary";

export const maxDuration = 300; // 5 minutes execution duration limit

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file || typeof file === "string") {
        return Response.json({ error: "File is required" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await uploadBufferToCloudinary(buffer, {
        resource_type: "auto",
      });

      return Response.json({ success: true, data: result }, { status: 200 });
    }

    const body = await request.json();
    if (!body.fileUri) {
      return Response.json({ error: "fileUri is required" }, { status: 400 });
    }

    const result = await uploadToCloudinary(body.fileUri, {
      resource_type: "auto",
    });
    return Response.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return Response.json(
      { error: "Cloudinary upload failed", details: error.message },
      { status: 500 },
    );
  }
}
