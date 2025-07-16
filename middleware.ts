import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// CORS logic as a standalone function
function addCorsHeaders(response: Response, request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    response.headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  return response;
}

// Compose Clerk middleware with CORS
export default clerkMiddleware((auth, request) => {
  // Handle preflight OPTIONS requests for API routes
  if (
    request.method === "OPTIONS" &&
    request.nextUrl.pathname.startsWith("/api")
  ) {
    const response = new Response(null);
    return addCorsHeaders(response, request);
  }

  // For all other requests, just add CORS headers if needed
  const response = NextResponse.next();
  return addCorsHeaders(response, request);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};