import Link from "next/link";
import { signIn } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Log In" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-sub text-xl text-brand-carbon">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to continue your studies.</p>
      </div>

      {searchParams.error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {searchParams.error}
        </p>
      )}

      <form action={signIn} className="space-y-4">
        <input type="hidden" name="next" value={searchParams.next ?? "/dashboard"} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs font-semibold text-brand-forest hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <Button type="submit" variant="cta" className="w-full">
          Log In
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to Ilmi Online?{" "}
        <Link href="/signup" className="font-semibold text-brand-forest hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
