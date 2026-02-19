import { Hono } from "hono";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const photosRoutes = new Hono();

const PHOTOS_DIR = join(process.cwd(), "data", "photos");

// Serve photos: GET /api/photos/:filename
photosRoutes.get("/photos/:filename", async (c) => {
  const filename = c.req.param("filename");

  // Sanitize filename to prevent directory traversal
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return c.json({ error: "Invalid filename" }, 400);
  }

  const filePath = join(PHOTOS_DIR, filename);
  if (!existsSync(filePath)) {
    return c.json({ error: "Not found" }, 404);
  }

  const { readFile } = await import("node:fs/promises");
  const data = await readFile(filePath);
  const ext = filename.split(".").pop()?.toLowerCase();
  const contentType =
    ext === "png" ? "image/png" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "application/octet-stream";
  return new Response(data, { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" } });
});

// Upload photo: POST /api/photos (multipart form data)
photosRoutes.post("/photos", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file uploaded" }, 400);
  }

  // Ensure photos directory exists
  if (!existsSync(PHOTOS_DIR)) {
    await mkdir(PHOTOS_DIR, { recursive: true });
  }

  // Use the original filename or generate one
  const ext = file.name?.split(".").pop()?.toLowerCase() ?? "jpg";
  const fileName = body["fileName"] as string || `photo-${Date.now()}.${ext}`;

  // Sanitize
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return c.json({ error: "Invalid filename" }, 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const filePath = join(PHOTOS_DIR, fileName);
  await writeFile(filePath, Buffer.from(arrayBuffer));

  return c.json({ fileName, path: `/api/photos/${fileName}` }, 201);
});
