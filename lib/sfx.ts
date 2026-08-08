"use client"

/**
 * 効果音エンジン（WebAudio）
 *
 * ・音声ファイルを一切持たず、その場で波形を合成して鳴らす。
 *   → 追加ファイル不要、読み込み待ちゼロ、GitHub Pages でもそのまま動く。
 * ・iPhone / iPad の Safari は「利用者が画面に触れるまで音を鳴らせない」制限がある。
 *   そのため最初のタップで unlockAudio() を呼び、AudioContext を起こしてから使う。
 * ・消音設定は localStorage に保存し、次に開いたときも引き継ぐ。
 */

export type SfxName =
  | "tap" // 汎用のタップ音
  | "start" // 訓練開始
  | "open" // シート・検査画面を開く
  | "close" // 閉じる
  | "next" // 次へ進む
  | "trust" // 「信頼する」を押した
  | "suspicious" // 「怪しい」を押した
  | "block" // 「ブロック・通報」を押した
  | "correct" // 判定：正解
  | "partial" // 判定：惜しい
  | "wrong" // 判定：不正解
  | "result" // 結果画面

const STORAGE_KEY = "fake-contact:muted"

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  return ctx
}

/** 最初のユーザー操作で呼ぶ。iOS / iPadOS で音を出せるようにする */
export function unlockAudio(): void {
  const c = getCtx()
  if (c && c.state === "suspended") void c.resume()
}

export function isMuted(): boolean {
  return muted
}

/** 保存済みの消音設定を読み込む（クライアント側でのみ有効） */
export function loadMuted(): boolean {
  if (typeof window === "undefined") return false
  try {
    muted = window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    muted = false
  }
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0")
  } catch {
    /* プライベートモード等で保存できなくても動作は続ける */
  }
}

interface Note {
  /** 周波数（Hz） */
  freq: number
  /** 鳴り始め（秒、押した瞬間からの相対時間） */
  start: number
  /** 長さ（秒） */
  dur: number
  type?: OscillatorType
  gain?: number
}

function playNotes(notes: Note[]): void {
  if (muted) return
  const c = getCtx()
  if (!c || !master) return
  if (c.state === "suspended") void c.resume()

  const t0 = c.currentTime
  for (const n of notes) {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = n.type ?? "sine"
    osc.frequency.setValueAtTime(n.freq, t0 + n.start)

    // プツッというノイズを避けるため、音量を滑らかに立ち上げ・減衰させる
    const peak = n.gain ?? 0.22
    gain.gain.setValueAtTime(0.0001, t0 + n.start)
    gain.gain.exponentialRampToValueAtTime(peak, t0 + n.start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.start + n.dur)

    osc.connect(gain)
    gain.connect(master)
    osc.start(t0 + n.start)
    osc.stop(t0 + n.start + n.dur + 0.03)
  }
}

const RECIPES: Record<SfxName, Note[]> = {
  tap: [{ freq: 880, start: 0, dur: 0.05, gain: 0.16 }],
  start: [
    { freq: 523, start: 0, dur: 0.1 },
    { freq: 659, start: 0.08, dur: 0.1 },
    { freq: 784, start: 0.16, dur: 0.18 },
  ],
  open: [
    { freq: 520, start: 0, dur: 0.06, gain: 0.14 },
    { freq: 780, start: 0.05, dur: 0.08, gain: 0.14 },
  ],
  close: [
    { freq: 720, start: 0, dur: 0.06, gain: 0.12 },
    { freq: 460, start: 0.05, dur: 0.08, gain: 0.12 },
  ],
  next: [
    { freq: 660, start: 0, dur: 0.07, gain: 0.16 },
    { freq: 880, start: 0.06, dur: 0.1, gain: 0.16 },
  ],
  // 3つの選択肢は音の高さで区別する（高い=信頼 / 中=怪しい / 低い=ブロック）
  trust: [{ freq: 740, start: 0, dur: 0.09, gain: 0.2 }],
  suspicious: [{ freq: 560, start: 0, dur: 0.09, gain: 0.2, type: "triangle" }],
  block: [{ freq: 400, start: 0, dur: 0.11, gain: 0.18, type: "square" }],

  correct: [
    { freq: 784, start: 0, dur: 0.11 },
    { freq: 1046, start: 0.09, dur: 0.22 },
  ],
  partial: [
    { freq: 660, start: 0, dur: 0.1, type: "triangle" },
    { freq: 660, start: 0.13, dur: 0.16, type: "triangle" },
  ],
  wrong: [
    { freq: 233, start: 0, dur: 0.16, type: "sawtooth", gain: 0.16 },
    { freq: 175, start: 0.12, dur: 0.26, type: "sawtooth", gain: 0.16 },
  ],
  result: [
    { freq: 523, start: 0, dur: 0.1 },
    { freq: 659, start: 0.09, dur: 0.1 },
    { freq: 784, start: 0.18, dur: 0.1 },
    { freq: 1046, start: 0.27, dur: 0.3 },
  ],
}

export function playSfx(name: SfxName): void {
  playNotes(RECIPES[name])
}
