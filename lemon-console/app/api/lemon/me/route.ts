import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, refreshAccessToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_LEMON_API_BASE_URL;

    if (!apiBaseUrl) {
      return NextResponse.json(
        { success: false, error: { message: "API base URL not configured" } },
        { status: 500 }
      );
    }

    let accessToken = await getAccessToken();

    // If no access token, try to refresh
    if (!accessToken) {
      const tokens = await refreshAccessToken();
      if (!tokens) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Not authenticated" },
          },
          { status: 401 }
        );
      }
      accessToken = tokens.accessToken;
    }

    const response = await fetch(`${apiBaseUrl}/api/v1/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    // If 401, try to refresh once
    if (response.status === 401) {
      const tokens = await refreshAccessToken();
      if (!tokens) {
        return NextResponse.json(data, { status: 401 });
      }

      // Retry with new access token
      const retryResponse = await fetch(`${apiBaseUrl}/api/v1/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      const retryData = await retryResponse.json();
      return NextResponse.json(retryData, { status: retryResponse.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to connect to Lemon API" } },
      { status: 503 }
    );
  }
}
