"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

interface HealthStatus {
  status: "healthy" | "unhealthy" | "checking" | "error";
  message?: string;
}

export default function HomePage() {
  const [apiHealth, setApiHealth] = useState<HealthStatus>({
    status: "checking",
  });
  const [dbHealth, setDbHealth] = useState<HealthStatus>({
    status: "checking",
  });
  const [baseUrl, setBaseUrl] = useState<string>("");

  useEffect(() => {
    const configuredUrl = process.env.NEXT_PUBLIC_LEMON_API_BASE_URL;

    if (!configuredUrl) {
      setApiHealth({
        status: "error",
        message: "NEXT_PUBLIC_LEMON_API_BASE_URL not configured",
      });
      setDbHealth({ status: "error", message: "Cannot check without API URL" });
      return;
    }

    setBaseUrl(configuredUrl);
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      // Check API health
      const healthRes = await fetch("/api/lemon/health");
      if (healthRes.ok) {
        setApiHealth({ status: "healthy", message: "API is running" });
      } else {
        setApiHealth({
          status: "unhealthy",
          message: `HTTP ${healthRes.status}`,
        });
      }

      // Check database readiness
      const readyRes = await fetch("/api/lemon/ready");
      if (readyRes.ok) {
        setDbHealth({ status: "healthy", message: "Database connected" });
      } else {
        setDbHealth({
          status: "unhealthy",
          message: `HTTP ${readyRes.status}`,
        });
      }
    } catch (error) {
      setApiHealth({ status: "error", message: "Cannot connect to API" });
      setDbHealth({ status: "error", message: "Cannot check database" });
    }
  };

  const StatusIcon = ({ status }: { status: HealthStatus["status"] }) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "unhealthy":
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "checking":
        return (
          <AlertCircle className="h-5 w-5 text-yellow-600 animate-pulse" />
        );
    }
  };

  const allHealthy =
    apiHealth.status === "healthy" && dbHealth.status === "healthy";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img
              src="/logo.png"
              alt="Lemon Console"
              className="w-60 h-60"
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Lemon Console</h1>
          <p className="text-muted-foreground">
            Admin & User Dashboard for Lemon API
          </p>
        </div>

        {/* Backend Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Backend Status</CardTitle>
            <CardDescription>
              Lemon API must be running for this console to work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <StatusIcon status={apiHealth.status} />
                  <div>
                    <p className="font-medium">API Health</p>
                    <p className="text-sm text-muted-foreground">
                      {apiHealth.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <StatusIcon status={dbHealth.status} />
                  <div>
                    <p className="font-medium">Database Connection</p>
                    <p className="text-sm text-muted-foreground">
                      {dbHealth.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Configured API Base URL:
              </p>
              <code className="block p-2 bg-slate-100 dark:bg-slate-800 rounded text-sm break-all">
                {baseUrl || "Not configured"}
              </code>
            </div>

            <Button onClick={checkHealth} variant="outline" className="w-full">
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {!allHealthy && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Setup Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p className="font-medium">
                  To use Lemon Console, you need Lemon API running:
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Clone the Lemon API repository</li>
                  <li>
                    Copy{" "}
                    <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                      .env.prod.example
                    </code>{" "}
                    to{" "}
                    <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                      .env.prod
                    </code>
                  </li>
                  <li>Generate secure secrets (see Lemon API README)</li>
                  <li>
                    Run:{" "}
                    <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">
                      docker compose -f docker-compose.prod.yml up
                    </code>
                  </li>
                  <li>
                    Verify API is accessible at {baseUrl || "configured URL"}
                  </li>
                </ol>
              </div>

              <Button asChild variant="default" className="w-full">
                <a
                  href="https://github.com/Qixpy/Lemon-api"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Lemon API Repository
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {allHealthy && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Lemon API is running. Sign in or create an account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/register">Create Account</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Lemon Console v1.0.0 | Made with Next.js</p>
        </div>
      </div>
    </div>
  );
}
