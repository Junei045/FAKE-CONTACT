"use client"

import { CalendarClock, Users, ImageIcon, ShieldQuestion } from "lucide-react"
import type { Profile } from "@/lib/types"
import { formatCount } from "@/lib/game"
import { AppImage } from "./app-image"
import { VerifiedBadge } from "./verified-badge"
import { BottomSheet } from "./bottom-sheet"

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-secondary/60 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-base font-bold text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

export function ProfileSheet({
  open,
  onClose,
  profile,
}: {
  open: boolean
  onClose: () => void
  profile: Profile
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="プロフィールを確認">
      <div className="flex flex-col items-center text-center">
        <AppImage
          src={profile.avatar || "/placeholder.svg"}
          alt={`${profile.displayName}のアイコン`}
          width={80}
          height={80}
          className="size-20 rounded-full object-cover ring-2 ring-border"
        />
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-lg font-bold text-foreground">{profile.displayName}</span>
          {profile.verified && <VerifiedBadge />}
        </div>
        <p className="font-mono text-sm text-muted-foreground">@{profile.handle}</p>
        {!profile.verified && (
          <span className="mt-2 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground">
            認証バッジなし
          </span>
        )}
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">{profile.bio}</p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat icon={<Users className="size-4" />} value={formatCount(profile.followerCount)} label="フォロワー" />
        <Stat icon={<Users className="size-4" />} value={formatCount(profile.followingCount)} label="フォロー中" />
        <Stat icon={<ImageIcon className="size-4" />} value={String(profile.postCount)} label="投稿" />
      </div>

      <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-secondary/60 px-4 py-3">
        <CalendarClock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="text-sm text-foreground">
          アカウント作成: {profile.accountCreated}
          <span className="ml-1 text-xs text-muted-foreground">（{profile.accountAge}）</span>
        </span>
      </div>

      {profile.authenticHandle && (
        <div className="mt-3 rounded-2xl border border-warn/30 bg-warn/10 p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold text-warn">
            <ShieldQuestion className="size-4" aria-hidden />
            ID照合ツール
          </p>
          <div className="mt-2 space-y-1.5 font-mono text-sm">
            <p className="text-muted-foreground">
              この相手: <span className="text-danger">@{profile.handle}</span>
            </p>
            <p className="text-muted-foreground">
              登録済み公式: <span className="text-safe">@{profile.authenticHandle}</span>
            </p>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {profile.authenticNote}
          </p>
        </div>
      )}

      {!profile.authenticHandle && profile.authenticNote && (
        <p className="mt-3 rounded-2xl bg-secondary/60 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
          {profile.authenticNote}
        </p>
      )}
    </BottomSheet>
  )
}
