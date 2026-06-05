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

      const fileName = file.name || "document";
      const fileType = file.type || "";
      const isPdf = fileType.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");

      const uploadOptions = {
        resource_type: "auto",
      };

      if (isPdf) {
        const baseName = fileName.split(".").slice(0, -1).join(".") || "document";
        const cleanName = baseName.replace(/[^a-zA-Z0-9_-]/g, "_");
        uploadOptions.public_id = `${cleanName}_${Date.now()}`; // Do not add .pdf extension here, Cloudinary handles it for image/auto
      }

      const result = await uploadBufferToCloudinary(buffer, uploadOptions);

      return Response.json({ success: true, data: result }, { status: 200 });
    }

    const body = await request.json();
    if (!body.fileUri) {
      return Response.json({ error: "fileUri is required" }, { status: 400 });
    }

    const isPdf = body.fileUri.toLowerCase().endsWith(".pdf") || body.fileUri.includes("data:application/pdf");
    const uploadOptions = {
      resource_type: "auto",
    };

    if (isPdf) {
      let cleanName = "document";
      if (body.fileUri.startsWith("data:")) {
        cleanName = "uploaded_document";
      } else {
        const parts = body.fileUri.split("/");
        const lastPart = parts[parts.length - 1];
        cleanName = lastPart.split(".")[0].replace(/[^a-zA-Z0-9_-]/g, "_") || "document";
      }
      uploadOptions.public_id = `${cleanName}_${Date.now()}`;
    }

    const result = await uploadToCloudinary(body.fileUri, uploadOptions);
    return Response.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return Response.json(
      { error: "Cloudinary upload failed", details: error.message },
      { status: 500 },
    );
  }
}
