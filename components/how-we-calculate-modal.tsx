"use client"

import type React from "react"

import { useState } from "react"
import { Info, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"

type CardLink = { label: string; href: string }
type CardHighlight = { label: string; value: string }

interface CardSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  links?: CardLink[]
  highlights?: CardHighlight[]
}

function CardSection({ title, children, defaultOpen = false, links = [], highlights = [] }: CardSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentId = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        <span className="font-medium text-sm">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div id={contentId} className="p-3 text-sm text-muted-foreground space-y-3">
          {(links.length > 0 || highlights.length > 0) && (
            <div className="space-y-3">
              {links.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs text-foreground hover:bg-muted"
                    >
                      {l.label}
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}

              {highlights.length > 0 && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {highlights.map((h) => (
                    <div key={h.label} className="rounded-md border border-border bg-muted/20 p-2">
                      <div className="text-[11px] text-muted-foreground">{h.label}</div>
                      <div className="text-xs font-medium text-foreground">{h.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {children}
        </div>
      )}
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

      <DialogContent className="max-h-modal flex flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 p-4 pb-2">
          <DialogTitle>How this works</DialogTitle>
          <DialogDescription>Understanding our reward calculations and assumptions</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto break-words px-4 pb-4">
          <div className="space-y-4">
            {/* General Assumptions */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">General assumptions</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>We estimate rewards using published earn rules (rates, plans, MCC categories) for each card.</li>
                <li>
                  We show published <strong>minimum spend requirements</strong> and <strong>caps</strong>, but we don&apos;t track your running
                  monthly totals or how much of a cap you&apos;ve already used. Per-transaction estimates assume you&apos;re eligible and below
                  the cap unless your settings say otherwise.
                </li>
                <li>
                  Merchant categories are determined by banks using MCC codes and payment network data, so real rewards can differ
                  (e.g., “government” vs “utilities”, POS vs wallet routing, marketplace aggregators).
                </li>
                <li>Always rely on your bank statement as the source of truth.</li>
              </ul>
            </div>

            {/* Per-card sections */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Card-specific assumptions</h3>

              <CardSection
                title="ADCB 365 Cashback"
                links={[
                  {
                    label: "Official 365 Cashback T&Cs (PDF)",
                    href: "https://www.adcb.com/en/multimedia/tnc/adcb-365-cashback-card-tnc-en.pdf",
                  },
                ]}
                highlights={[
                  { label: "Minimum monthly spend to earn cashback", value: "AED 5,000 (eligible billed transactions/month)" },
                  { label: "Maximum cashback", value: "AED 1,000 per month (overall cap)" },
                ]}
              >
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-foreground">Rates we apply</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>6% on dining (includes online food delivery ordered from restaurants in the UAE).</li>
                      <li>5% on supermarkets.</li>
                      <li>3% on fuel.</li>
                      <li>3% on utilities + telecom + Salik tolls.</li>
                      <li>1% on any other category.</li>
                      <li>1% on foreign currency / outside-UAE spends regardless of category.</li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-medium text-foreground">Eligibility, caps & exclusions</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>If the AED 5,000 monthly threshold is not met, cashback is 0% on all spends for that month.</li>
                      <li>
                        Utilities/telecom/Salik are counted only when paid via eligible channels (service provider channels, ADCB channels,
                        or Dubai Now).
                      </li>
                      <li>
                        Some transactions don&apos;t count toward the AED 5,000 threshold and/or cashback (e.g., cash advance, balance
                        transfer, credit card loan, fees/finance charges, reversals, quasi-cash).
                      </li>
                      <li>Cashback is credited monthly and appears in the statement in the month after the transaction.</li>
                    </ul>
                  </div>
                </div>
              </CardSection>

              <CardSection
                title="Emirates Islamic SWITCH Cashback"
                links={[
                  {
                    label: "Official SWITCH Cashback T&Cs",
                    href: "https://www.emiratesislamic.ae/en/terms-and-conditions/switch-cashback-credit-card",
                  },
                ]}
                highlights={[
                  { label: "Minimum billed amount to earn cashback", value: "AED 2,500 per calendar month" },
                  {
                    label: "Published monthly caps",
                    value: "Lifestyle: fuel cap AED 100; most others cap AED 200 (per category). Travel: AED 200 (per category).",
                  },
                ]}
              >
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-foreground">Rates & caps we reference</div>

                    <div className="mt-1.5 space-y-2">
                      <div>
                        <div className="font-medium text-foreground/90">Lifestyle plan</div>
                        <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                          <li>4% supermarket (domestic) — monthly cap AED 200.</li>
                          <li>4% dining — monthly cap AED 200.</li>
                          <li>8% fuel (domestic) — monthly cap AED 100.</li>
                          <li>4% education — monthly cap AED 200.</li>
                          <li>0.5% telecom, utilities, real estate, government & charitable — no cap.</li>
                          <li>1% other spends — no cap.</li>
                        </ul>
                      </div>

                      <div>
                        <div className="font-medium text-foreground/90">Travel plan</div>
                        <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                          <li>4% airlines — monthly cap AED 200.</li>
                          <li>4% hotels — monthly cap AED 200.</li>
                          <li>4% dining — monthly cap AED 200.</li>
                          <li>0.5% telecom, utilities, real estate, government & charitable — no cap.</li>
                          <li>1% other spends — no cap.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-foreground">Spending criteria & key exclusions</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>Plan cashback requires a minimum billed amount of AED 2,500 per calendar month.</li>
                      <li>Cashback accrues by calendar month and reflects in EI+ app in the month after the eligible transaction month.</li>
                      <li>
                        Bill payments via Emirates Islamic channels (online/mobile/ATM/call center) for utilities/telecom/RTA and other
                        services are non-eligible.
                      </li>
                      <li>The plan active at the end of the calendar month is used to calculate that month’s cashback.</li>
                      <li>Statement credit redemption has a published minimum (see T&Cs for the latest thresholds).</li>
                    </ul>
                  </div>
                </div>
              </CardSection>

              <CardSection
                title="Ajman Bank ULTRACASH"
                links={[
                  {
                    label: "Official ULTRACASH Cashback Program T&Cs (PDF)",
                    href: "https://www.ajmanbank.ae/site/files/AB_EN_ULTRACASH_CASHBACK_REWARDS_TC.pdf",
                  },
                ]}
                highlights={[
                  { label: "5% categories", value: "Choose exactly 2: Fuel, Supermarket, Online, School fees" },
                  {
                    label: "Max cashback (per statement cycle, per selected category)",
                    value: "Fuel AED 400; Supermarket AED 200; Online AED 200; School fees AED 200",
                  },
                ]}
              >
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-foreground">How we estimate</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>Selected categories earn 5% (subject to category cap); other retail earns 1%.</li>
                      <li>
                        If you select <strong>Online</strong>, online cashback applies to online versions of other categories (e.g., school fees
                        paid online) instead of the other category.
                      </li>
                      <li>Merchant category is based on Mastercard MCC assignment, so misclassification can change payout.</li>
                      <li>
                        UAE nationals: if <strong>Fuel</strong> is selected, the bank offers 10% on fuel for the first 3 months, then 5% thereafter
                        (modelable via a promo toggle if you want).
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-medium text-foreground">Key rules & exclusions</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>Cashback stops accruing if the minimum amount due is missed on 2 consecutive payment due dates.</li>
                      <li>Cashback expires 1 year from the date it’s earned.</li>
                      <li>
                        Non-qualifying transactions (no cashback) include cash withdrawals, balance transfers, fees/charges, wallet top-ups,
                        certain “government/money transfer” MCCs, and more (see the official PDF for the full list).
                      </li>
                    </ul>
                  </div>
                </div>
              </CardSection>

              <CardSection
                title="SIB Cashback"
                links={[
                  {
                    label: "Official SIB Cashback T&Cs (PDF)",
                    href: "https://www.sib.ae/docs/default-source/default-document-library/cb-titanium-tc-en.pdf?sfvrsn=e04ad1d6_6",
                  },
                ]}
                highlights={[
                  { label: "Minimum spend", value: "No minimum spend required to start earning" },
                  { label: "Accelerated cashback cap", value: "AED 300 per monthly statement (accelerated categories combined)" },
                ]}
              >
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-foreground">Rates & caps we reference</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>
                        <strong>10% (Accelerated)</strong> on online + wallets (Apple Pay / Samsung Wallet) + card-on-file payments, excluding
                        utility/telecom/government/supermarket/hypermarket/education — capped at AED 300 per monthly statement.
                      </li>
                      <li>
                        <strong>1% (Standard)</strong> on domestic retail spends (POS in UAE).
                      </li>
                      <li>
                        <strong>2% (Standard)</strong> on international retail spends (POS outside UAE in foreign currency).
                      </li>
                      <li>
                        <strong>0.5% (Standard)</strong> on utility + telecom + government + supermarket/hypermarket + education (per MCC).
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-medium text-foreground">Spending criteria & redemption</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>Utility bill payments made through SIB digital channels (online/mobile) are listed as non-qualifying.</li>
                      <li>Minimum redemption is AED 100; cashback expires 36 months from when it’s earned.</li>
                      <li>MCC classification is controlled by the scheme/acquirer; the bank notes it won’t entertain claims for MCC mismatch.</li>
                    </ul>
                  </div>

                  <p className="text-xs italic">
                    Note: Fuel isn&apos;t explicitly listed as “excluded” in the published cashback table, but wallet-fuel outcomes can still vary by MCC and routing. Our conservative toggles exist to avoid overstating 10% where classification is unclear.
                  </p>
                </div>
              </CardSection>

              <CardSection
                title="DIB Prime Infinite (Wala&apos;a Rewards)"
                links={[
                  { label: "Prime Cards T&Cs (PDF)", href: "https://www.dib.ae/docs/default-source/cpr/tc/cards-tc-prime-cards-tc-en.pdf" },
                  { label: "Wala&apos;a Rewards Program T&Cs (PDF)", href: "https://www.dib.ae/docs/default-source/cpr/tc/cards-tc-walaa-rewards-en.pdf" },
                ]}
                highlights={[
                  {
                    label: "Standard earn rate",
                    value: "3.0 Wala’a / AED 1 (local retail) and 3.5 Wala’a / AED-equivalent (foreign currency retail)",
                  },
                  {
                    label: "Suppressed categories",
                    value: "0.2 Wala’a / AED 1 on Supermarkets, Telecom, Education, Petroleum, Government Services (from 1 Jan 2024)",
                  },
                ]}
              >
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-foreground">How we estimate</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>
                        We convert Wala’a points to an AED-equivalent using the value you set in settings. Actual value depends on how you redeem.
                      </li>
                      <li>
                        From <strong>1 Jan 2024</strong>, suppressed categories earn 0.2 Wala’a per AED; other retail earns 3.0 (AED) or 3.5 (FX).
                      </li>
                      <li>EU-origin retail spends do not earn Wala’a rewards (per DIB published note).</li>
                      <li>Utility & government bills transactions made through DIB platforms do not earn Wala’a rewards.</li>
                    </ul>
                  </div>
                </div>
              </CardSection>

              <CardSection
                title="Citi Premier (ThankYou Points)"
                links={[
                  {
                    label: "Citi Premier / Rewards Credit Cards T&Cs (PDF)",
                    href: "https://www.citibank.ae/credit-cards/pdf/rewards-credit-cards-terms-and-conditions.pdf",
                  },
                  {
                    label: "Citi ThankYou Program T&Cs (PDF)",
                    href: "https://www.citibank.ae/content/dam/cgcpc/ae/prelogin/www-citibank-ae/doc/en/pdf/consumer/citi-thankyou-rewards-and-citi-rewards-tnc.pdf",
                  },
                ]}
                highlights={[
                  { label: "Earn rates (points per USD equivalent)", value: "3× dining/fuel/grocery; 2× non-AED spend; 1× local (AED) spend" },
                  { label: "Points validity", value: "No maximum period for redeeming points (subject to Citi’s right to change and account standing)" },
                ]}
              >
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-foreground">How we estimate</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>
                        Citi earn rates are defined per <strong>USD equivalent</strong>. We use your chosen AED↔USD rate (default 3.67) to estimate an AED-equivalent reward.
                      </li>
                      <li>
                        We convert points to an AED-equivalent using your points value setting (often modeled using travel transfers / “fly with points” style redemptions).
                      </li>
                      <li>
                        Ineligible transactions can include fees/charges, cash advances, and utility bill payments made through Citi channels (see Citi’s program T&Cs).
                      </li>
                      <li>
                        Citi can set a maximum number of points and determines how transaction categories are defined (often based on scheme/acquirer categorization).
                      </li>
                    </ul>
                  </div>
                </div>
              </CardSection>

              <CardSection title="FAB Travel (FAB Rewards)">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>
                    We apply 12% on airline tickets and hotel bookings when the AED 5,000 minimum monthly spend toggle
                    is on (capped AED 1,800/month, not tracked here).
                  </li>
                  <li>
                    FAB does not publicly disclose the base FAB Rewards earn rate. We assume 1 point per AED at your
                    chosen redemption value (default 0.00303 AED/pt) — so an estimated ~0.3% on everyday spend. The 12%
                    travel rate is fixed and independent of this setting.
                  </li>
                  <li>
                    Zero international transaction fee is advertised, so we treat domestic and foreign-currency spend
                    the same for the base earn estimate.
                  </li>
                  <li>
                    The 12% is paid in FAB Rewards (redeemable for travel, shopping or airline miles), not AED to your
                    account — we value it at FAB's standard redemption (~0.00303 AED/pt); smart airline transfers can beat it.
                  </li>
                </ul>
              </CardSection>

              <CardSection title="Dubai First Cashback">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>
                    We apply 5% on supermarket, dining, and fuel — each capped at AED 150 per month (not tracked here).
                  </li>
                  <li>0.5% on everything else, whether domestic or international.</li>
                  <li>
                    No minimum monthly spend required (only a minimum salary at issuance, AED 5,000). Annual fee AED
                    399, first-year waiver advertised at the time of writing.
                  </li>
                </ul>
              </CardSection>

              <CardSection
                title="Emirates NBD Darna Signature (Darna Points)"
                links={[
                  {
                    label: "Official Darna Visa Credit Card T&Cs (PDF)",
                    href: "https://www.emiratesnbd.com/-/media/enbd/files/cards/darna_visa_credit_card_tncs.pdf",
                  },
                ]}
                highlights={[
                  { label: "Aldar destination rate", value: "7.5% back (as Darna Points)" },
                  { label: "Monthly earn cap", value: "50,000 Darna Points (≈ AED 5,000)" },
                ]}
              >
                <div className="space-y-2">
                  <div>
                    <div className="font-medium text-foreground">Rates we apply (per the official T&Cs table)</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>
                        <strong>Aldar destinations</strong> (tick the &ldquo;Aldar destination&rdquo; box on the form):
                        7.5% — Yas Mall, Al Jimi Mall, Aldar hotels &amp; beach clubs, Miral theme parks, golf courses
                        and 1,200+ Aldar retailers.
                      </li>
                      <li>General non-Aldar spend: 1% — same rate domestic, international and EU/UK.</li>
                      <li>Non-Aldar supermarkets, fast-food, insurance, car dealerships: 0.25%.</li>
                      <li>
                        Petroleum, transit, government, utilities, real estate, education, telecom: 0.1% — and Aldar
                        property &amp; school fees are excluded from the accelerated Aldar tier.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="font-medium text-foreground">How we estimate</div>
                    <ul className="mt-1.5 space-y-1.5 list-disc list-inside">
                      <li>
                        Earn is in Darna Points; the bank&apos;s headline %s assume the fixed redemption of{" "}
                        <strong>10 Darna Points = AED 1</strong> at Aldar POS / the Darna app. We use that (0.1 AED/pt)
                        as the default point value — adjustable in settings.
                      </li>
                      <li>
                        We model regular dining at the general rate; fast-food restaurants code into the 0.25% tier.
                      </li>
                      <li>
                        Non-earning transactions include utility bills paid via ENBD online banking, exchange houses,
                        installment-converted amounts, and fees.
                      </li>
                      <li>Points moved to the Darna wallet expire 2 years from issue.</li>
                    </ul>
                  </div>
                </div>
              </CardSection>

              <CardSection
                title="ADIB Gold Signature Debit (lifestyle perks)"
                links={[
                  {
                    label: "ADIB Gold lifestyle benefits",
                    href: "https://www.adib.ae/en/personal/priority-banking/gold/lifestyle-benefits",
                  },
                ]}
                highlights={[
                  { label: "Rewards on spend", value: "None — it's a debit card" },
                  { label: "Airport lounges", value: "Unlimited (LoungeKey), cardholder only" },
                ]}
              >
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>
                    This is a debit card: it earns no cashback or points, so we score it at 0% on every purchase. It
                    never tops the ranking — its value is the lifestyle perks below, surfaced against your results.
                  </li>
                  <li>Unlimited airport lounge access via LoungeKey / Visa Airport Companion (900+ lounges, cardholder only).</li>
                  <li>25% off fine dining in the UAE, 2 golf rounds/month, free valet at select ADIB branches, 24/7 Visa Concierge.</li>
                  <li>Eligibility is relationship-based: AED 250k deposits, or AED 40k salary, or AED 1.25M home finance.</li>
                </ul>
              </CardSection>
            </div>

            {/* Settings note */}
            <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
              If you change settings (min spend toggles, plan selection, conservative mode, points valuation), calculations update instantly. We still show the official caps/eligibility rules here for context.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
