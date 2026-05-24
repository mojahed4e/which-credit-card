"use client"

import type { CardId } from "@/lib/cards"

interface BadgeSpec {
  abbr: string
  /** Tailwind-friendly hex pair: background and foreground. */
  bg: string
  fg: string
  /** Aria-label for screen readers (full bank name). */
  fullName: string
}

const BADGES: Record<CardId, BadgeSpec> = {
  ADCB_365: { abbr: "ADCB", bg: "#9F1B32", fg: "#FFFFFF", fullName: "Abu Dhabi Commercial Bank" },
  EI_SWITCH: { abbr: "EI", bg: "#005C3C", fg: "#FFD400", fullName: "Emirates Islamic" },
  AJMAN_ULTRACASH: { abbr: "AJB", bg: "#005A2A", fg: "#FFFFFF", fullName: "Ajman Bank" },
  SIB_CASHBACK: { abbr: "SIB", bg: "#0F6E3F", fg: "#FFFFFF", fullName: "Sharjah Islamic Bank" },
  DIB_WALAA: { abbr: "DIB", bg: "#005237", fg: "#FFFFFF", fullName: "Dubai Islamic Bank" },
  CITI_PREMIER: { abbr: "Citi", bg: "#003B70", fg: "#FFFFFF", fullName: "Citibank" },
  FAB_TRAVEL: { abbr: "FAB", bg: "#1E2F5C", fg: "#FFFFFF", fullName: "First Abu Dhabi Bank" },
  DUBAI_FIRST_CASHBACK: { abbr: "DF", bg: "#1A1A1A", fg: "#D4AF37", fullName: "Dubai First" },
}

interface BankBadgeProps {
  cardId: CardId
  /** "sm" ≈ 24px, "md" ≈ 32px, "lg" ≈ 40px. */
  size?: "sm" | "md" | "lg"
}

const SIZE_CLASSES: Record<NonNullable<BankBadgeProps["size"]>, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
}

export function BankBadge({ cardId, size = "md" }: BankBadgeProps) {
  const b = BADGES[cardId]
  return (
    <span
      aria-label={b.fullName}
      role="img"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-tight select-none ${SIZE_CLASSES[size]}`}
      style={{ backgroundColor: b.bg, color: b.fg }}
    >
      {b.abbr}
    </span>
  )
}
