"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();

  // State to control which step is shown: 'code' or 'new_password'
  const [step, setStep] = useState<"code" | "new_password" | "initial">(
    "initial"
  );
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(""); // For success messages

  // Effect to determine the initial step based on the signIn resource status
  useEffect(() => {
    if (!isLoaded) return;
    if (!signIn) {
      setError(
        "Password reset flow not initiated. Please start from the login page."
      );
      setStep("initial");
      return;
    }
    const status = signIn.status as string;
    if (
      status === "needs_first_factor" &&
      signIn.firstFactorVerification?.strategy === "reset_password_email_code"
    ) {
      setStep("code");
    } else if (status === "needs_new_password") {
      setStep("new_password");
    } else if (
      status !== "needs_first_factor" &&
      status !== "needs_new_password" &&
      status !== "needs_identifier" &&
      status !== "needs_second_factor"
    ) {
      // For any other unexpected status, redirect or show error
      setError("This password reset link is invalid or expired.");
      setStep("initial");
      setTimeout(() => router.push("/sign-in"), 2000);
    }
  }, [isLoaded, signIn, router]);

  // Handler for submitting the verification code (Step 2)
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isLoaded || !signIn) {
      setError("Clerk not loaded or sign-in resource missing.");
      toast.error("Clerk not loaded or sign-in resource missing.");
      setLoading(false);
      return;
    }

    if (signIn.status !== "needs_first_factor") {
      setError("Incorrect step in the password reset flow.");
      toast.error("Incorrect step in the password reset flow.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code,
      });

      if (result.status === "needs_new_password") {
        setStep("new_password");
        setSuccessMsg("");
        setCode("");
        toast.success("Code verified. Set your new password.");
      } else {
        setError("Verification failed or unexpected status: " + result.status);
        toast.error(
          "Verification failed or unexpected status: " + result.status
        );
        console.error("Clerk code verification unexpected status:", result);
      }
    } catch (err: any) {
      console.error("Clerk code verification error:", err);
      setError(err.errors?.[0]?.message || "Invalid code. Please try again.");
      toast.error(
        err.errors?.[0]?.message || "Invalid code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handler for submitting the new password (Step 3)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isLoaded || !signIn) {
      setError("Clerk not loaded or sign-in resource missing.");
      toast.error("Clerk not loaded or sign-in resource missing.");
      setLoading(false);
      return;
    }

    if (signIn.status !== "needs_new_password") {
      setError("Incorrect step in the password reset flow.");
      toast.error("Incorrect step in the password reset flow.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      toast.error("Please enter a new password.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        setSuccessMsg("Password reset successfully!");
        toast.success("Password reset successfully!");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setError("Password update failed. Unexpected status: " + result.status);
        toast.error(
          "Password update failed. Unexpected status: " + result.status
        );
        console.error("Clerk password update unexpected status:", result);
      }
    } catch (err: any) {
      console.error("Clerk password update error:", err);
      setError(err.errors?.[0]?.message || "Failed to reset password.");
      toast.error(err.errors?.[0]?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (!isLoaded || step === "initial") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // Render message if sign-in resource is not in a state we can handle
  if (
    !signIn ||
    (signIn.status !== "needs_first_factor" &&
      signIn.status !== "needs_new_password")
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Password Reset</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 text-center">
              {error || "This password reset link is invalid or expired."}
            </p>
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => router.push("/sign-in")}>
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center gap-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {step === "code" ? "Verify Code" : "Set New Password"}
          </CardTitle>
          <CardDescription>
            {step === "code"
              ? `Enter the code sent to ${signIn.identifier || "your email"}`
              : "Enter your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMsg && (
            <div className="text-green-600 text-sm text-center mb-4">
              {successMsg}
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}

          {step === "code" && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !code}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}

          {step === "new_password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              {newPassword &&
                confirmPassword &&
                newPassword !== confirmPassword && (
                  <div className="text-red-500 text-xs text-center">
                    Passwords do not match.
                  </div>
                )}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          {!loading && (
            <div className="mt-4 text-center">
              <Button variant="link" onClick={() => router.push("/sign-in")}>
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
