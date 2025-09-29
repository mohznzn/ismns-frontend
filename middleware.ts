// racine du projet (à côté de /src)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // protège tout /admin/** par présence du cookie 'sid' uniquement
  if (pathname.startsWith("/admin")) {
    const sid = req.cookies.get("sid");
    if (!sid) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = ""; // clean
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
