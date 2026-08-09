"use client"

import { ChevronLeft, MoreHorizontal, Link2, Hand, ScanSearch } from "lucide-react"
import type { Scenario } from "@/lib/types"
import { PLATFORM_META } from "@/lib/types"
import { playSfx } from "@/lib/sfx"
import { AppImage } from "./app-image"
import { VerifiedBadge } from "./verified-badge"
import { MediaPlayer } from "./media-player"

const platformHeader: Record<string, string> = {
  instaglam: "bg-gradient-to-r from-[oklch(0.65_0.19_20)] to-[oklch(0.7_0.16_320)] text-white",
  liner: "bg-[oklch(0.6_0.14_150)] text-white",
  xtter: "bg-[oklch(0.22_0.02_279)] text-foreground",
}

/** 動画として扱うか（動画ファイルがある、またはラベルに「動画」が含まれる） */
function isVideoPost(scenario: Scenario): boolean {
  return Boolean(scenario.video) || Boolean(scenario.mediaLabel?.includes("動画"))
}

export function SnsScreen({
  scenario,
  onOpenProfile,
  onOpenLink,
}: {
  scenario: Scenario
  onOpenProfile: () => void
  onOpenLink: () => void
}) {
  const { profile, platform, kind } = scenario
  const meta = PLATFORM_META[platform]

  // タップ音は入口でまとめて鳴らす（各ボタンに書き足さずに済む）
  const openProfile = () => {
    playSfx("open")
    onOpenProfile()
  }
  const openLink = () => {
    playSfx("open")
    onOpenLink()
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* アプリのヘッダー */}
      <div className={`flex items-center gap-2 px-4 py-2.5 ${platformHeader[platform]}`}>
        {kind === "dm" && <ChevronLeft className="size-5" aria-hidden />}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {kind === "dm" ? (
            <button
              type="button"
              onClick={openProfile}
              className="flex min-w-0 items-center gap-2"
            >
              <AppImage
                src={profile.avatar || "/placeholder.svg"}
                alt=""
                width={28}
                height={28}
                className="size-7 rounded-full object-cover ring-1 ring-white/30"
              />
              <span className="truncate text-sm font-bold">{profile.displayName}</span>
              {profile.verified && <VerifiedBadge className="size-3.5" />}
            </button>
          ) : (
            <span className="text-sm font-black tracking-tight">{meta.name}</span>
          )}
        </div>
        <MoreHorizontal className="size-5" aria-hidden />
      </div>

      {/* 観察ヒント */}
      <div className="flex items-center gap-2 border-b border-border bg-primary/10 px-4 py-2 text-[11px] text-primary">
        <ScanSearch className="size-3.5 shrink-0" aria-hidden />
        <span>アイコン・IDをタップでプロフィール確認、リンクをタップでURL検査。</span>
      </div>

      {/* コンテンツ本体 */}
      <div className="no-scrollbar flex-1 overflow-y-auto bg-card px-4 py-5">
        {kind === "feed" ? (
          <FeedPost scenario={scenario} onOpenProfile={openProfile} onOpenLink={openLink} />
        ) : (
          <DmThread scenario={scenario} onOpenProfile={openProfile} onOpenLink={openLink} />
        )}
      </div>
    </div>
  )
}

function IdButton({
  handle,
  onOpenProfile,
}: {
  handle: string
  onOpenProfile: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpenProfile}
      className="font-mono text-xs text-muted-foreground underline decoration-dotted underline-offset-2"
      aria-label={`@${handle} のプロフィールとIDを確認`}
    >
      @{handle}
    </button>
  )
}

function LinkChip({ scenario, onOpenLink }: { scenario: Scenario; onOpenLink: () => void }) {
  if (!scenario.link) return null
  return (
    <button
      type="button"
      onClick={onOpenLink}
      className="mt-3 flex w-full items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2.5 text-left transition-colors hover:bg-secondary active:bg-secondary"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
        <Link2 className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-xs text-foreground">
          {scenario.link.displayUrl}
        </span>
        <span className="block text-[11px] text-muted-foreground">タップしてURLを検査</span>
      </span>
    </button>
  )
}

/** 投稿・DMに添付された画像や動画 */
function Attachment({ scenario }: { scenario: Scenario }) {
  if (!scenario.image && !scenario.video) return null

  if (isVideoPost(scenario)) {
    return (
      <MediaPlayer
        src={scenario.video}
        poster={scenario.image || "/placeholder.svg"}
        alt={`${scenario.profile.displayName}の投稿動画`}
        label={scenario.mediaLabel || "動画"}
        durationSec={scenario.videoDurationSec ?? 14}
        glitch={scenario.videoGlitch}
        speech={scenario.videoSpeech}
        voiceGender={scenario.videoVoice}
      />
    )
  }

  return (
    <AppImage
      src={scenario.image || "/placeholder.svg"}
      alt={`${scenario.profile.displayName}の投稿画像`}
      width={480}
      height={300}
      className="h-auto w-full object-cover"
    />
  )
}

function DmThread({
  scenario,
  onOpenProfile,
  onOpenLink,
}: {
  scenario: Scenario
  onOpenProfile: () => void
  onOpenLink: () => void
}) {
  const { profile } = scenario
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-[11px] text-muted-foreground">ダイレクトメッセージ</p>
      <div className="flex gap-2.5">
        <button type="button" onClick={onOpenProfile} className="shrink-0 self-end">
          <AppImage
            src={profile.avatar || "/placeholder.svg"}
            alt={`${profile.displayName}のアイコン`}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover ring-1 ring-border"
          />
        </button>
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenProfile}
              className="text-xs font-bold text-foreground"
            >
              {profile.displayName}
            </button>
            {profile.verified && <VerifiedBadge className="size-3" />}
            <IdButton handle={profile.handle} onOpenProfile={onOpenProfile} />
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-secondary px-3.5 py-3">
            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
              {scenario.message}
            </p>
            {(scenario.image || scenario.video) && (
              <div className="mt-3 overflow-hidden rounded-xl">
                <Attachment scenario={scenario} />
              </div>
            )}
            <LinkChip scenario={scenario} onOpenLink={onOpenLink} />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">{scenario.timestamp}</p>
        </div>
      </div>
    </div>
  )
}

function FeedPost({
  scenario,
  onOpenProfile,
  onOpenLink,
}: {
  scenario: Scenario
  onOpenProfile: () => void
  onOpenLink: () => void
}) {
  const { profile } = scenario
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-secondary/40">
      <header className="flex items-center gap-2.5 px-3.5 py-3">
        <button type="button" onClick={onOpenProfile} className="shrink-0">
          <AppImage
            src={profile.avatar || "/placeholder.svg"}
            alt={`${profile.displayName}のアイコン`}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover ring-1 ring-border"
          />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenProfile}
              className="truncate text-sm font-bold text-foreground"
            >
              {profile.displayName}
            </button>
            {profile.verified && <VerifiedBadge className="size-3.5" />}
          </div>
          <IdButton handle={profile.handle} onOpenProfile={onOpenProfile} />
        </div>
        {scenario.mediaLabel && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {scenario.mediaLabel}
          </span>
        )}
      </header>

      {(scenario.image || scenario.video) && <Attachment scenario={scenario} />}

      <div className="px-3.5 py-3">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
          {scenario.message}
        </p>
        <LinkChip scenario={scenario} onOpenLink={onOpenLink} />
        <p className="mt-2.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Hand className="size-3" aria-hidden />
          プロモーション ・ {scenario.timestamp}
        </p>
      </div>
    </article>
  )
}
