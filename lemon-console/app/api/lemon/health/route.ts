import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_LEMON_API_BASE_URL;

    if (!apiBaseUrl) {
      return NextResponse.json(
        { success: false, error: "API base URL not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiBaseUrl}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to connect to Lemon API" },
      { status: 503 }
    );
  }
}
