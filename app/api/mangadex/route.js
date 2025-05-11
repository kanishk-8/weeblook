import { NextResponse } from "next/server";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 }); // cache 60s

async function fetchWithRetry(url, opts = {}, retries = 3, backoff = 1000) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "User-Agent": "WeebLook/1.0.0 (your@email.com)",
    Referer: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };

  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      ...opts,
      headers: { ...headers, ...opts.headers },
    });

    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, backoff * (i + 1)));
      continue;
    }

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  }
  throw new Error("Rate limit exceeded");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";
  const key = request.url;
  if (cache.has(key)) {
    return NextResponse.json(cache.get(key), {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }

  // rebuild query without path
  const q = new URLSearchParams(Object.fromEntries(searchParams.entries()));
  q.delete("path");
  const upstream = `https://api.mangadex.org/${path}?${q.toString()}`;

  const res = await fetchWithRetry(upstream);
  const data = await res.json();

  cache.set(key, data);
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
