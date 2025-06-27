"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!isLoaded) return;
      const result = await signUp.create({
        emailAddress: email,
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/";
      } else {
        setError("Unexpected error. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      if (!isLoaded) return;
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      const message = err.errors?.[0]?.message || "Google sign up failed";
      if (
        message.toLowerCase().includes("already exists") ||
        message.toLowerCase().includes("already in use")
      ) {
        setError(
          "An account with this Google account already exists. Please sign in instead."
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen justify-center items-center gap-6",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Sign up with your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-4 bg-white dark:bg-zinc-900 rounded shadow"
          >
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                  width="24"
                  height="24"
                >
                  <path
                    d="M488 261.8c0-17.4-1.6-34-4.6-50.2H249v94.9h134.8c-5.8 31.4-23.7 58-50.4 75.8v62.8h81.4c47.7-44 76-109.2 76-186.3z"
                    fill="#4285F4"
                  />
                  <path
                    d="M249 512c67.2 0 123.6-22.1 164.8-59.8l-81.4-62.8c-22.7 15.2-52 24.2-83.4 24.2-63.8 0-117.8-43-137.3-101.4H29.4v63.4c41.2 81.8 123.2 138 219.6 138z"
                    fill="#34A853"
                  />
                  <path
                    d="M111.7 312.8c-10.8-31.4-10.8-65.3 0-96.7v-63.4H29.4c-41.2 81.8-41.2 178.2 0 260z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M249 88.4c36.3 0 69.2 12 94.8 32.7l70.4-70.4C378.6 28.7 314.8 0 249 0 152.6 0 70.6 56.2 29.4 138L126 199.6c19.5-58.4 73.5-101.4 137-101.4z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/sign-in" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By signing up, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
