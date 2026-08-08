import type { Scenario } from "./types"

/**
 * 1回目のプレイからランダム順にするかどうか。
 * false にすると、1回目は lib/scenarios.ts に書いた順番、2回目以降だけランダムになる。
 */
export const SHUFFLE_FIRST_PLAY = true

/** フィッシャー・イェーツ法。どの並びも等しい確率で出る、偏りのないシャッフル */
export function shuffle<T>(list: readonly T[]): T[] {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * シナリオを並べ替える。
 * 前回と同じ問題から始まると「またこれか」と感じてしまうため、
 * 先頭だけは前回の1問目と重ならないように入れ替える。
 */
export function shuffleScenarios(
  list: readonly Scenario[],
  avoidFirstId?: string,
): Scenario[] {
  const a = shuffle(list)
  if (avoidFirstId && a.length > 1 && a[0].id === avoidFirstId) {
    const j = 1 + Math.floor(Math.random() * (a.length - 1))
    ;[a[0], a[j]] = [a[j], a[0]]
  }
  return a
}
