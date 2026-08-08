"use client"

import { Link2, Globe, ShieldAlert, ShieldCheck } from "lucide-react"
import type { LinkPreview } from "@/lib/types"
import { BottomSheet } from "./bottom-sheet"

export function LinkInspector({
  open,
  onClose,
  link,
}: {
  open: boolean
  onClose: () => void
  link: LinkPreview
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="リンク先を検査">
      <div className="space-y-4">
        <div className="rounded-2xl bg-secondary/60 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Link2 className="size-4" aria-hidden />
            表示されているリンク
          </p>
          <p className="mt-1.5 break-all font-mono text-sm text-foreground">{link.displayUrl}</p>
        </div>

        <div className="flex justify-center text-muted-foreground">
          <span className="text-xs">↓ 実際の転送先を展開</span>
        </div>

        <div
          className={`rounded-2xl border p-4 ${
            link.suspicious ? "border-danger/40 bg-danger/10" : "border-safe/40 bg-safe/10"
          }`}
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Globe className="size-4" aria-hidden />
            実際のドメイン
          </p>
          <p
            className={`mt-1.5 break-all font-mono text-base font-bold ${
              link.suspicious ? "text-danger" : "text-safe"
            }`}
          >
            {link.actualDomain}
          </p>
          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
            {link.suspicious ? (
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
            ) : (
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-safe" aria-hidden />
            )}
            {link.note}
          </p>
        </div>

        <p className="rounded-xl bg-secondary/40 px-3 py-2 text-center text-[11px] text-muted-foreground">
          ※ 訓練用の模擬リンクです。実際には開きません。
        </p>
      </div>
    </BottomSheet>
  )
}
