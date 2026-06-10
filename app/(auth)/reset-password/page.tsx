import { updatePassword } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Choose New Password" };

export default function ResetPasswordPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display-sub text-xl text-brand-carbon">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">You arrived here from a secure email link.</p>
      </div>
      {searchParams.error && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {searchParams.error}
        </p>
      )}
      <form action={updatePassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        <Button type="submit" variant="cta" className="w-full">
          Update Password
        </Button>
      </form>
    </div>
  );
}
