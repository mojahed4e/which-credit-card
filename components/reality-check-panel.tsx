"use client"

import { useState } from "react"
import { AlertTriangle, Coins, ChevronDown, ChevronUp } from "lucide-react"
import type { CardId, PurchaseCategory } from "@/lib/cards"
import { CARD_TERMS } from "@/lib/cards"
import { CATEGORY_OPTIONS } from "@/lib/categories"

interface RealityCheckPanelProps {
  cardId: CardId
  category: PurchaseCategory
}

function CollapsibleSection({
  icon,
  title,
  tone,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode
  title: string
  tone: "warning" | "info"
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const toneClasses =
    tone === "warning"
      ? "border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20"
      : "border-sky-500/30 bg-sky-50/60 dark:bg-sky-950/20"

  return (
    <div className={`rounded-md border ${toneClasses} text-xs`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="shrink-0">{icon}</span>
        <span className="font-medium text-foreground flex-1">{title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && <div className="px-3 pb-3 text-muted-foreground space-y-1.5">{children}</div>}
    </div>
  )
}

export function RealityCheckPanel({ cardId, category }: RealityCheckPanelProps) {
  const categoryOption = CATEGORY_OPTIONS.find((o) => o.value === category)
  const mccQuirks = categoryOption?.mccQuirks ?? []
  const cardTerms = CARD_TERMS[cardId]
  const redemptionGuide = cardTerms.redemptionGuide ?? []

  if (mccQuirks.length === 0 && redemptionGuide.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {mccQuirks.length > 0 && (
        <CollapsibleSection
          icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />}
          title="MCC reality check — your actual cashback may differ"
          tone="warning"
        >
          <p>
            Banks classify merchants by{" "}
            <abbr title="Merchant Category Code — the industry code your bank uses to bucket each swipe">
              MCC code
            </abbr>
            , not by name. Things to know for this category:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {mccQuirks.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {redemptionGuide.length > 0 && (
        <CollapsibleSection
          icon={<Coins className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />}
          title={`What are ${cardTerms.rewardCurrency} worth?`}
          tone="info"
        >
          <ul className="list-disc list-inside space-y-1">
            {redemptionGuide.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="italic">The AED-equivalent shown above uses the rate from your card settings.</p>
        </CollapsibleSection>
      )}
    </div>
  )
}
