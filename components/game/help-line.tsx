import { Phone } from "lucide-react"
import { cn } from "@/lib/utils"

const CONTACTS = [
  { name: "警察相談専用窓口", tel: "#9110", href: "tel:#9110", note: "特殊詐欺の疑い・相談" },
  { name: "消費者ホットライン", tel: "188", href: "tel:188", note: "消費者トラブル全般" },
]

export function HelpLine({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-secondary/50 p-4",
        className,
      )}
    >
      {!compact && (
        <p className="mb-3 text-sm font-bold text-foreground">
          不安なとき・被害にあったときの相談先
        </p>
      )}
      <div className="grid grid-cols-1 gap-2">
        {CONTACTS.map((c) => (
          <a
            key={c.tel}
            href={c.href}
            className="flex items-center gap-3 rounded-xl bg-card/70 px-3 py-2.5 transition-colors hover:bg-card"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
              <Phone className="size-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{c.name}</span>
              <span className="block text-xs text-muted-foreground">{c.note}</span>
            </span>
            <span className="font-mono text-lg font-bold text-primary">{c.tel}</span>
          </a>
        ))}
      </div>
      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
        偽アカウントや不審なDMは、各SNSの通報機能からも報告できます。
      </p>
    </div>
  )
}
