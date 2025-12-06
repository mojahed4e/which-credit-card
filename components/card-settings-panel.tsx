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
import type { CardSettings, AjmanCategory } from "@/lib/cards"
import { CARD_NAMES } from "@/lib/cards"

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
                <CardTitle className="text-base">{CARD_NAMES.ADCB_365}</CardTitle>
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
                <CardTitle className="text-base">{CARD_NAMES.EI_SWITCH}</CardTitle>
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
                <CardTitle className="text-base">{CARD_NAMES.AJMAN_ULTRACASH}</CardTitle>
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
                <CardTitle className="text-base">{CARD_NAMES.SIB_CASHBACK}</CardTitle>
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
                <CardTitle className="text-base">{CARD_NAMES.DIB_WALAA}</CardTitle>
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
                <CardTitle className="text-base">{CARD_NAMES.CITI_PREMIER}</CardTitle>
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

          <Button onClick={handleSave} className="w-full">
            Save settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
