"use client"

import type { CardId } from "@/lib/cards"
import { CARD_TERMS } from "@/lib/cards"
import { Wallet, UserCheck, Gauge, Calendar } from "lucide-react"

interface CardEligibilityChipsProps {
  cardId: CardId
  /** When true, render a compact one-line variant (used in dense areas like table footers). */
  compact?: boolean
}

function formatAED(amount: number): string {
  if (amount === 0) return "Free"
  if (Number.isInteger(amount)) return `AED ${amount.toLocaleString()}`
  return `AED ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CardEligibilityChips({ cardId, compact = false }: CardEligibilityChipsProps) {
  const t = CARD_TERMS[cardId]

  const chips: { icon: typeof Wallet; label: string; tooltip?: string }[] = []

  if (t.annualFeeAED !== null) {
    chips.push({
      icon: Wallet,
      label: `Fee: ${formatAED(t.annualFeeAED)}`,
      tooltip: t.annualFeeNote,
    })
  }

  if (t.minMonthlySalaryAED !== null) {
    chips.push({
      icon: UserCheck,
      label: `Salary ≥ ${formatAED(t.minMonthlySalaryAED)}/mo`,
    })
  }

  if (t.monthlyCapAED !== null) {
    chips.push({
      icon: Gauge,
      label: `Cap: ${formatAED(t.monthlyCapAED)}/mo`,
      tooltip: t.monthlyCapNote,
    })
  } else if (t.monthlyCapNote) {
    chips.push({
      icon: Gauge,
      label: "No monthly cap",
      tooltip: t.monthlyCapNote,
    })
  }

  chips.push({
    icon: Calendar,
    label: `Verified ${t.lastVerified}`,
    tooltip: "When we last checked these terms against the bank's site",
  })

  if (chips.length === 0) return null

  return (
    <div className={compact ? "flex flex-wrap items-center gap-1.5" : "flex flex-wrap items-center gap-1.5"}>
      {chips.map((chip, i) => {
        const Icon = chip.icon
        return (
          <span
            key={i}
            title={chip.tooltip}
            className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[11px] leading-none border border-border"
          >
            <Icon className="h-3 w-3" />
            {chip.label}
          </span>
        )
      })}
    </div>
  )
}
