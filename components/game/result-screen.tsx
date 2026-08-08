"use client"

import { CHECKPOINTS, type RoundResult } from "@/lib/types"
import { RANK_META, formatCount, summarize } from "@/lib/game"
import { HelpLine } from "./help-line"
import { RotateCcw, ShieldCheck, Clock, Target } from "lucide-react"
import { playSfx } from "@/lib/sfx"

const toneClass: Record<string, string> = {
  safe: "text-safe",
  warn: "text-warn",
  danger: "text-danger",
}

const toneRing: Record<string, string> = {
  safe: "border-safe/40 bg-safe/10",
  warn: "border-warn/40 bg-warn/10",
  danger: "border-danger/40 bg-danger/10",
}

export function ResultScreen({
  results,
  onRestart,
}: {
  results: RoundResult[]
  onRestart: () => void
}) {
  const s = summarize(results)
  const rank = RANK_META[s.rank]

  return (
    <div className="no-scrollbar flex h-full flex-col overflow-y-auto bg-background">
      {/* ヒーロー: ランク */}
      <div className="flex flex-col items-center px-6 pb-6 pt-10 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          診断結果
        </p>
        <div
          className={`mt-4 flex h-28 w-28 items-center justify-center rounded-full border-2 ${toneRing[rank.tone]}`}
        >
          <span className={`font-mono text-6xl font-bold ${toneClass[rank.tone]}`}>
            {s.rank}
          </span>
        </div>
        <h2 className="mt-4 text-balance text-xl font-bold">{rank.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          スコア {s.total} / {s.maxTotal}（正答率 {s.percent}%）
        </p>
      </div>

      {/* 主要指標 */}
      <div className="grid grid-cols-3 gap-2 px-4">
        <Stat
          icon={<Target className="h-4 w-4" />}
          value={`${s.correctCount}/${results.length}`}
          label="正解"
        />
        <Stat
          icon={<ShieldCheck className="h-4 w-4" />}
          value={`${s.blockedFraud}/${s.fraudTotal}`}
          label="詐欺を回避"
        />
        <Stat
          icon={<Clock className="h-4 w-4" />}
          value={`${s.avgSeconds}秒`}
          label="平均判断"
        />
      </div>

      {/* 落ち着き度の警告 */}
      {s.hastyCount > 0 && (
        <div className="mx-4 mt-4 rounded-xl border border-warn/40 bg-warn/10 p-3 text-sm">
          <span className="font-semibold text-warn">
            {s.hastyCount}件は{" "}
          </span>
          焦って{HASTY_LABEL}判断していました。実際の詐欺は「今すぐ」を装います。まず深呼吸して確認する習慣を。
        </div>
      )}

      {/* 弱点カテゴリ */}
      {s.weakCategories.length > 0 && (
        <section className="mt-6 px-4">
          <h3 className="mb-2 text-sm font-semibold">重点的に対策したい手口</h3>
          <div className="flex flex-wrap gap-2">
            {s.weakCategories.map((c) => (
              <span
                key={c}
                className="rounded-full border border-danger/40 bg-danger/10 px-3 py-1 text-xs font-medium text-danger"
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 弱点チェックポイント */}
      {s.weakCheckpoints.length > 0 && (
        <section className="mt-6 px-4">
          <h3 className="mb-2 text-sm font-semibold">見落としがちな確認項目</h3>
          <ul className="space-y-2">
            {s.weakCheckpoints.map((id) => {
              const cp = CHECKPOINTS.find((c) => c.id === id)
              if (!cp) return null
              return (
                <li
                  key={id}
                  className="rounded-xl border border-border bg-card p-3 text-sm"
                >
                  <p className="font-semibold">
                    {cp.id}. {cp.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {cp.detail}
                  </p>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* 締めのメッセージ */}
      <section className="mt-6 px-4">
        <div className="rounded-xl border border-safe/30 bg-safe/10 p-4 text-sm leading-relaxed">
          <p className="font-semibold text-safe">大切なこと</p>
          <p className="mt-1 text-foreground/90">
            本物そっくりのアカウントでも、認証バッジ・ID・リンク・緊急性を落ち着いて確認すれば見抜けます。
            少しでも怪しいと感じたら、公式アプリや公式サイトから自分でアクセスして確認しましょう。
          </p>
        </div>
      </section>

      <div className="px-4 pt-2 text-center text-[11px] text-muted-foreground">
        累計 {formatCount(s.total)} ポイント獲得
      </div>

      {/* 相談窓口 */}
      <div className="px-4 pt-4">
        <HelpLine />
      </div>

      {/* もう一度 */}
      <div className="sticky bottom-0 mt-4 border-t border-border bg-background/95 p-4 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            playSfx("tap")
            onRestart()
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground transition active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          もう一度チャレンジ（順番はランダム）
        </button>
      </div>
    </div>
  )
}

const HASTY_LABEL = "（2.5秒未満で）"

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-2 py-3 text-center">
      <span className="text-muted-foreground">{icon}</span>
      <span className="font-mono text-base font-bold">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}
