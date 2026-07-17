"use client"

import { useMemo, useState } from "react"
import type { CardId } from "@/lib/cards"
import { CARD_NAMES, CARD_TERMS } from "@/lib/cards"
import type { CardPerk, PerkCategory } from "@/lib/perks"
import { PERK_META, CARD_PERKS, availablePerkCategories, cardsWithPerk, PERKS_VERIFIED_ON } from "@/lib/perks"
import { PerkIcon } from "@/components/perk-icon"
import { BankBadge } from "@/components/bank-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Sparkles, ExternalLink } from "lucide-react"

interface PerksBrowserProps {
  /** Cards the user holds (enabled in settings). */
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

export function PerksBrowser({ enabledCardIds }: PerksBrowserProps) {
  const categories = useMemo(() => availablePerkCategories(enabledCardIds), [enabledCardIds])
  const [active, setActive] = useState<PerkCategory | null>(null)

  // Default to the first available category when the dialog data changes.
  const activeCategory = active && categories.includes(active) ? active : (categories[0] ?? null)

  const groups = useMemo(
    () => (activeCategory ? cardsWithPerk(activeCategory, enabledCardIds) : []),
    [activeCategory, enabledCardIds],
  )

  const totalPerks = useMemo(
    () => enabledCardIds.reduce((sum, id) => sum + CARD_PERKS[id].length, 0),
    [enabledCardIds],
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 h-auto py-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs">Browse card perks</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-modal flex flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 p-4 pb-2">
          <DialogTitle>Card perks</DialogTitle>
          <DialogDescription>
            Which of your cards gets you valet, lounge access, discounts and more. Scoped to the cards you&apos;ve
            enabled.
          </DialogDescription>
        </DialogHeader>

        {totalPerks === 0 ? (
          <div className="px-4 pb-6 text-sm text-muted-foreground">
            No perks recorded for your enabled cards. Enable more cards in settings to compare their benefits.
          </div>
        ) : (
          <>
            {/* Category filter chips: single scrollable row on phones, wrapped on larger screens */}
            <div className="shrink-0 px-4 pb-2">
              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
                {categories.map((cat) => {
                  const isActive = cat === activeCategory
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActive(cat)}
                      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-xs transition-colors ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <PerkIcon category={cat} className="h-3 w-3" />
                      {PERK_META[cat].label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto break-words px-4 pb-4">
              <div className="space-y-3">
                {groups.map(({ cardId, perks }) => (
                  <div key={cardId} className="rounded-md border border-border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <BankBadge cardId={cardId} size="sm" />
                        <span className="text-sm font-semibold truncate">{CARD_NAMES[cardId]}</span>
                      </div>
                      <a
                        href={CARD_TERMS[cardId].tncUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                        aria-label={`Open ${CARD_NAMES[cardId]} terms`}
                      >
                        T&amp;C
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <ul className="space-y-2">
                      {perks.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <PerkIcon category={p.category} className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground">{p.title}</span>
                              <PerkSourceTag perk={p} />
                              {p.confidence === "low" && (
                                <span className="text-[10px] text-amber-600 dark:text-amber-400">unconfirmed</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{p.detail}</p>
                            {p.limit && <p className="text-[11px] text-muted-foreground">Limit: {p.limit}</p>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[11px] text-muted-foreground italic border-t border-border pt-3">
                Perks change often and many are tied to your card&apos;s Visa/Mastercard tier. Confirmed{" "}
                {PERKS_VERIFIED_ON}. Always check the bank&apos;s latest terms.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
