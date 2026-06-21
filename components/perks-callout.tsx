"use client"

import type { CardId, PurchaseCategory } from "@/lib/cards"
import { CARD_NAMES } from "@/lib/cards"
import type { CardPerk } from "@/lib/perks"
import { relevantPerksForPurchase, PERKS_VERIFIED_ON } from "@/lib/perks"
import { PerkIcon } from "@/components/perk-icon"
import { BankBadge } from "@/components/bank-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

interface PerksCalloutProps {
  category: PurchaseCategory
  bestCardId: CardId
  /** Cards the user holds (enabled in settings), incl. the best card. */
  enabledCardIds: CardId[]
}

function PerkSourceTag({ perk }: { perk: CardPerk }) {
  const label = perk.source === "network" && perk.requiredTier ? perk.requiredTier : "Bank offer"
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground">
      {label}
    </span>
  )
}

function PerkRow({ perk }: { perk: CardPerk }) {
  return (
    <li className="flex items-start gap-2">
      <PerkIcon category={perk.category} className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">{perk.title}</span>
          <PerkSourceTag perk={perk} />
          {perk.confidence === "low" && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400">unconfirmed</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{perk.detail}</p>
      </div>
    </li>
  )
}

export function PerksCallout({ category, bestCardId, enabledCardIds }: PerksCalloutProps) {
  const bestPerks = relevantPerksForPurchase(bestCardId, category)

  // Other held cards whose perks are relevant to this purchase.
  const otherCards = enabledCardIds
    .filter((id) => id !== bestCardId)
    .map((id) => ({ cardId: id, perks: relevantPerksForPurchase(id, category) }))
    .filter((g) => g.perks.length > 0)

  if (bestPerks.length === 0 && otherCards.length === 0) return null

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Perks that apply to this purchase
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Benefits of <em>owning</em> the card — separate from the cashback above, so they don&apos;t change the
          reward&nbsp;%.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {bestPerks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BankBadge cardId={bestCardId} size="sm" />
              <span className="text-sm font-semibold">{CARD_NAMES[bestCardId]} (your best card here)</span>
            </div>
            <ul className="space-y-2 pl-1">
              {bestPerks.map((p, i) => (
                <PerkRow key={i} perk={p} />
              ))}
            </ul>
          </div>
        )}

        {otherCards.length > 0 && (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Also relevant on your other cards
            </p>
            <ul className="space-y-1.5">
              {otherCards.map(({ cardId, perks }) => (
                <li key={cardId} className="flex items-start gap-2">
                  <BankBadge cardId={cardId} size="sm" />
                  <div className="min-w-0 text-xs">
                    <span className="font-medium text-foreground">{CARD_NAMES[cardId]}</span>
                    <span className="text-muted-foreground">
                      {" — "}
                      {perks.map((p) => p.title).join(" · ")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground italic">
          Perks change often — confirmed {PERKS_VERIFIED_ON}. Always check the bank&apos;s latest terms.
        </p>
      </CardContent>
    </Card>
  )
}
