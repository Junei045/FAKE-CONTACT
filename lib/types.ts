export type ActionType = "trust" | "suspicious" | "block"

export type Difficulty = "beginner" | "intermediate" | "advanced"

export type Platform = "instaglam" | "liner" | "xtter"

export type Judgement = "correct" | "partial" | "wrong"

export interface Profile {
  displayName: string
  handle: string
  avatar: string
  verified: boolean
  followerCount: number
  followingCount: number
  postCount: number
  /** 表示用のアカウント作成日 (例: "2025年1月") */
  accountCreated: string
  /** アカウント年齢の目安 (例: "作成から23日") */
  accountAge: string
  bio: string
  /** 本物との比較用の正しい表記。存在すればなりすましの手がかり */
  authenticHandle?: string
  authenticNote?: string
}

export interface LinkPreview {
  /** メッセージ内に表示される見かけ上のリンク文字列 */
  displayUrl: string
  /** 展開・検査で判明する実際のドメイン */
  actualDomain: string
  isShortened?: boolean
  suspicious: boolean
  note: string
}

export interface RealCase {
  source: string
  stat: string
}

export interface Scenario {
  id: string
  title: string
  category: string
  difficulty: Difficulty
  platform: Platform
  /** dm: ダイレクトメッセージ / feed: タイムライン投稿・広告 */
  kind: "dm" | "feed"
  isAd?: boolean
  mediaLabel?: string
  profile: Profile
  message: string
  image?: string
  /** 実際に再生する動画ファイル（例: "/content/deepfake.mp4"）。無い場合は image を疑似再生する */
  video?: string
  /** 動画の長さ（秒）。疑似再生の尺、実動画では読み込み前の仮表示に使う */
  videoDurationSec?: number
  /** 映像に不自然なノイズを走らせる（ディープフェイクの兆候の表現） */
  videoGlitch?: boolean
  link?: LinkPreview
  timestamp: string
  isFraud: boolean
  correctAction: ActionType
  /** 関連する7項目チェックポイントのID */
  checkpoints: number[]
  redFlags: string[]
  explanation: string
  /** 見落としがちなポイント */
  tip: string
  realCase?: RealCase
}

export interface Checkpoint {
  id: number
  label: string
  detail: string
}

export interface RoundResult {
  scenarioId: string
  category: string
  chosen: ActionType
  correct: ActionType
  judgement: Judgement
  isFraud: boolean
  /** 反応にかかった秒数 */
  responseSeconds: number
  checkpoints: number[]
}

export const CHECKPOINTS: Checkpoint[] = [
  { id: 1, label: "認証バッジ", detail: "名前の横に正規のバッジがあるか。画像で偽装されていないか。" },
  { id: 2, label: "アカウント名 / ID", detail: "公式のIDと完全に一致するか。1文字違い（o→0など）がないか。" },
  { id: 3, label: "フォロワー / 投稿バランス", detail: "フォロワー数が不自然に少ない、投稿数が極端に少なくないか。" },
  { id: 4, label: "メッセージ内容", detail: "投資・副業勧誘、金銭要求、認証コード要求がないか。" },
  { id: 5, label: "リンク / URL", detail: "ドメインが公式と一致するか。不審なドメイン(.xyz等)でないか。" },
  { id: 6, label: "緊急性 / 限定性", detail: "「残り3名」「今だけ」など冷静な判断を妨げる演出がないか。" },
  { id: 7, label: "プロフィール / 投稿の一貫性", detail: "自己紹介と投稿が矛盾していないか。外部誘導がないか。" },
]

export const ACTION_META: Record<
  ActionType,
  { label: string; short: string; tone: "safe" | "warn" | "danger" }
> = {
  trust: { label: "信頼する", short: "信頼", tone: "safe" },
  suspicious: { label: "怪しい", short: "怪しい", tone: "warn" },
  block: { label: "ブロック・通報", short: "ブロック", tone: "danger" },
}

export const PLATFORM_META: Record<
  Platform,
  { name: string; kind: string; accent: string }
> = {
  instaglam: { name: "Instaglam", kind: "写真SNS", accent: "オレンジピンク系" },
  liner: { name: "LINER", kind: "メッセージ", accent: "グリーン系" },
  xtter: { name: "Xtter", kind: "短文SNS", accent: "モノトーン系" },
}
