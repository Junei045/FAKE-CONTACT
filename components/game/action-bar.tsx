"use client"

import { ShieldCheck, TriangleAlert, Ban } from "lucide-react"
import type { ActionType } from "@/lib/types"
import { playSfx, unlockAudio } from "@/lib/sfx"

const BUTTONS: {
  action: ActionType
  label: string
  icon: React.ReactNode
  cls: string
}[] = [
  {
    action: "trust",
    label: "信頼する",
    icon: <ShieldCheck className="size-5" aria-hidden />,
    cls: "border-safe/40 bg-safe/10 text-safe hover:bg-safe/15 active:bg-safe/20",
  },
  {
    action: "suspicious",
    label: "怪しい",
    icon: <TriangleAlert className="size-5" aria-hidden />,
    cls: "border-warn/40 bg-warn/10 text-warn hover:bg-warn/15 active:bg-warn/20",
  },
  {
    action: "block",
    label: "ブロック・通報",
    icon: <Ban className="size-5" aria-hidden />,
    cls: "border-danger/40 bg-danger/10 text-danger hover:bg-danger/15 active:bg-danger/20",
  },
]

export function ActionBar({ onAction }: { onAction: (a: ActionType) => void }) {
  return (
    <div className="z-20 border-t border-border bg-card/95 px-4 pb-6 pt-3 backdrop-blur">
      <p className="mb-2.5 text-center text-xs text-muted-foreground">
        じっくり観察してから、対応を選ぼう
      </p>
      <div className="grid grid-cols-3 gap-2">
        {BUTTONS.map((b) => (
          <button
            key={b.action}
            type="button"
            onClick={() => {
              unlockAudio()
              // 3つの選択肢は音の高さが違うので、目を離していても押した先が分かる
              playSfx(b.action)
              onAction(b.action)
            }}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3.5 text-xs font-bold transition-transform active:scale-[0.96] ${b.cls}`}
          >
            {b.icon}
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}
