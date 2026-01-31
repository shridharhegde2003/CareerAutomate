// frontend/app/(auth)/login/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Chrome, Github, Mail, Lock, ArrowRight, AlertCircle, ShieldAlert } from "lucide-react";
import { checkSystemControls } from "@/hooks/useSystemControls";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Check for emergency stop
    const checkEmergency = async () => {
      const controls = await checkSystemControls();
      setEmergencyStop(controls.emergencyStop);
      setCheckingStatus(false);
    };
    checkEmergency();
  }, []);

  useEffect(() => {
    const errorMsg = searchParams.get("error");
    if (errorMsg) {
      setError(errorMsg);
      const timer = setTimeout(() => {
        setError("");
        router.replace("/login");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // LOGIC PRESERVED EXACTLY AS BEFORE
  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth/google/login`;
  };

  const handleGitHubSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth/github/login`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store the access token
      sessionStorage.setItem("access_token", data.access_token);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking status
  if (checkingStatus) {
    return (
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Show maintenance page if emergency stop is active
  if (emergencyStop) {
    return (
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-l-4 border-l-red-500">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Service Temporarily Unavailable
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Career Automate is currently undergoing maintenance.
            We apologize for the inconvenience.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please try again later or contact support if this persists.
          </p>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-400">
              🔧 Scheduled Maintenance
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {error && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top-4 duration-500 ease-in-out">
          <Alert variant="destructive" className="shadow-xl border-l-4 border-l-red-500 border-t-0 border-r-0 border-b-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center p-4">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
            <AlertDescription className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="space-y-1 text-center pb-2">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Sign in to continue to your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Buttons - Logic Preserved */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button" // Explicitly type button to prevent form submission
              variant="outline"
              className="h-12 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              onClick={handleGoogleSignIn}
            >
              <Chrome className="h-5 w-5 text-blue-500" />
              <span>Google</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              onClick={handleGitHubSignIn}
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Login Form - Inputs Preserved */}
          <form onSubmit={handleLogin} className="space-y-4">


            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold transition-all shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
            >
              Create account
            </Link>
          </p>
        </CardContent>
      </Card>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

