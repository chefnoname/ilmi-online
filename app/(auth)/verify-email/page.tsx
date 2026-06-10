import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Verify Your Email" };

export default function VerifyEmailPage() {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-pill bg-brand-green/15">
        <MailCheck className="h-7 w-7 text-brand-forest" />
      </div>
      <h1 className="display-sub text-xl text-brand-carbon">Confirm your email</h1>
      <p className="text-sm text-muted-foreground">
        We&apos;ve sent a verification link to your inbox. Click it to activate your account, then log in.
      </p>
      <Button asChild variant="outline" className="w-full">
        <Link href="/login">Go to log in</Link>
      </Button>
    </div>
  );
}
