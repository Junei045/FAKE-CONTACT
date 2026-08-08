"use client"

import { ShieldCheck, ScanEye, ChevronRight, Play } from "lucide-react"
import { SCENARIOS } from "@/lib/scenarios"
import { CHECKPOINTS } from "@/lib/types"
import { HelpLine } from "./help-line"
import { SoundToggle } from "./sound-toggle"

const ACTIONS = [
  { label: "信頼する", desc: "本物だと判断", tone: "safe" as const },
  { label: "怪しい", desc: "要確認・保留", tone: "warn" as const },
  { label: "ブロック・通報", desc: "危険と判断", tone: "danger" as const },
]

const toneClass: Record<string, string> = {
  safe: "border-safe/40 text-safe",
  warn: "border-warn/40 text-warn",
  danger: "border-danger/40 text-danger",
}

export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="no-scrollbar flex-1 overflow-y-auto">
      <div className="flex flex-col gap-6 px-5 pb-28 pt-8">
        {/* 効果音の切り替え（右上） */}
        <div className="absolute right-4 top-3 z-10">
          <SoundToggle />
        </div>

        <header className="flex flex-col items-center text-center">
          <span className="mb-4 grid size-16 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <ScanEye className="size-8" aria-hidden />
          </span>
          <p className="text-xs font-bold tracking-[0.3em] text-primary">FAKE CONTACT</p>
          <h1 className="mt-2 text-pretty text-3xl font-black leading-tight text-foreground">
            フェイク・コンタクト
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-balance">
            見抜く力を磨く、SNSなりすまし詐欺 訓練シミュレーター。
            届くDMや広告を観察し、本物と偽物を見分けよう。
          </p>
        </header>

        <div className="grid grid-cols-3 gap-2">
          {ACTIONS.map((a) => (
            <div
              key={a.label}
              className={`rounded-2xl border bg-card/60 p-3 text-center ${toneClass[a.tone]}`}
            >
              <p className="text-sm font-bold">{a.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-border bg-card/60 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden />
            見抜く7つのチェックポイント
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-1.5">
            {CHECKPOINTS.map((c) => (
              <li key={c.id} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <span className="grid size-5 shrink-0 place-items-center rounded-md bg-primary/15 font-mono text-[11px] font-bold text-primary">
                  {c.id}
                </span>
                {c.label}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm">
          <span className="text-muted-foreground">全シナリオ</span>
          <span className="font-bold text-foreground">
            {SCENARIOS.length}問 ・ 約{Math.max(3, Math.round(SCENARIOS.length * 0.7))}分
          </span>
        </div>

        <p className="-mt-3 text-center text-[11px] text-muted-foreground">
          出題の順番は毎回ランダムです。くり返し挑戦すると、順番で覚えずに見抜く力が身につきます。
        </p>

        <div className="rounded-2xl border border-warn/30 bg-warn/10 p-4">
          <p className="text-xs font-bold text-warn">これは訓練用の模擬体験です</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            登場する人物・企業・SNS名（Instaglam / LINER / Xtter）はすべて架空です。
            実在のアカウントやサイトとは関係ありません。ゲーム内で実際の個人情報や認証情報を入力する画面はありません。
          </p>
        </div>

        <HelpLine />
      </div>

      {/* 固定スタートボタン */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-card via-card/95 to-transparent px-5 pb-6 pt-8">
        <button
          type="button"
          onClick={onStart}
          className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
        >
          <Play className="size-5 fill-current" aria-hidden />
          訓練をはじめる
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  )
}
