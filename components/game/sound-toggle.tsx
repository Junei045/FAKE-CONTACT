"use client"

import { useEffect, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { loadMuted, playSfx, setMuted, unlockAudio } from "@/lib/sfx"

/**
 * 効果音のオン / オフ。
 * 初期値を false で描画してから useEffect で保存値を読み込むのは、
 * サーバー側で描いた HTML と食い違って React が警告を出すのを避けるため。
 */
export function SoundToggle({ className = "" }: { className?: string }) {
  const [off, setOff] = useState(false)

  useEffect(() => {
    setOff(loadMuted())
  }, [])

  return (
    <button
      type="button"
      onClick={() => {
        const next = !off
        setMuted(next)
        setOff(next)
        if (!next) {
          unlockAudio()
          playSfx("tap")
        }
      }}
      aria-label={off ? "効果音をオンにする" : "効果音をオフにする"}
      aria-pressed={off}
      className={`grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card/70 text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      {off ? (
        <VolumeX className="size-4" aria-hidden />
      ) : (
        <Volume2 className="size-4" aria-hidden />
      )}
    </button>
  )
}
