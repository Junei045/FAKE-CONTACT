import type { ActionType, Judgement, RoundResult, Scenario } from "./types"

/** 反応が速すぎる（落ち着いて確認していない）とみなす秒数のしきい値 */
export const HASTY_SECONDS = 2.5

export function judgeAction(scenario: Scenario, chosen: ActionType): Judgement {
  if (chosen === scenario.correctAction) return "correct"
  // 詐欺コンテンツを「信頼」してしまうのは明確な不正解
  if (scenario.isFraud && chosen === "trust") return "wrong"
  // 本物を疑ってブロック/怪しい扱いにするのも不正解（過剰反応）
  if (!scenario.isFraud) return "wrong"
  // 詐欺を「怪しい/ブロック」で捉えたが理想の対応とは違う → 部分正解
  return "partial"
}

export function roundScore(result: RoundResult): number {
  let base = 0
  if (result.judgement === "correct") base = 100
  else if (result.judgement === "partial") base = 60
  else base = 0

  // 冷静度: 正解でも速すぎると減点（じっくり観察したかを評価）
  if (base > 0 && result.responseSeconds < HASTY_SECONDS) {
    base -= 15
  }
  return base
}

export interface Summary {
  total: number
  maxTotal: number
  percent: number
  rank: "S" | "A" | "B" | "C" | "D"
  correctCount: number
  partialCount: number
  wrongCount: number
  /** 偽物を正しくブロック/怪しい判定できた数 */
  blockedFraud: number
  fraudTotal: number
  hastyCount: number
  avgSeconds: number
  weakCategories: string[]
  weakCheckpoints: number[]
}

export function rankFromPercent(percent: number): Summary["rank"] {
  if (percent >= 90) return "S"
  if (percent >= 75) return "A"
  if (percent >= 60) return "B"
  if (percent >= 45) return "C"
  return "D"
}

export function summarize(results: RoundResult[]): Summary {
  const maxTotal = results.length * 100
  let total = 0
  let correctCount = 0
  let partialCount = 0
  let wrongCount = 0
  let blockedFraud = 0
  let fraudTotal = 0
  let hastyCount = 0
  let seconds = 0
  const weakCategories = new Set<string>()
  const weakCheckpointCount: Record<number, number> = {}

  for (const r of results) {
    total += roundScore(r)
    seconds += r.responseSeconds
    if (r.judgement === "correct") correctCount++
    else if (r.judgement === "partial") partialCount++
    else wrongCount++

    if (r.isFraud) {
      fraudTotal++
      if (r.chosen !== "trust") blockedFraud++
    }
    if (r.judgement !== "correct" && r.responseSeconds < HASTY_SECONDS) hastyCount++

    if (r.judgement !== "correct") {
      weakCategories.add(r.category)
      for (const cp of r.checkpoints) {
        weakCheckpointCount[cp] = (weakCheckpointCount[cp] ?? 0) + 1
      }
    }
  }

  const percent = maxTotal === 0 ? 0 : Math.round((total / maxTotal) * 100)
  const weakCheckpoints = Object.entries(weakCheckpointCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => Number(id))

  return {
    total,
    maxTotal,
    percent,
    rank: rankFromPercent(percent),
    correctCount,
    partialCount,
    wrongCount,
    blockedFraud,
    fraudTotal,
    hastyCount,
    avgSeconds: results.length ? Math.round((seconds / results.length) * 10) / 10 : 0,
    weakCategories: [...weakCategories],
    weakCheckpoints,
  }
}

export function formatCount(n: number): string {
  if (n >= 10000) {
    const man = n / 10000
    return `${Math.round(man * 10) / 10}万`
  }
  return n.toLocaleString("ja-JP")
}

export const RANK_META: Record<Summary["rank"], { label: string; tone: string }> = {
  S: { label: "詐欺を見抜くエキスパート", tone: "safe" },
  A: { label: "かなり鋭い観察眼", tone: "safe" },
  B: { label: "基本はしっかり", tone: "warn" },
  C: { label: "もう少し練習を", tone: "warn" },
  D: { label: "要注意・繰り返し訓練を", tone: "danger" },
}
