"use client"

/**
 * 端末の読み上げ機能（Web Speech API）で台詞をしゃべらせる。
 * 音声ファイルを持たずに「声」を出せるので、追加ファイル不要でそのまま公開できる。
 *
 * 声の種類は端末ごとに違う。
 *   Windows の Edge … 七海(女) 圭太(男) Ayumi(女) Haruka(女) Ichiro(男) など
 *   iPad / iPhone   … Kyoko(女) Otoya(男) Hattori(男) など
 * そのため「男性の声」「女性の声」を名前から探し、
 * 見つからない端末では声の高さを下げ／上げて近づける。
 */

export type VoiceGender = "male" | "female"

// 端末ごとの表記ゆれ（英語名・日本語名）をまとめて拾う
const MALE_NAMES = ["Keita", "圭太", "Ichiro", "一郎", "Otoya", "オトヤ", "Hattori", "ハットリ", "Daichi", "大地"]
const FEMALE_NAMES = ["Nanami", "七海", "Haruka", "はるか", "Kyoko", "京子", "Ayumi", "あゆみ", "O-ren", "Google 日本語"]

interface Picked {
  voice: SpeechSynthesisVoice | null
  /** 希望した性別の声が実際に見つかったか */
  matched: boolean
}

const cache: Partial<Record<VoiceGender, Picked>> = {}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

function pickVoice(gender: VoiceGender): Picked {
  const cached = cache[gender]
  if (cached) return cached
  if (!isSpeechSupported()) return { voice: null, matched: false }

  const ja = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("ja"))

  if (ja.length === 0) return { voice: null, matched: false }

  const wanted = gender === "male" ? MALE_NAMES : FEMALE_NAMES
  for (const name of wanted) {
    const hit = ja.find((v) => v.name.includes(name))
    if (hit) {
      const result = { voice: hit, matched: true }
      cache[gender] = result
      return result
    }
  }

  // 希望の性別が無い端末（iPad で男性の声が入っていない等）は、
  // 手持ちの声を使い、あとで高さを調整して近づける
  const result = { voice: ja[0], matched: false }
  cache[gender] = result
  return result
}

/** 声の一覧が非同期で読み込まれる端末があるため、事前に呼んでおく */
export function warmUpVoices(): void {
  if (!isSpeechSupported()) return
  pickVoice("male")
  pickVoice("female")
  window.speechSynthesis.addEventListener(
    "voiceschanged",
    () => {
      delete cache.male
      delete cache.female
      pickVoice("male")
      pickVoice("female")
    },
    { once: true },
  )
}

export function speak(text: string, gender: VoiceGender = "female"): void {
  if (!isSpeechSupported()) return

  const { voice, matched } = pickVoice(gender)
  const u = new SpeechSynthesisUtterance(text)
  if (voice) u.voice = voice
  u.lang = "ja-JP"

  if (matched) {
    u.pitch = 1
    u.rate = gender === "male" ? 0.98 : 1.02
  } else {
    // 性別の合う声が無い端末向けの補正。
    // 高さを変えるだけでも、聞いたときの印象はかなり近づく
    u.pitch = gender === "male" ? 0.65 : 1.3
    u.rate = gender === "male" ? 0.95 : 1.05
  }

  window.speechSynthesis.speak(u)
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
}
