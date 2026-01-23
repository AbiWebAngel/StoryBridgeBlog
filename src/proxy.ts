// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Role hierarchy: admin > author > reader
const roleHierarchy = {
  admin: ["admin", "author", "reader"],
  author: ["author", "reader"],
  reader: ["reader"],
};

// Protected routes for each role
const roleProtectedRoutes: Record<string, string[]> = {
  admin: ["/admin"],
  author: ["/author"],
  reader: ["/dashboard"],
};


// Public paths (no auth required)
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
];

// Helper to check if a path matches allowed paths
const hasAccessToPath = (path: string, allowedPaths: string[]) => {
  return allowedPaths.some(
    (allowedPath) =>
      path === allowedPath || path.startsWith(`${allowedPath}/`)
  );
};

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow public paths
  if (publicPaths.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  // Get auth token and role from cookies
  const token = request.cookies.get("auth-token")?.value;
  const userRole = request.cookies.get("user-role")?.value as keyof typeof roleHierarchy;

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Determine current role, default to 'reader'
  const currentRole: keyof typeof roleHierarchy =
    userRole && roleHierarchy[userRole] ? userRole : "reader";

  // Admin bypass: full access
  if (currentRole === "admin") {
    return NextResponse.next();
  }

  // Build allowed paths for non-admins
  const allowedPaths = roleHierarchy[currentRole].flatMap(
    (role) => roleProtectedRoutes[role] || []
  );

  // Ensure dashboard home is included
  if (!allowedPaths.includes("/dashboard")) allowedPaths.push("/dashboard");

  // Check access
  if (!hasAccessToPath(path, allowedPaths)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Only run proxy on protected routes
export const config = {
  matcher: ["/dashboard/:path*", "/author/:path*", "/admin/:path*"],
};
