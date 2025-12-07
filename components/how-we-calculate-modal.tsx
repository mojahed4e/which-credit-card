"use client"

import type React from "react"

import { useState } from "react"
import { Info, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CardSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CardSection({ title, children, defaultOpen = false }: CardSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        <span className="font-medium text-sm">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="p-3 text-sm text-muted-foreground space-y-2">{children}</div>}
    </div>
  )
}

export function HowWeCalculateModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5 h-auto py-1">
          <Info className="h-3.5 w-3.5" />
          <span className="text-xs">How we calculate this</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>How this works</DialogTitle>
          <DialogDescription>Understanding our reward calculations and assumptions</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-80px)] px-4 pb-4">
          <div className="space-y-4">
            {/* General Assumptions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">General assumptions</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>We estimate rewards based on public card terms and simple rules for each category.</li>
                <li>
                  We don&apos;t track your monthly usage of each card, so we ignore monthly cashback caps and show the
                  raw percentage on this single transaction.
                </li>
                <li>
                  Actual rewards can differ because merchants are classified by banks using MCC codes (e.g. some fuel or
                  online spends may be treated as utilities or government).
                </li>
                <li>Always rely on your bank statements as the source of truth.</li>
              </ul>
            </div>

            {/* Per-card sections */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Card-specific assumptions</h3>

              <CardSection title="ADCB 365 Cashback">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>We assume you meet the AED 5,000 monthly minimum spend if the toggle is enabled in settings.</li>
                  <li>If that minimum is not met (toggle off), we assume 0% cashback for this card.</li>
                  <li>
                    We use 6% for dining, 5% for grocery/supermarket, 3% for utilities/telecom/fuel/Salik, 1% for other
                    domestic and international spends.
                  </li>
                  <li>We ignore the bank&apos;s monthly cashback cap and just show the rate for this transaction.</li>
                </ul>
              </CardSection>

              <CardSection title="Emirates Islamic SWITCH Cashback">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>We assume you meet the AED 2,500 monthly minimum spend if the toggle is enabled in settings.</li>
                  <li>If that minimum is not met, we assume 0% cashback.</li>
                  <li>
                    <strong>Lifestyle plan:</strong> 8% on fuel, 4% on supermarket, dining and education, 0.5% on
                    utilities/government, 1% on other spends.
                  </li>
                  <li>
                    <strong>Travel plan:</strong> 4% on airlines, hotels and dining, 0.5% on utilities/government, 1% on
                    other spends.
                  </li>
                  <li>We ignore individual category caps and show the raw percentage.</li>
                </ul>
              </CardSection>

              <CardSection title="Ajman Bank ULTRACASH">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>You choose exactly two 5% categories in settings: Fuel, Supermarket, Online, School fees.</li>
                  <li>
                    We treat wallet/online transactions as &quot;Online&quot; even if they are supermarket/fuel/school –
                    matching the bank&apos;s rules.
                  </li>
                  <li>Selected categories earn 5% on this single transaction, others 1%.</li>
                  <li>
                    We don&apos;t track monthly caps per category; we just apply 5% or 1% based on your current
                    selection.
                  </li>
                </ul>
              </CardSection>

              <CardSection title="SIB Cashback">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>
                    We treat utilities, telecom, government, supermarket/hypermarket and education as excluded
                    categories that get 0.5%.
                  </li>
                  <li>
                    All other online and digital wallet transactions (Apple/Google/Samsung Pay) get 10% cashback by
                    default, but capped by the bank per month (we don&apos;t track your cap usage).
                  </li>
                  <li>International non-excluded retail gets 2%, domestic non-excluded retail gets 1%.</li>
                  <li>
                    There is a &quot;fuel wallet 10%&quot; conservative switch in settings. When OFF (default), fuel
                    with wallet is treated as normal retail (1%/2%). When ON, it may be treated as 10%, but real payout
                    can depend on how the bank classifies the station.
                  </li>
                </ul>
              </CardSection>

              <CardSection title="DIB Prime Infinite (Wala'a Rewards)">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>
                    We assume a default value per Wala&apos;a point (changeable in settings). By default we use
                    something close to 0.005 AED/point, based on typical redemptions.
                  </li>
                  <li>
                    Grocery, fuel, education, utilities, government and similar categories are &quot;suppressed&quot;
                    and only earn 0.2 points per AED.
                  </li>
                  <li>
                    Other domestic retail earns 3 points per AED, foreign currency retail earns 3.5 points per AED.
                  </li>
                  <li>
                    We convert points to an AED-equivalent using your chosen value, but real value can differ depending
                    on how you redeem.
                  </li>
                </ul>
              </CardSection>

              <CardSection title="Citi Premier (ThankYou Points)">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>
                    We use your chosen AED per USD rate (default 3.67) and a default AED value per ThankYou® point based
                    on travel redemptions (changeable in settings).
                  </li>
                  <li>
                    Dining, fuel and grocery earn 3 points per USD; other international spends earn 2; other local AED
                    spends earn 1.
                  </li>
                  <li>
                    We estimate an AED-equivalent reward % assuming you use your points for travel. Other redemptions
                    may be worth less.
                  </li>
                </ul>
              </CardSection>
            </div>

            {/* Settings note */}
            <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
              If you change settings (min spend toggles, conservative mode, points valuation), the calculations update
              instantly but this explanation still applies.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
