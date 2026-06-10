import Link from "next/link";
import { signUp } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Sign Up" };

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-sub text-xl text-brand-carbon">Begin your journey</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Free to join. Upgrade any time for full access.
        </p>
      </div>

      {searchParams.error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {searchParams.error}
        </p>
      )}

      <form action={signUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" autoComplete="name" required placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <p className="text-xs text-muted-foreground">At least 8 characters.</p>
        </div>
        <Button type="submit" variant="cta" className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already a student?{" "}
        <Link href="/login" className="font-semibold text-brand-forest hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
