"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ComputeResult } from "@/lib/cards"
import { Trophy } from "lucide-react"

interface ResultsDisplayProps {
  result: ComputeResult
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { bestCard, results } = result

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

  const formatReward = (r: (typeof results)[0]) => {
    if (r.rawPoints && r.rawPoints > 0) {
      const pointsFormatted = r.rawPoints.toLocaleString(undefined, { maximumFractionDigits: 0 })
      const pointsLabel = r.cardId === "CITI_PREMIER" ? "TY Points" : "Wala'a"
      return `AED ${r.rewardValueAED.toFixed(2)} (${pointsFormatted} ${pointsLabel})`
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
          <div className="space-y-1">
            <p className="text-2xl font-bold">{bestCard.cardName}</p>
            <p className="text-lg text-primary">
              {formatReward(bestCard)}{" "}
              <span className="text-sm text-muted-foreground">({(bestCard.effectiveRate * 100).toFixed(2)}% back)</span>
            </p>
            <p className="text-sm text-muted-foreground">{bestCard.rewardType}</p>
          </div>
        </CardContent>
      </Card>

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
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r) => (
                  <TableRow key={r.cardId} className={r.cardId === bestCard.cardId ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">{r.cardName}</TableCell>
                    <TableCell className="text-right">{formatReward(r)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{r.rewardType}</TableCell>
                    <TableCell className="text-right">{(r.effectiveRate * 100).toFixed(2)}%</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{r.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center px-4">
        This is an approximate guide based on public card terms. Actual rewards depend on MCC coding, caps, bank
        policies and whether you meet monthly minimums. Always check your statements.
      </p>
    </div>
  )
}
