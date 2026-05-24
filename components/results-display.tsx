"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { CardId, ComputeResult, PurchaseCategory } from "@/lib/cards"
import { CARD_NAMES, CARD_TERMS } from "@/lib/cards"
import { CardEligibilityChips } from "@/components/card-eligibility-chips"
import { CardComparePanel } from "@/components/card-compare-panel"
import { RealityCheckPanel } from "@/components/reality-check-panel"
import { BankBadge } from "@/components/bank-badge"
import { getRunnerUpReason } from "@/lib/runner-up"
import { Trophy, ExternalLink, FileText, GitCompareArrows, Award } from "lucide-react"

interface ResultsDisplayProps {
  result: ComputeResult
  category: PurchaseCategory
}

export function ResultsDisplay({ result, category }: ResultsDisplayProps) {
  const { bestCard, results } = result
  const runnerUp = results.find((r) => r.cardId !== bestCard?.cardId && r.effectiveRate > 0) ?? null

  const [compareCardId, setCompareCardId] = useState<CardId | null>(null)
  // Reset/default the compare target whenever the best card changes.
  useEffect(() => {
    setCompareCardId(runnerUp ? runnerUp.cardId : null)
  }, [bestCard?.cardId, runnerUp?.cardId])

  const [showCompare, setShowCompare] = useState(false)

  if (results.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No cards are enabled. Please enable at least one card in settings.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!bestCard) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No rewards available for this purchase. Check your card settings or try a different amount.
          </p>
        </CardContent>
      </Card>
    )
  }

  const pointsLabelFor = (cardId: ComputeResult["results"][0]["cardId"]) => {
    switch (cardId) {
      case "CITI_PREMIER":
        return "TY Points"
      case "DIB_WALAA":
        return "Wala'a"
      case "FAB_TRAVEL":
        return "FAB Rewards"
      default:
        return CARD_TERMS[cardId].rewardCurrency
    }
  }

  const formatReward = (r: (typeof results)[0]) => {
    if (r.rawPoints && r.rawPoints > 0) {
      const pointsFormatted = r.rawPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })
      return `AED ${r.rewardValueAED.toFixed(2)} (${pointsFormatted} ${pointsLabelFor(r.cardId)})`
    }
    return `AED ${r.rewardValueAED.toFixed(2)}`
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Best card highlight */}
      <Card className="border-primary bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Best Card
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <BankBadge cardId={bestCard.cardId} size="lg" />
                <p className="text-2xl font-bold">{bestCard.cardName}</p>
              </div>
              <p className="text-lg text-primary">
                {formatReward(bestCard)}{" "}
                <span className="text-sm text-muted-foreground">
                  ({(bestCard.effectiveRate * 100).toFixed(2)}% back)
                </span>
              </p>
              <p className="text-sm text-muted-foreground">{bestCard.rewardType}</p>
              <CardEligibilityChips cardId={bestCard.cardId} />
            </div>

            {/* Key terms summary + official T&C link for the recommended card */}
            <div className="rounded-md border border-primary/20 bg-background/60 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-foreground">Key terms before you swipe</p>
                <a
                  href={CARD_TERMS[bestCard.cardId].tncUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
                >
                  Official T&amp;C
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                {CARD_TERMS[bestCard.cardId].keyTerms.map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
              </ul>
              <p className="text-[11px] text-muted-foreground italic">
                Summary only — always confirm the latest terms on the bank&apos;s site.
              </p>
            </div>

            {/* MCC quirks + redemption guide */}
            <RealityCheckPanel cardId={bestCard.cardId} category={category} />
          </div>
        </CardContent>
      </Card>

      {/* Runner-up alternative */}
      {runnerUp && (() => {
        const reason = getRunnerUpReason(bestCard, runnerUp)
        return (
          <Card className="border-muted">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4 text-muted-foreground" />
                Runner-up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BankBadge cardId={runnerUp.cardId} size="md" />
                    <p className="text-lg font-semibold">{runnerUp.cardName}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatReward(runnerUp)}{" "}
                    <span className="text-xs">({(runnerUp.effectiveRate * 100).toFixed(2)}%)</span>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{reason.headline}</p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCompareCardId(runnerUp.cardId)
                      setShowCompare(true)
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <GitCompareArrows className="h-3 w-3" />
                    Compare side-by-side
                  </button>
                  <a
                    href={CARD_TERMS[runnerUp.cardId].tncUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Official T&amp;C
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Cards</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card</TableHead>
                  <TableHead className="text-right">Reward</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="hidden md:table-cell">Note</TableHead>
                  <TableHead className="text-right">Terms</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.cardId} className={r.cardId === bestCard.cardId ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BankBadge cardId={r.cardId} size="sm" />
                        <span className="truncate">{r.cardName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatReward(r)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{r.rewardType}</TableCell>
                    <TableCell className="text-right">{(r.effectiveRate * 100).toFixed(2)}%</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.note}</TableCell>
                    <TableCell className="text-right">
                      <a
                        href={CARD_TERMS[r.cardId].tncUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        aria-label={`Open ${r.cardName} terms in a new tab`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Compare picker */}
      {results.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
              Compare {bestCard.cardName} with…
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="compare-pick" className="sr-only">
                Pick a card to compare
              </label>
              <select
                id="compare-pick"
                value={compareCardId ?? ""}
                onChange={(e) => {
                  setCompareCardId(e.target.value as CardId)
                  setShowCompare(true)
                }}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="" disabled>
                  Pick a card…
                </option>
                {results
                  .filter((r) => r.cardId !== bestCard.cardId)
                  .map((r) => (
                    <option key={r.cardId} value={r.cardId}>
                      {CARD_NAMES[r.cardId]} — AED {r.rewardValueAED.toFixed(2)}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCompare((v) => !v)}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-md border border-input text-sm hover:bg-accent disabled:opacity-50"
                disabled={!compareCardId}
              >
                {showCompare ? "Hide" : "Show"} comparison
              </button>
            </div>
            {showCompare && compareCardId && (() => {
              const right = results.find((r) => r.cardId === compareCardId)
              if (!right) return null
              return <CardComparePanel left={bestCard} right={right} formatReward={formatReward} />
            })()}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center px-4">
        This is an approximate guide based on public card terms. Actual rewards depend on MCC coding, caps, bank
        policies and whether you meet monthly minimums. Always check your statements.
      </p>
    </div>
  )
}
