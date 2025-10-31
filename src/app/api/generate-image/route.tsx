import { NextRequest } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs"; // Node.js runtime para permitir fetch y sharp

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title") || "Saladillo Vivo";
    const imageUrl = url.searchParams.get("image") || "";
    const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/77d159f1-0d45-4b01-ba42-c8ca9cbd0d70/47acc550fd7b520146be23b59835d549.png"; // NUEVO LOGO

    // 1️⃣ Descargar imagen de noticia
    let newsImageBuffer: Buffer;
    if (imageUrl) {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error("No se pudo descargar la imagen de la noticia");
      newsImageBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      // Imagen placeholder gris
      newsImageBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: "#444444",
        },
      }).png().toBuffer();
    }

    // 2️⃣ Descargar logo
    const logoRes = await fetch(logoUrl);
    const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

    // 3️⃣ Crear franja para título
    const titleHeight = 180;
    const titleSvg = `
      <svg width="800" height="${titleHeight}">
        <rect width="800" height="${titleHeight}" fill="#003399"/>
        <text x="50%" y="50%" font-size="48" fill="white" font-family="sans-serif" dominant-baseline="middle" text-anchor="middle">${title}</text>
      </svg>
    `;

    // 4️⃣ Franja inferior para logo
    const logoHeight = 120;
    const logoSvg = `
      <svg width="800" height="${logoHeight}">
        <rect width="800" height="${logoHeight}" fill="#6699ff"/>
      </svg>
    `;

    // 5️⃣ Componer imagen final
    const compositeImage = await sharp({
      create: { width: 800, height: 1000, channels: 3, background: "#ffffff" },
    })
      .composite([
        { input: newsImageBuffer, top: 0, left: 0 },
        { input: Buffer.from(titleSvg), top: 600, left: 0 },
        { input: Buffer.from(logoSvg), top: 880, left: 0 },
        { input: logoBuffer, top: 890, left: 320 }, // centrar logo en franja
      ])
      .png()
      .toBuffer();

    return new Response(compositeImage, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (error: any) {
    console.error(error);
    return new Response("Error generando imagen: " + error.message, { status: 500 });
  }
}
