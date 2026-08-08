"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { playSfx, unlockAudio } from "@/lib/sfx"
import { asset } from "@/lib/base-path"
import { speak, stopSpeaking, warmUpVoices } from "@/lib/speech"
import { AppImage } from "./app-image"

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

export interface SpeechLine {
  /** 再生開始からの秒数 */
  at: number
  text: string
}

/**
 * SNSの動画投稿を再現するプレイヤー。
 *
 * ・src に動画ファイルを渡すと本物の <video> として再生する。
 * ・src が無い場合は poster 画像を動かして「再生している風」に見せる。
 * ・speech を渡すと、端末の読み上げ機能でその台詞をしゃべり、字幕も出る。
 *   動画ファイルが無くても声が出るので、広告としての生々しさが出る。
 * ・glitch を true にすると映像に走査ノイズが走る（ディープフェイクの兆候）。
 */
export function MediaPlayer({
  src,
  poster,
  alt,
  label = "動画",
  durationSec = 14,
  glitch = false,
  speech,
}: {
  src?: string
  poster: string
  alt: string
  label?: string
  durationSec?: number
  glitch?: boolean
  speech?: SpeechLine[]
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef(0)
  // すでにしゃべった台詞の数。巻き戻すと 0 に戻す
  const spokenRef = useRef(0)

  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(durationSec)
  const [soundOff, setSoundOff] = useState(false)
  const [caption, setCaption] = useState<string | null>(null)

  useEffect(() => {
    warmUpVoices()
  }, [])

  // 経過秒数に達した台詞をしゃべる
  const advanceSpeech = useCallback(
    (elapsed: number) => {
      if (!speech || soundOff) return
      while (spokenRef.current < speech.length && speech[spokenRef.current].at <= elapsed) {
        const line = speech[spokenRef.current]
        speak(line.text)
        setCaption(line.text)
        spokenRef.current += 1
      }
    },
    [speech, soundOff],
  )

  // 疑似再生モードの時間経過
  useEffect(() => {
    if (src || !playing) return
    let raf = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      progressRef.current = Math.min(1, progressRef.current + dt / duration)
      setProgress(progressRef.current)
      advanceSpeech(progressRef.current * duration)
      if (progressRef.current >= 1) {
        setPlaying(false)
        setEnded(true)
        return
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [playing, src, duration, advanceSpeech])

  // 画面を離れるときに読み上げを止める（次の問題に声が残らないように）
  useEffect(() => {
    return () => stopSpeaking()
  }, [])

  const toggle = useCallback(() => {
    unlockAudio()
    playSfx("tap")

    if (ended) {
      progressRef.current = 0
      spokenRef.current = 0
      setProgress(0)
      setCaption(null)
      setEnded(false)
      if (src && videoRef.current) {
        videoRef.current.currentTime = 0
        void videoRef.current.play()
      }
      setPlaying(true)
      return
    }

    if (src) {
      const v = videoRef.current
      if (!v) return
      if (v.paused) {
        void v.play()
        setPlaying(true)
      } else {
        v.pause()
        stopSpeaking()
        setPlaying(false)
      }
      return
    }

    setPlaying((p) => {
      if (p) stopSpeaking()
      return !p
    })
  }, [ended, src])

  const toggleSound = useCallback(() => {
    playSfx("tap")
    setSoundOff((prev) => {
      const next = !prev
      if (videoRef.current) videoRef.current.muted = next
      if (next) stopSpeaking()
      return next
    })
  }, [])

  return (
    <div className="relative select-none overflow-hidden bg-black">
      {src ? (
        <video
          ref={videoRef}
          // 素の <video> は basePath が自動で付かないため asset() を通す
          src={asset(src)}
          poster={asset(poster)}
          // playsInline を付けないと iPhone / iPad で勝手に全画面になり、SNSらしさが崩れる
          playsInline
          muted={soundOff}
          preload="metadata"
          className="h-auto w-full"
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration
            if (Number.isFinite(d) && d > 0) setDuration(d)
          }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget
            if (v.duration > 0) setProgress(v.currentTime / v.duration)
            advanceSpeech(v.currentTime)
          }}
          onEnded={() => {
            setPlaying(false)
            setEnded(true)
          }}
        />
      ) : (
        <AppImage
          src={poster || "/placeholder.svg"}
          alt={alt}
          width={480}
          height={300}
          className={`h-auto w-full object-cover ${playing ? "animate-fake-play" : ""}`}
          style={playing ? { animationDuration: `${duration}s` } : undefined}
        />
      )}

      {/* 映像全体がタップ領域。実際のSNSアプリと同じ操作感にする */}
      <button
        type="button"
        onClick={toggle}
        aria-label={ended ? "もう一度再生" : playing ? "一時停止" : "再生"}
        className="absolute inset-0 z-10 grid place-items-center"
      >
        {(!playing || ended) && (
          <span className="grid size-14 place-items-center rounded-full bg-black/55 text-white ring-2 ring-white/70 backdrop-blur-sm">
            {ended ? (
              <RotateCcw className="size-6" aria-hidden />
            ) : (
              <Play className="size-6 translate-x-0.5 fill-current" aria-hidden />
            )}
          </span>
        )}
      </button>

      {/* ディープフェイク特有の違和感を表す走査ノイズ（再生中のみ・控えめ） */}
      {glitch && playing && (
        <span
          className="animate-fake-glitch pointer-events-none absolute inset-x-0 top-0 z-10 mix-blend-overlay"
          aria-hidden
        />
      )}

      {/* 「動画」「広告」などのラベル */}
      <span className="absolute left-2 top-2 z-20 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
        {label}
      </span>

      {/* 字幕 */}
      {caption && playing && (
        <p className="pointer-events-none absolute inset-x-0 bottom-9 z-20 px-3 text-center text-[13px] font-bold leading-snug text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.9)]">
          {caption}
        </p>
      )}

      {/* 再生バー */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-7">
        <span className="font-mono text-[10px] tabular-nums text-white/85">
          {formatTime(progress * duration)} / {formatTime(duration)}
        </span>
        <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
          <span
            className="block h-full rounded-full bg-white"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </span>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundOff ? "動画の音を出す" : "動画を消音する"}
          className="text-white/85 transition-colors hover:text-white"
        >
          {soundOff ? (
            <VolumeX className="size-4" aria-hidden />
          ) : (
            <Volume2 className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  )
}
