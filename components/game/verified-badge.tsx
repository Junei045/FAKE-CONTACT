import { cn } from "@/lib/utils"

/**
 * 実在SNSの認証バッジを模した、あえて別デザインの自作バッジ（商標回避）。
 */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-4 shrink-0", className)}
      role="img"
      aria-label="認証済みアカウント"
    >
      <path
        fill="var(--color-primary)"
        d="M12 1.5l2.3 1.9 3-.3 1.2 2.8 2.6 1.6-.7 2.9.9 2.9-2.6 1.5-1.1 2.8-3-.4-2.3 2-2.3-2-3 .4-1.1-2.8L1.9 15l.9-2.9-.7-2.9L4.7 5.6 5.9 2.8l3 .3z"
      />
      <path
        fill="none"
        stroke="var(--color-primary-foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.3 12.2l2.4 2.4 4.8-5"
      />
    </svg>
  )
}
