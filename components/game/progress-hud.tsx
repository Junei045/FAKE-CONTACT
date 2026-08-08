"use client"

import { ScanEye } from "lucide-react"
import { SoundToggle } from "./sound-toggle"

export function ProgressHud({
  index,
  total,
  score,
}: {
  index: number
  total: number
  score: number
}) {
  const pct = Math.round((index / total) * 100)
  return (
    <div className="z-20 border-b border-border bg-card/95 px-5 py-2.5 backdrop-blur">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-foreground">
          <ScanEye className="size-4 text-primary" aria-hidden />
          問題 {Math.min(index + 1, total)} / {total}
        </span>
        <span className="flex items-center gap-2">
          <span className="font-mono font-bold text-primary" aria-label={`現在のスコア ${score}`}>
            {score} pt
          </span>
          <SoundToggle className="size-7" />
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
