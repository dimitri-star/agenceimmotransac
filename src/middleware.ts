import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  if (!isLoggedIn && !isAuthPage && req.nextUrl.pathname.startsWith("/")) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(url);
  }
  return undefined;
});

export const config = {
  matcher: ["/dashboard/:path*", "/pipeline/:path*", "/leads/:path*", "/sequences/:path*", "/settings/:path*"],
};
