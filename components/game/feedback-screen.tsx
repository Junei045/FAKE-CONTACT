"use client"

import { CheckCircle2, XCircle, AlertTriangle, Flag, Lightbulb, BarChart3, ChevronRight } from "lucide-react"
import type { ActionType, Judgement, Scenario } from "@/lib/types"
import { ACTION_META, CHECKPOINTS } from "@/lib/types"

const RESULT_META: Record<
  Judgement,
  { title: string; tone: "safe" | "warn" | "danger"; icon: React.ReactNode }
> = {
  correct: {
    title: "正解！見事に見抜きました",
    tone: "safe",
    icon: <CheckCircle2 className="size-7" aria-hidden />,
  },
  partial: {
    title: "惜しい！方向性は正解です",
    tone: "warn",
    icon: <AlertTriangle className="size-7" aria-hidden />,
  },
  wrong: {
    title: "危険！ここが狙われます",
    tone: "danger",
    icon: <XCircle className="size-7" aria-hidden />,
  },
}

const toneText: Record<string, string> = {
  safe: "text-safe",
  warn: "text-warn",
  danger: "text-danger",
}
const toneBg: Record<string, string> = {
  safe: "bg-safe/10 border-safe/30",
  warn: "bg-warn/10 border-warn/30",
  danger: "bg-danger/10 border-danger/30",
}

export function FeedbackScreen({
  scenario,
  chosen,
  judgement,
  isLast,
  onNext,
}: {
  scenario: Scenario
  chosen: ActionType
  judgement: Judgement
  isLast: boolean
  onNext: () => void
}) {
  const meta = RESULT_META[judgement]
  const relatedCheckpoints = CHECKPOINTS.filter((c) => scenario.checkpoints.includes(c.id))

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-28 pt-6">
        {/* 判定ヘッダー */}
        <div className={`rounded-3xl border p-5 text-center ${toneBg[meta.tone]}`}>
          <span className={`mx-auto grid size-14 place-items-center ${toneText[meta.tone]}`}>
            {meta.icon}
          </span>
          <p className={`mt-1 text-lg font-black ${toneText[meta.tone]}`}>{meta.title}</p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs">
            <span className="rounded-full bg-card/70 px-3 py-1 text-muted-foreground">
              あなた: <span className="font-bold text-foreground">{ACTION_META[chosen].label}</span>
            </span>
            <ChevronRight className="size-3 text-muted-foreground" aria-hidden />
            <span className="rounded-full bg-card/70 px-3 py-1 text-muted-foreground">
              正解:{" "}
              <span className={`font-bold ${toneText[ACTION_META[scenario.correctAction].tone]}`}>
                {ACTION_META[scenario.correctAction].label}
              </span>
            </span>
          </div>
        </div>

        {/* 解説 */}
        <section className="mt-5">
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground">
            この{scenario.isFraud ? "手口" : "内容"}について
          </h3>
          <p className="mt-1.5 text-sm font-semibold text-foreground">{scenario.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{scenario.explanation}</p>
        </section>

        {/* 危険サイン */}
        {scenario.redFlags.length > 0 && (
          <section className="mt-5 rounded-2xl border border-border bg-secondary/40 p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-danger">
              <Flag className="size-4" aria-hidden />
              見抜くべき危険サイン
            </h3>
            <ul className="mt-2.5 space-y-2">
              {scenario.redFlags.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-danger" />
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 見落としがちなポイント */}
        <section className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-xs font-bold text-primary">見落としがちなポイント</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{scenario.tip}</p>
          </div>
        </section>

        {/* 関連チェックポイント */}
        <section className="mt-4">
          <p className="mb-2 text-xs font-bold tracking-wider text-muted-foreground">
            関連するチェックポイント
          </p>
          <div className="flex flex-wrap gap-1.5">
            {relatedCheckpoints.map((c) => (
              <span
                key={c.id}
                className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground"
              >
                <span className="font-mono font-bold text-primary">{c.id}</span>
                {c.label}
              </span>
            ))}
          </div>
        </section>

        {/* 実被害データ */}
        {scenario.realCase && (
          <section className="mt-4 rounded-2xl border border-border bg-card p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <BarChart3 className="size-4" aria-hidden />
              実際の被害データ
            </h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
              {scenario.realCase.stat}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">出典: {scenario.realCase.source}</p>
          </section>
        )}
      </div>

      {/* 次へ */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-card via-card/95 to-transparent px-5 pb-6 pt-8">
        <button
          type="button"
          onClick={onNext}
          className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg transition-transform hover:brightness-110 active:scale-[0.98]"
        >
          {isLast ? "結果を見る" : "次のコンテンツへ"}
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  )
}
