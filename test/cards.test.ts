import { test } from "node:test"
import assert from "node:assert/strict"
import {
  computeBestCard,
  DEFAULT_SETTINGS,
  type CardId,
  type CardSettings,
  type PurchaseInput,
} from "../lib/cards.ts"

/**
 * Fuzz fixtures for the card calculators.
 *
 * Each fixture states a purchase and the expected (cardId, effective rate) for at least one
 * card we care about. We tolerate floating-point drift to 1e-9. Anything more material indicates
 * the calculator changed and the user (or the bank's T&Cs) needs to verify.
 */

interface Fixture {
  name: string
  purchase: PurchaseInput
  settings?: CardSettings
  /** Expected effective rates per card (omit cards you don't care about). */
  expectRates: Partial<Record<CardId, number>>
  /** Optional: the cardId we expect to top the recommendation. */
  expectBest?: CardId
}

const APPROX = 1e-9

function settingsWith<K extends keyof CardSettings>(
  key: K,
  patch: Partial<CardSettings[K]>,
): CardSettings {
  return {
    ...DEFAULT_SETTINGS,
    [key]: { ...DEFAULT_SETTINGS[key], ...patch },
  }
}

const fixtures: Fixture[] = [
  // ─── ADCB 365 ─────────────────────────────────────────────────────────────
  {
    name: "ADCB 365: domestic grocery → 5%",
    purchase: { amountAED: 250, location: "domestic", channel: "pos", category: "grocery" },
    expectRates: { ADCB_365: 0.05 },
    expectBest: "ADCB_365",
  },
  {
    name: "ADCB 365: dining (online_food) → 6%",
    purchase: { amountAED: 100, location: "domestic", channel: "online", category: "online_food" },
    expectRates: { ADCB_365: 0.06 },
  },
  {
    name: "ADCB 365: fuel → 3%",
    purchase: { amountAED: 200, location: "domestic", channel: "pos", category: "fuel" },
    expectRates: { ADCB_365: 0.03 },
  },
  {
    name: "ADCB 365: international retail → 1% (intl rule)",
    purchase: { amountAED: 500, location: "international", channel: "pos", category: "instore_shopping" },
    expectRates: { ADCB_365: 0.01 },
  },
  {
    name: "ADCB 365: min spend NOT met → 0%",
    purchase: { amountAED: 200, location: "domestic", channel: "pos", category: "grocery" },
    settings: settingsWith("ADCB_365", { minSpendMet: false }),
    expectRates: { ADCB_365: 0 },
  },

  // ─── Emirates Islamic SWITCH ──────────────────────────────────────────────
  {
    name: "EI SWITCH Lifestyle: domestic fuel → 8%",
    purchase: { amountAED: 200, location: "domestic", channel: "pos", category: "fuel" },
    expectRates: { EI_SWITCH: 0.08 },
    expectBest: "EI_SWITCH",
  },
  {
    name: "EI SWITCH Lifestyle: domestic grocery → 4%",
    purchase: { amountAED: 200, location: "domestic", channel: "pos", category: "grocery" },
    expectRates: { EI_SWITCH: 0.04 },
  },
  {
    name: "EI SWITCH Lifestyle: utilities → 0.5%",
    purchase: { amountAED: 500, location: "domestic", channel: "online", category: "utilities" },
    expectRates: { EI_SWITCH: 0.005 },
  },
  {
    name: "EI SWITCH Travel plan: airlines → 4%",
    purchase: { amountAED: 1000, location: "international", channel: "online", category: "travel_air" },
    settings: settingsWith("EI_SWITCH", { plan: "travel" }),
    expectRates: { EI_SWITCH: 0.04 },
  },
  {
    name: "EI SWITCH: min spend NOT met → 0%",
    purchase: { amountAED: 200, location: "domestic", channel: "pos", category: "fuel" },
    settings: settingsWith("EI_SWITCH", { minSpendMet: false }),
    expectRates: { EI_SWITCH: 0 },
  },

  // ─── Ajman ULTRACASH ──────────────────────────────────────────────────────
  {
    name: "Ajman ULTRACASH: selected fuel → 5%",
    purchase: { amountAED: 200, location: "domestic", channel: "pos", category: "fuel" },
    expectRates: { AJMAN_ULTRACASH: 0.05 },
  },
  {
    name: "Ajman ULTRACASH: dining (not selected) → 1%",
    purchase: { amountAED: 200, location: "domestic", channel: "pos", category: "dining" },
    expectRates: { AJMAN_ULTRACASH: 0.01 },
  },
  {
    name: "Ajman ULTRACASH: wallet pay treated as online → 5% only if online selected",
    purchase: { amountAED: 100, location: "domestic", channel: "wallet", category: "grocery" },
    // Default settings select fuel + supermarket. Wallet maps to 'online', which isn't selected → 1%.
    expectRates: { AJMAN_ULTRACASH: 0.01 },
  },
  {
    name: "Ajman ULTRACASH: school fees with 'school' selected → 5%",
    purchase: { amountAED: 5000, location: "domestic", channel: "pos", category: "education" },
    settings: settingsWith("AJMAN_ULTRACASH", { activeCategories: ["school", "fuel"] }),
    expectRates: { AJMAN_ULTRACASH: 0.05 },
  },

  // ─── SIB Cashback ────────────────────────────────────────────────────────
  {
    name: "SIB: online shopping → 10%",
    purchase: { amountAED: 200, location: "domestic", channel: "online", category: "online_shopping" },
    expectRates: { SIB_CASHBACK: 0.1 },
    expectBest: "SIB_CASHBACK",
  },
  {
    name: "SIB: wallet at non-excluded → 10%",
    purchase: { amountAED: 100, location: "domestic", channel: "wallet", category: "dining" },
    expectRates: { SIB_CASHBACK: 0.1 },
  },
  {
    name: "SIB: utilities (excluded) → 0.5%",
    purchase: { amountAED: 300, location: "domestic", channel: "online", category: "utilities" },
    expectRates: { SIB_CASHBACK: 0.005 },
  },
  {
    name: "SIB: international domestic retail → 2%",
    purchase: { amountAED: 500, location: "international", channel: "pos", category: "instore_shopping" },
    expectRates: { SIB_CASHBACK: 0.02 },
  },
  {
    name: "SIB: fuel wallet conservative OFF → 1% domestic retail",
    purchase: { amountAED: 200, location: "domestic", channel: "wallet", category: "fuel" },
    expectRates: { SIB_CASHBACK: 0.01 },
  },
  {
    name: "SIB: fuel wallet conservative ON → 10%",
    purchase: { amountAED: 200, location: "domestic", channel: "wallet", category: "fuel" },
    settings: settingsWith("SIB_CASHBACK", { apply10OnFuelWallet: true }),
    expectRates: { SIB_CASHBACK: 0.1 },
  },

  // ─── DIB Wala'a ──────────────────────────────────────────────────────────
  {
    name: "DIB: international retail → 3.5 pts/AED × 0.005 = 1.75%",
    purchase: { amountAED: 1000, location: "international", channel: "pos", category: "instore_shopping" },
    expectRates: { DIB_WALAA: 0.0175 },
  },
  {
    name: "DIB: domestic non-suppressed → 3 pts/AED × 0.005 = 1.5%",
    purchase: { amountAED: 500, location: "domestic", channel: "pos", category: "instore_shopping" },
    expectRates: { DIB_WALAA: 0.015 },
  },
  {
    name: "DIB: grocery (suppressed) → 0.2 pts × 0.005 = 0.1%",
    purchase: { amountAED: 500, location: "domestic", channel: "pos", category: "grocery" },
    expectRates: { DIB_WALAA: 0.001 },
  },

  // ─── Citi Premier ────────────────────────────────────────────────────────
  {
    name: "Citi Premier: dining → 3 TY/USD × tyValue",
    purchase: { amountAED: 367, location: "domestic", channel: "pos", category: "dining" },
    // 367 AED ≈ 100 USD → 300 pts × (500/15000) ≈ AED 10 → 10/367 ≈ 0.02725
    expectRates: { CITI_PREMIER: (3 / 3.67) * (500 / 15000) },
  },
  {
    name: "Citi Premier: international general → 2 TY/USD",
    purchase: { amountAED: 367, location: "international", channel: "pos", category: "instore_shopping" },
    expectRates: { CITI_PREMIER: (2 / 3.67) * (500 / 15000) },
  },
  {
    name: "Citi Premier: domestic general → 1 TY/USD",
    purchase: { amountAED: 367, location: "domestic", channel: "pos", category: "instore_shopping" },
    expectRates: { CITI_PREMIER: (1 / 3.67) * (500 / 15000) },
  },

  // ─── FAB Travel ──────────────────────────────────────────────────────────
  {
    name: "FAB Travel: flight (min spend met) → 12%",
    purchase: { amountAED: 3000, location: "international", channel: "online", category: "travel_air" },
    expectRates: { FAB_TRAVEL: 0.12 },
    expectBest: "FAB_TRAVEL",
  },
  {
    name: "FAB Travel: hotel (min spend met) → 12%",
    purchase: { amountAED: 1500, location: "international", channel: "online", category: "travel_hotel" },
    expectRates: { FAB_TRAVEL: 0.12 },
  },
  {
    name: "FAB Travel: flight (min spend NOT met) → 0%",
    purchase: { amountAED: 3000, location: "international", channel: "online", category: "travel_air" },
    settings: settingsWith("FAB_TRAVEL", { minSpendMet: false }),
    expectRates: { FAB_TRAVEL: 0 },
  },
  {
    name: "FAB Travel: flight at conservative 0.005 AED/pt → 6%",
    purchase: { amountAED: 1000, location: "international", channel: "online", category: "travel_air" },
    settings: settingsWith("FAB_TRAVEL", { fabRewardValuePerPointAED: 0.005 }),
    expectRates: { FAB_TRAVEL: 0.06 },
  },
  {
    name: "FAB Travel: flight at aggressive 0.02 AED/pt (airline xfer) → 24%",
    purchase: { amountAED: 1000, location: "international", channel: "online", category: "travel_air" },
    settings: settingsWith("FAB_TRAVEL", { fabRewardValuePerPointAED: 0.02 }),
    expectRates: { FAB_TRAVEL: 0.24 },
  },
  {
    name: "FAB Travel: everyday spend → 1 pt × 0.01 = 1%",
    purchase: { amountAED: 500, location: "domestic", channel: "pos", category: "instore_shopping" },
    expectRates: { FAB_TRAVEL: 0.01 },
  },
  {
    name: "FAB Travel: international everyday spend (no FX fee marketed) → still 1%",
    purchase: { amountAED: 500, location: "international", channel: "pos", category: "dining" },
    expectRates: { FAB_TRAVEL: 0.01 },
  },

  // ─── Dubai First Cashback ────────────────────────────────────────────────
  {
    name: "Dubai First: grocery → 5%",
    purchase: { amountAED: 200, location: "domestic", channel: "pos", category: "grocery" },
    expectRates: { DUBAI_FIRST_CASHBACK: 0.05 },
  },
  {
    name: "Dubai First: dining → 5%",
    purchase: { amountAED: 100, location: "domestic", channel: "pos", category: "dining" },
    expectRates: { DUBAI_FIRST_CASHBACK: 0.05 },
  },
  {
    name: "Dubai First: fuel → 5%",
    purchase: { amountAED: 200, location: "domestic", channel: "pos", category: "fuel" },
    expectRates: { DUBAI_FIRST_CASHBACK: 0.05 },
  },
  {
    name: "Dubai First: international shopping → 0.5%",
    purchase: { amountAED: 500, location: "international", channel: "pos", category: "instore_shopping" },
    expectRates: { DUBAI_FIRST_CASHBACK: 0.005 },
  },
  {
    name: "Dubai First: utilities → 0.5% (other)",
    purchase: { amountAED: 300, location: "domestic", channel: "online", category: "utilities" },
    expectRates: { DUBAI_FIRST_CASHBACK: 0.005 },
  },

  // ─── Recommendation outcome sanity checks ────────────────────────────────
  {
    name: "Best for hotel (intl) is FAB Travel at 12%",
    purchase: { amountAED: 2000, location: "international", channel: "online", category: "travel_hotel" },
    expectRates: {},
    expectBest: "FAB_TRAVEL",
  },
  {
    name: "Best for online shopping is SIB at 10%",
    purchase: { amountAED: 300, location: "domestic", channel: "online", category: "online_shopping" },
    expectRates: {},
    expectBest: "SIB_CASHBACK",
  },
  {
    name: "Best for dining (POS, domestic) is ADCB 365 at 6%",
    purchase: { amountAED: 250, location: "domestic", channel: "pos", category: "dining" },
    expectRates: {},
    expectBest: "ADCB_365",
  },

  // ─── Edge cases ──────────────────────────────────────────────────────────
  {
    name: "Zero amount: bestCard is null, results is empty",
    purchase: { amountAED: 0, location: "domestic", channel: "pos", category: "grocery" },
    expectRates: {},
  },
]

for (const fx of fixtures) {
  test(fx.name, () => {
    const settings = fx.settings ?? DEFAULT_SETTINGS
    const { bestCard, results } = computeBestCard(fx.purchase, settings)

    if (fx.purchase.amountAED <= 0) {
      assert.equal(bestCard, null, "expected no best card for zero amount")
      assert.equal(results.length, 0, "expected no results for zero amount")
      return
    }

    for (const [cardId, expectedRate] of Object.entries(fx.expectRates) as Array<
      [CardId, number]
    >) {
      const r = results.find((res) => res.cardId === cardId)
      assert.ok(r, `expected a result for ${cardId}`)
      assert.ok(
        Math.abs(r.effectiveRate - expectedRate) < APPROX,
        `expected ${cardId} effectiveRate ≈ ${expectedRate}, got ${r.effectiveRate}`,
      )
    }

    if (fx.expectBest) {
      assert.equal(bestCard?.cardId, fx.expectBest, `expected best card ${fx.expectBest}, got ${bestCard?.cardId}`)
    }
  })
}
