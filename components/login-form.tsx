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
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Zod schema for login
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const forgotRef = useRef<HTMLInputElement>(null);

  // Hooks must stay here — always at top level
  const {
    handleSubmit: rhfHandleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (showForgot) {
      forgotRef.current?.focus();
    }
  }, [showForgot]);

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [isAuthLoaded, isSignedIn, router]);

  if (!isAuthLoaded || !isSignInLoaded || (isAuthLoaded && isSignedIn)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading authentication state...
      </div>
    );
  }

  const onLoginSubmit = async (data: LoginFormValues) => {
    setError("");
    setForgotMsg("");
    setLoading(true);
    try {
      if (!isSignInLoaded) {
        setError("Clerk sign-in object not loaded.");
        return;
      }
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Signed in successfully");
        router.push("/");
      } else {
        setError("Unexpected sign-in response. Please try again.");
        toast.error("Sign-in failed");
      }
    } catch (err: any) {
      console.error("Clerk sign-in error:", err);
      setError(
        err.errors?.[0]?.message || "Sign-in failed. Check credentials."
      );
      toast.error(err.errors?.[0]?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setForgotMsg("");
    setLoading(true);
    try {
      if (!isSignInLoaded) {
        setError("Clerk sign-in object not loaded.");
        return;
      }
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(err.errors?.[0]?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg("");
    setError("");
    setLoading(true);
    try {
      if (!isSignInLoaded) {
        setForgotMsg("Clerk sign-in object not loaded.");
        toast.error("Clerk sign-in object not loaded.");
        return;
      }
      if (!forgotEmail) {
        setForgotMsg("Please enter your email.");
        toast.error("Please enter your email.");
        return;
      }
      const result = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: forgotEmail,
      });
      if (
        result.status === "needs_first_factor" &&
        result.firstFactorVerification
      ) {
        router.push("/reset-password");
        setForgotMsg("");
        toast.success("Reset code sent to your email");
      } else {
        setForgotMsg("Unexpected reset password status: " + result.status);
        toast.error("Failed to send reset code");
      }
    } catch (err: any) {
      console.error("Reset password error:", err);
      if (err.errors?.[0]?.code === "form_identifier_not_found") {
        setForgotMsg("No user found with that email.");
        toast.error("No user found with that email.");
      } else {
        setForgotMsg(err.errors?.[0]?.message || "Failed to send reset email.");
        toast.error(err.errors?.[0]?.message || "Failed to send reset email.");
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
          <CardTitle className="text-xl">
            {showForgot ? "Reset Password" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {showForgot
              ? "Enter your email to receive a reset code"
              : "Login with your Google account or email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgot ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="forgotEmail">Email</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    ref={forgotRef}
                    disabled={loading}
                  />
                </div>
                {forgotMsg && (
                  <div
                    className={`text-sm ${
                      forgotMsg.includes("sent")
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {forgotMsg}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !forgotEmail}
                >
                  {loading ? "Sending..." : "Send reset code"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-center"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotMsg("");
                    setForgotEmail("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={rhfHandleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <div className="grid gap-6">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                    width="20"
                    height="20"
                    className="mr-2"
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
                  Login with Google
                </Button>
                <div className="text-center text-sm relative after:border-t after:absolute after:top-1/2 after:w-full after:inset-0 z-0">
                  <span className="bg-white px-2 relative z-10">
                    Or continue with
                  </span>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    disabled={loading}
                    {...register("email")}
                  />
                  {errors.email && (
                    <div className="text-red-500 text-xs">
                      {errors.email.message}
                    </div>
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(true);
                        setError("");
                        setEmail("");
                        setPassword("");
                      }}
                      className="text-sm text-blue-600 underline-offset-4 hover:underline"
                      disabled={loading}
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    disabled={loading}
                    {...register("password")}
                  />
                  {errors.password && (
                    <div className="text-red-500 text-xs">
                      {errors.password.message}
                    </div>
                  )}
                </div>
                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <a href="/sign-up" className="underline underline-offset-4">
                    Sign up
                  </a>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
