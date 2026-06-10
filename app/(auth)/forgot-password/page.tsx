import Link from "next/link";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Reset Password" };

export default function ForgotPasswordPage({ searchParams }: { searchParams: { sent?: string } }) {
  if (searchParams.sent) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="display-sub text-xl text-brand-carbon">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, a reset link is on its way.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to log in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-sub text-xl text-brand-carbon">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a secure reset link.
        </p>
      </div>
      <form action={requestPasswordReset} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        <Button type="submit" variant="cta" className="w-full">
          Send Reset Link
        </Button>
      </form>
      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-brand-forest hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
