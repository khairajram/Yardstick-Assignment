import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  console.log(token);

  if (!token && req.nextUrl.pathname.startsWith("/notes")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      const res = NextResponse.next();
      res.headers.set("x-user", JSON.stringify(decoded));
      return res;

    } catch {
      
      const res = NextResponse.redirect(new URL("/", req.url));
      res.cookies.delete("token");
      return res;
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/notes/:path*",   
    "/api/notes/:*", 
  ],
};

