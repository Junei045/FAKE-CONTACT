"use client"

import type { ReactNode } from "react"
import { Signal, Wifi, BatteryFull } from "lucide-react"

/**
 * スマホ実機風のフレーム。縦画面固定（375px基準）で中身をスクロールさせる。
 * 大画面ではデバイス枠を表示し、モバイルでは画面いっぱいに広げる。
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-0 sm:p-6">
      <div className="relative flex h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-card shadow-2xl sm:h-[812px] sm:rounded-[2.75rem] sm:border-8 sm:border-[oklch(0.12_0.02_279)] sm:ring-1 sm:ring-white/10">
        {/* ステータスバー（時刻・電波・電池） */}
        <div className="relative z-30 flex items-center justify-between bg-card/95 px-6 pt-3 pb-1 text-[13px] font-medium text-foreground backdrop-blur">
          <span className="font-mono tracking-tight">20:30</span>
          <div className="pointer-events-none absolute left-1/2 top-2 hidden h-6 w-28 -translate-x-1/2 rounded-full bg-[oklch(0.1_0.02_279)] sm:block" />
          <div className="flex items-center gap-1.5">
            <Signal className="size-3.5" aria-hidden />
            <Wifi className="size-3.5" aria-hidden />
            <BatteryFull className="size-4" aria-hidden />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
