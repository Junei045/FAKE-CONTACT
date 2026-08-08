"use client"

/**
 * 端末の読み上げ機能（Web Speech API）で台詞をしゃべらせる。
 * 音声ファイルを持たずに「声」を出せるので、追加ファイル不要でそのまま公開できる。
 *
 * 声の種類は端末によって異なる（Windows の Edge は七海・圭太、iPad は Kyoko など）。
 * 自然に聞こえるものを優先して選ぶ。
 */

const PREFERRED = ["Nanami", "七海", "Keita", "圭太", "Haruka", "はるか", "Kyoko"]

let cachedVoice: SpeechSynthesisVoice | null = null

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSupported()) return null
  if (cachedVoice) return cachedVoice

  const all = window.speechSynthesis.getVoices()
  const ja = all.filter((v) => v.lang.toLowerCase().startsWith("ja"))
  if (ja.length === 0) return null

  for (const name of PREFERRED) {
    const hit = ja.find((v) => v.name.includes(name))
    if (hit) {
      cachedVoice = hit
      return hit
    }
  }
  cachedVoice = ja[0]
  return cachedVoice
}

/**
 * 声の一覧は非同期で読み込まれる端末がある。
 * 準備できたタイミングで選び直せるよう、事前に呼んでおく。
 */
export function warmUpVoices(): void {
  if (!isSpeechSupported()) return
  pickVoice()
  window.speechSynthesis.addEventListener(
    "voiceschanged",
    () => {
      cachedVoice = null
      pickVoice()
    },
    { once: true },
  )
}

export function speak(text: string, rate = 1.02): void {
  if (!isSpeechSupported()) return
  const u = new SpeechSynthesisUtterance(text)
  const voice = pickVoice()
  if (voice) u.voice = voice
  u.lang = "ja-JP"
  u.rate = rate
  u.pitch = 1
  window.speechSynthesis.speak(u)
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return
  window.speechSynthesis.cancel()
}
