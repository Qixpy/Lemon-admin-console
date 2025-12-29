import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_LEMON_API_BASE_URL;
    const refreshToken = await getRefreshToken();

    if (!apiBaseUrl) {
      return NextResponse.json(
        { success: false, error: { message: "API base URL not configured" } },
        { status: 500 }
      );
    }

    // Call Lemon API logout if we have a refresh token
    if (refreshToken) {
      try {
        await fetch(`${apiBaseUrl}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Ignore API errors, still clear local cookies
        console.error("API logout failed:", error);
      }
    }

    // Clear cookies regardless of API response
    const response = NextResponse.json({ success: true }, { status: 200 });
    clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ success: true }, { status: 200 });
    clearAuthCookies(response);
    return response;
  }
}
