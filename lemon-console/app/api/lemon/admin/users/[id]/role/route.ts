import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, refreshAccessToken, setAuthCookies } from "@/lib/auth";

async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit
): Promise<{
  response: Response;
  newTokens?: { accessToken: string; refreshToken: string };
}> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_LEMON_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("API base URL not configured");
  }

  let accessToken = await getAccessToken();

  if (!accessToken) {
    const tokens = await refreshAccessToken();
    if (!tokens) {
      const response = new Response(
        JSON.stringify({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        }),
        { status: 401 }
      );
      return { response };
    }
    accessToken = tokens.accessToken;
  }

  let response = await fetch(`${apiBaseUrl}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    const tokens = await refreshAccessToken();
    if (!tokens) {
      return { response };
    }

    response = await fetch(`${apiBaseUrl}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    return { response, newTokens: tokens };
  }

  return { response };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { response, newTokens } = await makeAuthenticatedRequest(
      `/api/v1/admin/users/${id}/role`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });

    if (newTokens) {
      setAuthCookies(nextResponse, newTokens);
    }

    return nextResponse;
  } catch (error) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to connect to Lemon API" } },
      { status: 503 }
    );
  }
}
