import { NextRequest, NextResponse } from "next/server";

// 简易路由保护（基于是否存在会话 Cookie）
// - 未登录访问 /me 或 /onboarding -> 跳转 /auth
// - 已登录访问 /auth -> 跳转 /home
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("linkup_token")?.value;

  const isAuthed = Boolean(token);
  const isAuthPage = pathname.startsWith("/auth");
  const needsAuth = pathname.startsWith("/me") || pathname.startsWith("/onboarding");

  if (!isAuthed && needsAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  if (isAuthed && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth", "/me", "/onboarding"],
};