import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("display inline-flex items-baseline gap-1.5 text-xl text-white", className)}>
      ILMI
      <span className="text-brand-yellow">ONLINE</span>
    </Link>
  );
}
