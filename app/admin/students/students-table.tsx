"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, ShieldCheck, ShieldOff, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sendMagicLink, sendPasswordReset, setStudentAccess } from "./actions";
import { relativeTime } from "@/lib/utils";
import type { AdminStudentRow } from "@/lib/types";

const STATUS_TONES: Record<string, "green" | "yellow" | "outline" | "carbon"> = {
  active: "green",
  trialing: "yellow",
  comped: "carbon",
  inactive: "outline",
};

/** Students table — all mutations go through admin server actions. */
export function StudentsTable({ rows }: { rows: AdminStudentRow[] }) {
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean; message: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function run(id: string, fn: () => Promise<{ ok: boolean; message: string }>) {
    setBusyId(id);
    startTransition(async () => {
      const res = await fn();
      setFeedback({ id, ...res });
      setBusyId(null);
    });
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b bg-muted/60 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Signed up</th>
            <th className="px-4 py-3">Last sign-in</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const comped = row.subscription_status === "comped";
            const busy = busyId === row.id;
            return (
              <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <p className="font-semibold">{row.full_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(row.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {row.last_sign_in_at ? relativeTime(row.last_sign_in_at) : "never"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_TONES[row.subscription_status] ?? "outline"}>
                    {row.subscription_status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={row.role === "admin" ? "yellow" : "outline"}>{row.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      title="Send password reset email"
                      onClick={() => run(row.id, () => sendPasswordReset(row.id))}
                    >
                      <KeyRound className="h-3.5 w-3.5" /> Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      title="Send magic sign-in link"
                      onClick={() => run(row.id, () => sendMagicLink(row.id))}
                    >
                      <Wand2 className="h-3.5 w-3.5" /> Magic link
                    </Button>
                    {comped ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy}
                        title="Set status to inactive"
                        onClick={() => run(row.id, () => setStudentAccess(row.id, "inactive"))}
                      >
                        <ShieldOff className="h-3.5 w-3.5" /> Revoke
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy || row.subscription_status === "active"}
                        title={
                          row.subscription_status === "active"
                            ? "Paying subscriber — manage via Stripe"
                            : "Grant free access (comped)"
                        }
                        onClick={() => run(row.id, () => setStudentAccess(row.id, "comped"))}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Grant free
                      </Button>
                    )}
                    {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  {feedback?.id === row.id && (
                    <p
                      className={`mt-1.5 text-xs font-semibold ${
                        feedback.ok ? "text-brand-forest" : "text-destructive"
                      }`}
                    >
                      {feedback.message}
                    </p>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
