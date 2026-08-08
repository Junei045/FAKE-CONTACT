"use client"

import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[85%] overflow-hidden rounded-t-3xl border-t border-border bg-popover shadow-2xl"
        style={{ animation: "sheet-up 0.25s ease-out" }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="grid size-8 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="no-scrollbar max-h-[calc(85vh-3.5rem)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
      <style>{`@keyframes sheet-up{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  )
}
