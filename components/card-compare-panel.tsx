"use client"

import type { CardResult } from "@/lib/cards"
import { CARD_TERMS } from "@/lib/cards"
import { CardEligibilityChips } from "@/components/card-eligibility-chips"
import { BankBadge } from "@/components/bank-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, GitCompareArrows } from "lucide-react"

interface CardComparePanelProps {
  left: CardResult
  right: CardResult
  /** Format a CardResult's reward in the same string the parent table uses. */
  formatReward: (r: CardResult) => string
}

function CompareColumn({
  result,
  formatReward,
  isHigher,
}: {
  result: CardResult
  formatReward: (r: CardResult) => string
  /** True if this side has the higher effectiveRate — used to subtly emphasise it. */
  isHigher: boolean
}) {
  const terms = CARD_TERMS[result.cardId]

  return (
    <div className={`flex-1 min-w-0 rounded-md border p-3 space-y-3 ${isHigher ? "border-primary/50 bg-primary/5" : "border-border bg-background"}`}>
      <div className="flex items-start gap-2">
        <BankBadge cardId={result.cardId} size="md" />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{result.cardName}</p>
          <p className="text-xs text-muted-foreground truncate">{terms.bank}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className={`text-lg font-bold ${isHigher ? "text-primary" : "text-foreground"}`}>{formatReward(result)}</p>
        <p className="text-xs text-muted-foreground">
          {(result.effectiveRate * 100).toFixed(2)}% · {result.rewardType}
        </p>
      </div>

      <CardEligibilityChips cardId={result.cardId} />

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Key terms</p>
        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
          {terms.keyTerms.map((term, i) => (
            <li key={i}>{term}</li>
          ))}
        </ul>
      </div>

      {terms.redemptionGuide && terms.redemptionGuide.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {terms.rewardCurrency} value
          </p>
          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
            {terms.redemptionGuide.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={terms.tncUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Official T&amp;C
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}

export function CardComparePanel({ left, right, formatReward }: CardComparePanelProps) {
  const leftHigher = left.effectiveRate >= right.effectiveRate

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
          Side-by-side
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <CompareColumn result={left} formatReward={formatReward} isHigher={leftHigher} />
          <CompareColumn result={right} formatReward={formatReward} isHigher={!leftHigher} />
        </div>
      </CardContent>
    </Card>
  )
}
