import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const allowedOrigins = ["https://your-domain.vercel.app", "http://localhost:3000"];
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins.includes(origin)) {
    return new NextResponse("Not allowed", { status: 403 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
