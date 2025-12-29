import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_LEMON_API_BASE_URL;

    if (!apiBaseUrl) {
      return NextResponse.json(
        { success: false, error: { message: "API base URL not configured" } },
        { status: 500 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${apiBaseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Create response with auth cookies
    const nextResponse = NextResponse.json(
      { success: true, user: data.user },
      { status: 200 }
    );

    // Store tokens in httpOnly cookies
    if (data.accessToken && data.refreshToken) {
      setAuthCookies(nextResponse, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to connect to Lemon API" } },
      { status: 503 }
    );
  }
}
