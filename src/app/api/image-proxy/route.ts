import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url);

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";

    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[IMAGE PROXY] Fetch failed", err);
    return new NextResponse(null, { status: 500 });
  }
}
