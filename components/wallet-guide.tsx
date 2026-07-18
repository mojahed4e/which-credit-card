"use client"

import { useMemo } from "react"
import type { LucideIcon } from "lucide-react"
import {
  Wallet,
  ShoppingCart,
  UtensilsCrossed,
  Bike,
  Fuel,
  ShoppingBag,
  Receipt,
  GraduationCap,
  Plane,
  BedDouble,
  Globe,
  CreditCard,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BankBadge } from "@/components/bank-badge"
import { computeBestCard, type CardId, type CardSettings, type PurchaseInput } from "@/lib/cards"

/** Everyday spend scenarios, using the same channel/location the quick presets assume. */
interface GuideScenario {
  key: string
  label: string
  icon: LucideIcon
  input: Omit<PurchaseInput, "amountAED">
}

const SCENARIOS: GuideScenario[] = [
  { key: "grocery", label: "Groceries", icon: ShoppingCart, input: { category: "grocery", channel: "pos", location: "domestic" } },
  { key: "dining", label: "Dining out", icon: UtensilsCrossed, input: { category: "dining", channel: "pos", location: "domestic" } },
  { key: "delivery", label: "Food delivery", icon: Bike, input: { category: "online_food", channel: "online", location: "domestic" } },
  { key: "fuel", label: "Fuel", icon: Fuel, input: { category: "fuel", channel: "wallet", location: "domestic" } },
  { key: "online", label: "Online shopping", icon: ShoppingBag, input: { category: "online_shopping", channel: "online", location: "domestic" } },
  { key: "bills", label: "Bills & utilities", icon: Receipt, input: { category: "utilities", channel: "online", location: "domestic" } },
  { key: "education", label: "School fees", icon: GraduationCap, input: { category: "education", channel: "online", location: "domestic" } },
  { key: "flights", label: "Flights", icon: Plane, input: { category: "travel_air", channel: "online", location: "international" } },
  { key: "hotels", label: "Hotels", icon: BedDouble, input: { category: "travel_hotel", channel: "online", location: "international" } },
  { key: "abroad", label: "Abroad (FX)", icon: Globe, input: { category: "other", channel: "pos", location: "international" } },
  { key: "other", label: "Everything else", icon: CreditCard, input: { category: "other", channel: "pos", location: "domestic" } },
]

/** Compact names so rows fit on a phone. */
const SHORT_NAMES: Record<CardId, string> = {
  ADCB_365: "ADCB 365",
  EI_SWITCH: "EI SWITCH",
  AJMAN_ULTRACASH: "Ajman ULTRACASH",
  SIB_CASHBACK: "SIB Cashback",
  DIB_WALAA: "DIB Wala'a",
  CITI_PREMIER: "Citi Premier",
  FAB_TRAVEL: "FAB Travel",
  DUBAI_FIRST_CASHBACK: "Dubai First",
  ENBD_DARNA_SIGNATURE: "ENBD Darna",
  ADIB_GOLD_DEBIT: "ADIB Gold Debit",
}

function formatRate(rate: number, isPoints: boolean): string {
  const pct = Number((rate * 100).toFixed(2))
  return `${isPoints ? "≈" : ""}${pct}%`
}

interface WalletGuideProps {
  settings: CardSettings
  /** Called when the user taps a scenario row to see the full breakdown. */
  onPick?: (input: Omit<PurchaseInput, "amountAED">) => void
}

export function WalletGuide({ settings, onPick }: WalletGuideProps) {
  const rows = useMemo(
    () =>
      SCENARIOS.map((scenario) => ({
        scenario,
        best: computeBestCard({ amountAED: 100, ...scenario.input }, settings).bestCard,
      })),
    [settings],
  )

  const anyWinner = rows.some((r) => r.best !== null)

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Your wallet at a glance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          The best of your enabled cards for each kind of spend. Tap a row for the full breakdown.
        </p>
      </CardHeader>
      <CardContent>
        {!anyWinner ? (
          <p className="text-sm text-muted-foreground py-2">
            No earning cards are enabled. Turn cards on in settings to see your guide.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map(({ scenario, best }) => {
              const Icon = scenario.icon
              const inner = (
                <>
                  <span className="flex flex-1 items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm leading-tight">{scenario.label}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    {best ? (
                      <>
                        <BankBadge cardId={best.cardId} size="sm" />
                        <span className="text-sm font-medium truncate max-w-[7.5rem]">
                          {SHORT_NAMES[best.cardId]}
                        </span>
                        <span className="text-sm font-semibold text-primary tabular-nums">
                          {formatRate(best.effectiveRate, best.rewardType === "points")}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">No reward</span>
                    )}
                    {onPick && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                  </span>
                </>
              )

              return (
                <li key={scenario.key}>
                  {onPick ? (
                    <button
                      type="button"
                      onClick={() => onPick(scenario.input)}
                      className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:bg-accent/50 transition-colors rounded-sm px-1 -mx-1"
                      aria-label={`Show full breakdown for ${scenario.label}`}
                    >
                      {inner}
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-3 py-2.5 px-1 -mx-1">{inner}</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          Based on your card settings and each scenario&apos;s typical channel (wallet at the pump, online for bills).
          ≈ marks points cards valued at your chosen rate. Monthly caps and minimum-spend rules still apply — tap a row
          to see them.
        </p>
      </CardContent>
    </Card>
  )
}
