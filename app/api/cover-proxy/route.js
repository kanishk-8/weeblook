import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mangaId = searchParams.get("mangaId");
  const filename = searchParams.get("filename");

  if (!mangaId || !filename) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  try {
    // Try different quality versions if the requested one fails
    const qualities = [
      ".512.jpg",
      ".512.png",
      ".256.jpg",
      ".256.png",
      ".jpg",
      ".png",
    ];
    let response;
    let imageUrl;

    // Remove any existing extension/quality suffix
    const baseFilename = filename.replace(/\.(jpg|png|\d+)\.(jpg|png)$/, "");

    for (const quality of qualities) {
      imageUrl = `https://uploads.mangadex.org/covers/${mangaId}/${baseFilename}${quality}`;
      response = await fetch(imageUrl);
      if (response.ok) break;
    }

    if (!response?.ok) {
      console.error(`Failed to fetch image: ${imageUrl}`);
      return new NextResponse("Image not found", { status: 404 });
    }

    const buffer = await response.arrayBuffer();
    const headers = {
      "Content-Type": response.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    };

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Failed to fetch image", { status: 500 });
  }
}
