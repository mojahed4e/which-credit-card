"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"
import type { CardSettings, AjmanCategory, CardId } from "@/lib/cards"
import { CARD_NAMES, CARD_TERMS } from "@/lib/cards"
import { CardEligibilityChips } from "@/components/card-eligibility-chips"
import { BankBadge } from "@/components/bank-badge"
import { ExternalLink } from "lucide-react"

interface CardSettingsPanelProps {
  settings: CardSettings
  onSave: (settings: CardSettings) => void
}

const AJMAN_CATEGORIES: { value: AjmanCategory; label: string }[] = [
  { value: "fuel", label: "Fuel" },
  { value: "supermarket", label: "Supermarket" },
  { value: "online", label: "Online" },
  { value: "school", label: "School fees" },
]

function CardTitleWithTerms({ cardId }: { cardId: CardId }) {
  const terms = CARD_TERMS[cardId]
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <BankBadge cardId={cardId} size="sm" />
        <CardTitle className="text-base truncate">{CARD_NAMES[cardId]}</CardTitle>
        <a
          href={terms.tncUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground hover:underline shrink-0"
          aria-label={`Open official ${CARD_NAMES[cardId]} terms in a new tab`}
          onClick={(e) => e.stopPropagation()}
        >
          T&amp;C
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <CardEligibilityChips cardId={cardId} />
    </div>
  )
}

export function CardSettingsPanel({ settings, onSave }: CardSettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<CardSettings>(settings)
  const [ajmanError, setAjmanError] = useState("")

  useEffect(() => {
    setDraft(settings)
  }, [settings])

  const handleAjmanCategoryToggle = (cat: AjmanCategory) => {
    const current = draft.AJMAN_ULTRACASH.activeCategories
    let updated: AjmanCategory[]

    if (current.includes(cat)) {
      updated = current.filter((c) => c !== cat)
    } else {
      updated = [...current, cat]
    }

    setDraft({
      ...draft,
      AJMAN_ULTRACASH: {
        ...draft.AJMAN_ULTRACASH,
        activeCategories: updated,
      },
    })
  }

  const handleSave = () => {
    if (draft.AJMAN_ULTRACASH.activeCategories.length !== 2) {
      setAjmanError("Please select exactly 2 categories for Ajman ULTRACASH")
      return
    }
    setAjmanError("")
    onSave(draft)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Card settings">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Card Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* ADCB 365 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitleWithTerms cardId="ADCB_365" />
                <Switch
                  checked={draft.ADCB_365.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      ADCB_365: { ...draft.ADCB_365, enabled: checked },
                    })
                  }
                  aria-label="Include ADCB 365"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adcb-minspend"
                  checked={draft.ADCB_365.minSpendMet}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      ADCB_365: { ...draft.ADCB_365, minSpendMet: checked === true },
                    })
                  }
                />
                <Label htmlFor="adcb-minspend" className="text-sm font-normal cursor-pointer">
                  I usually meet the AED 5,000 minimum monthly spend for cashback.
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* EI Switch */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitleWithTerms cardId="EI_SWITCH" />
                <Switch
                  checked={draft.EI_SWITCH.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      EI_SWITCH: { ...draft.EI_SWITCH, enabled: checked },
                    })
                  }
                  aria-label="Include Emirates Islamic SWITCH"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <RadioGroup
                  value={draft.EI_SWITCH.plan}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      EI_SWITCH: { ...draft.EI_SWITCH, plan: v as "lifestyle" | "travel" },
                    })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lifestyle" id="ei-lifestyle" />
                    <Label htmlFor="ei-lifestyle" className="font-normal cursor-pointer">
                      Lifestyle
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="travel" id="ei-travel" />
                    <Label htmlFor="ei-travel" className="font-normal cursor-pointer">
                      Travel
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ei-minspend"
                  checked={draft.EI_SWITCH.minSpendMet}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      EI_SWITCH: { ...draft.EI_SWITCH, minSpendMet: checked === true },
                    })
                  }
                />
                <Label htmlFor="ei-minspend" className="text-sm font-normal cursor-pointer">
                  I usually meet the AED 2,500 minimum monthly spend for cashback.
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Ajman ULTRACASH */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitleWithTerms cardId="AJMAN_ULTRACASH" />
                <Switch
                  checked={draft.AJMAN_ULTRACASH.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      AJMAN_ULTRACASH: { ...draft.AJMAN_ULTRACASH, enabled: checked },
                    })
                  }
                  aria-label="Include Ajman ULTRACASH"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label className="text-sm">Select exactly 2 categories:</Label>
              <div className="grid grid-cols-2 gap-2">
                {AJMAN_CATEGORIES.map((cat) => (
                  <div key={cat.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ajman-${cat.value}`}
                      checked={draft.AJMAN_ULTRACASH.activeCategories.includes(cat.value)}
                      onCheckedChange={() => handleAjmanCategoryToggle(cat.value)}
                    />
                    <Label htmlFor={`ajman-${cat.value}`} className="text-sm font-normal cursor-pointer">
                      {cat.label}
                    </Label>
                  </div>
                ))}
              </div>
              {ajmanError && <p className="text-sm text-destructive">{ajmanError}</p>}
            </CardContent>
          </Card>

          {/* SIB Cashback - removed duplicate card section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitleWithTerms cardId="SIB_CASHBACK" />
                <Switch
                  checked={draft.SIB_CASHBACK.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      SIB_CASHBACK: {
                        ...draft.SIB_CASHBACK,
                        enabled: checked,
                      },
                    })
                  }
                  aria-label="Include SIB Cashback"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                10% online/digital wallet cashback capped at AED 300 per month (this app does not track that cap). No
                minimum spend.
              </p>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="sib-fuel-wallet"
                  checked={draft.SIB_CASHBACK.apply10OnFuelWallet}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      SIB_CASHBACK: {
                        ...draft.SIB_CASHBACK,
                        apply10OnFuelWallet: checked === true,
                      },
                    })
                  }
                />
                <Label htmlFor="sib-fuel-wallet" className="text-sm font-normal cursor-pointer leading-relaxed">
                  Apply 10% on fuel when using Apple / Samsung / Google Pay (wallet).
                  <span className="block text-muted-foreground text-xs mt-1">
                    Conservative default: OFF – treat fuel with wallet as normal retail.
                  </span>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* DIB Wala'a */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitleWithTerms cardId="DIB_WALAA" />
                <Switch
                  checked={draft.DIB_WALAA.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      DIB_WALAA: { ...draft.DIB_WALAA, enabled: checked },
                    })
                  }
                  aria-label="Include DIB Wala'a"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="walaa-value">AED value per Wala'a point (default 0.005)</Label>
                <Input
                  id="walaa-value"
                  type="number"
                  min="0"
                  step="0.001"
                  value={draft.DIB_WALAA.walaaValuePerPointAED}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      DIB_WALAA: {
                        ...draft.DIB_WALAA,
                        walaaValuePerPointAED: Number.parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Citi Premier */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitleWithTerms cardId="CITI_PREMIER" />
                <Switch
                  checked={draft.CITI_PREMIER.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      CITI_PREMIER: { ...draft.CITI_PREMIER, enabled: checked },
                    })
                  }
                  aria-label="Include Citi Premier"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="citi-usd">AED per 1 USD (default 3.67)</Label>
                <Input
                  id="citi-usd"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.CITI_PREMIER.aedPerUsd}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      CITI_PREMIER: {
                        ...draft.CITI_PREMIER,
                        aedPerUsd: Number.parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="citi-points">AED value per ThankYou Point (default ~0.033)</Label>
                <Input
                  id="citi-points"
                  type="number"
                  min="0"
                  step="0.001"
                  value={draft.CITI_PREMIER.tyValuePerPointAED}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      CITI_PREMIER: {
                        ...draft.CITI_PREMIER,
                        tyValuePerPointAED: Number.parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* FAB Travel */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitleWithTerms cardId="FAB_TRAVEL" />
                <Switch
                  checked={draft.FAB_TRAVEL.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      FAB_TRAVEL: { ...draft.FAB_TRAVEL, enabled: checked },
                    })
                  }
                  aria-label="Include FAB Travel"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="fab-minspend"
                  checked={draft.FAB_TRAVEL.minSpendMet}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      FAB_TRAVEL: { ...draft.FAB_TRAVEL, minSpendMet: checked === true },
                    })
                  }
                />
                <Label htmlFor="fab-minspend" className="text-sm font-normal cursor-pointer leading-relaxed">
                  I usually meet the AED 5,000 minimum monthly spend for the 12% travel cashback.
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fab-point-value">AED value per FAB Rewards point — base earn (default 0.00303)</Label>
                <Input
                  id="fab-point-value"
                  type="number"
                  min="0"
                  step="0.001"
                  value={draft.FAB_TRAVEL.fabRewardValuePerPointAED}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      FAB_TRAVEL: {
                        ...draft.FAB_TRAVEL,
                        fabRewardValuePerPointAED: Number.parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  FAB does not publicly disclose the base earn rate. We assume 1 point per AED at your chosen value.
                  The 12% travel rate is fixed and not affected by this setting.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dubai First Cashback */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitleWithTerms cardId="DUBAI_FIRST_CASHBACK" />
                <Switch
                  checked={draft.DUBAI_FIRST_CASHBACK.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      DUBAI_FIRST_CASHBACK: { ...draft.DUBAI_FIRST_CASHBACK, enabled: checked },
                    })
                  }
                  aria-label="Include Dubai First Cashback"
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                5% cashback on supermarket, dining, and fuel — capped at AED 150 per category per month (not tracked
                here). 0.5% on everything else, domestic or international.
              </p>
            </CardContent>
          </Card>

          {/* Emirates NBD Darna Signature */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitleWithTerms cardId="ENBD_DARNA_SIGNATURE" />
                <Switch
                  checked={draft.ENBD_DARNA_SIGNATURE.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      ENBD_DARNA_SIGNATURE: { ...draft.ENBD_DARNA_SIGNATURE, enabled: checked },
                    })
                  }
                  aria-label="Include Emirates NBD Darna Signature"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                7.5% back as Darna Points at Aldar destinations (tick &ldquo;Aldar destination&rdquo; on the purchase
                form), 1% elsewhere, 0.25% at non-Aldar supermarkets, 0.1% on fuel/bills/education. Earn cap 50,000
                pts/month (not tracked here).
              </p>
              <div className="space-y-2">
                <Label htmlFor="darna-sig-value">AED value per Darna Point (default 0.1)</Label>
                <Input
                  id="darna-sig-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.ENBD_DARNA_SIGNATURE.darnaValuePerPointAED}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      ENBD_DARNA_SIGNATURE: {
                        ...draft.ENBD_DARNA_SIGNATURE,
                        darnaValuePerPointAED: Number.parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Bank-stated redemption: 10 Darna Points = AED 1 at Aldar tills / Darna app.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ADIB Gold Signature Debit */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitleWithTerms cardId="ADIB_GOLD_DEBIT" />
                <Switch
                  checked={draft.ADIB_GOLD_DEBIT.enabled}
                  onCheckedChange={(checked) =>
                    setDraft({
                      ...draft,
                      ADIB_GOLD_DEBIT: { ...draft.ADIB_GOLD_DEBIT, enabled: checked },
                    })
                  }
                  aria-label="Include ADIB Gold Signature Debit"
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A debit card with no cashback or points on spend, so it won&apos;t win a &ldquo;best for earning&rdquo;
                comparison. Keep it on to see its lifestyle perks (airport lounges, 25% dining, golf, valet) surfaced in
                your results.
              </p>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full">
            Save settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
