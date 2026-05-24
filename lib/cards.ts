// Types for the card recommendation system

export type CardId =
  | "ADCB_365"
  | "EI_SWITCH"
  | "AJMAN_ULTRACASH"
  | "SIB_CASHBACK"
  | "DIB_WALAA"
  | "CITI_PREMIER"
  | "FAB_TRAVEL"
  | "DUBAI_FIRST_CASHBACK"

export type Location = "domestic" | "international"
export type Channel = "pos" | "online" | "wallet"
export type PurchaseCategory =
  | "grocery"
  | "online_grocery"
  | "dining"
  | "online_food"
  | "fuel"
  | "utilities"
  | "government"
  | "education"
  | "online_shopping"
  | "instore_shopping"
  | "travel_air"
  | "travel_hotel"
  | "other"

export interface PurchaseInput {
  amountAED: number
  location: Location
  channel: Channel
  category: PurchaseCategory
}

export type AjmanCategory = "fuel" | "supermarket" | "online" | "school"

export interface BasePerCardSettings {
  enabled: boolean
}

export interface AdcbSettings extends BasePerCardSettings {
  minSpendMet: boolean // AED 5,000 per month
}

export interface EiSwitchSettings extends BasePerCardSettings {
  plan: "lifestyle" | "travel"
  minSpendMet: boolean // AED 2,500 per month
}

export interface AjmanSettings extends BasePerCardSettings {
  activeCategories: AjmanCategory[] // must be length 2
}

export interface SibSettings extends BasePerCardSettings {
  apply10OnFuelWallet: boolean
}

export interface DibSettings extends BasePerCardSettings {
  walaaValuePerPointAED: number // default 0.005
}

export interface CitiSettings extends BasePerCardSettings {
  aedPerUsd: number // default 3.67
  tyValuePerPointAED: number // default 500/15000 ≈ 0.0333
}

export interface FabTravelSettings extends BasePerCardSettings {
  minSpendMet: boolean // AED 5,000 per month required for the 12% travel cashback
  fabRewardValuePerPointAED: number // default 0.01 — FAB Rewards points typical redemption value
}

export interface DubaiFirstSettings extends BasePerCardSettings {
  // No minimum spend; only minimum salary on issuance. Keeping a toggle in case
  // the user wants to suppress the card without disabling it entirely later.
}

export interface CardSettings {
  ADCB_365: AdcbSettings
  EI_SWITCH: EiSwitchSettings
  AJMAN_ULTRACASH: AjmanSettings
  SIB_CASHBACK: SibSettings
  DIB_WALAA: DibSettings
  CITI_PREMIER: CitiSettings
  FAB_TRAVEL: FabTravelSettings
  DUBAI_FIRST_CASHBACK: DubaiFirstSettings
}

export interface CardResult {
  cardId: CardId
  cardName: string
  rewardType: "cashback" | "points"
  rewardValueAED: number
  rawPoints?: number
  effectiveRate: number
  note: string
}

export interface ComputeResult {
  bestCard: CardResult | null
  results: CardResult[]
}

export const CARD_NAMES: Record<CardId, string> = {
  ADCB_365: "ADCB 365",
  EI_SWITCH: "Emirates Islamic SWITCH",
  AJMAN_ULTRACASH: "Ajman Bank ULTRACASH",
  SIB_CASHBACK: "SIB Cashback",
  DIB_WALAA: "DIB Wala'a",
  CITI_PREMIER: "Citi Premier",
  FAB_TRAVEL: "FAB Travel",
  DUBAI_FIRST_CASHBACK: "Dubai First Cashback",
}

export interface CardTermsInfo {
  bank: string
  productUrl: string
  tncUrl: string
  annualFeeAED: number | null
  annualFeeNote?: string
  minMonthlySalaryAED: number | null
  rewardCurrency: string
  keyTerms: string[]
  /**
   * The most restrictive single monthly cashback cap (AED) that the user is most
   * likely to bump into. Used for cap-headroom display in the UI. Null if uncapped
   * or points-based.
   */
  monthlyCapAED: number | null
  monthlyCapNote?: string
  /**
   * For points-based rewards: concrete redemption examples so the user knows what
   * the displayed point count actually buys. Empty/undefined for cashback cards.
   */
  redemptionGuide?: string[]
  /**
   * Last time we verified these terms against the bank's site. ISO date.
   */
  lastVerified: string
}

export const CARD_TERMS: Record<CardId, CardTermsInfo> = {
  ADCB_365: {
    bank: "Abu Dhabi Commercial Bank",
    productUrl: "https://www.adcb.com/en/personal/cards/credit-cards/365-cashback-card",
    tncUrl: "https://www.adcb.com/en/personal/cards/credit-cards/365-cashback-card",
    annualFeeAED: 383.25,
    annualFeeNote: "Free first year, then AED 383.25 (incl. VAT)",
    minMonthlySalaryAED: 8000,
    rewardCurrency: "AED cashback",
    keyTerms: [
      "Requires AED 5,000 minimum monthly spend to earn cashback.",
      "6% dining (incl. online food) · 5% grocery · 3% utilities/telecom/fuel/Salik · 1% other.",
      "Total monthly cashback cap: AED 1,000.",
      "ADCB has announced this card's benefits will be refreshed effective 1 July 2026 — re-verify before then.",
    ],
    monthlyCapAED: 1000,
    monthlyCapNote: "AED 1,000 total per month across all categories",
    lastVerified: "2026-05-24",
  },
  EI_SWITCH: {
    bank: "Emirates Islamic",
    productUrl: "https://www.emiratesislamic.ae/en/cards/credit-cards/switch-cashback-credit-card",
    tncUrl: "https://www.emiratesislamic.ae/en/terms-and-conditions/switch-cashback-credit-card",
    annualFeeAED: 0,
    annualFeeNote: "Free for life",
    minMonthlySalaryAED: null,
    rewardCurrency: "AED cashback",
    keyTerms: [
      "Requires AED 2,500 minimum monthly spend to earn cashback.",
      "Lifestyle profile: 8% domestic fuel (cap AED 100/mo) · 4% supermarket / dining / education (cap AED 200/mo each).",
      "Travel profile: 4% airlines / hotels / dining (cap AED 200/mo each).",
      "0.5% telecom · utilities · real estate · government. 1% everything else (uncapped).",
      "Active profile at the end of the calendar month determines cashback for that month.",
    ],
    monthlyCapAED: 200,
    monthlyCapNote: "AED 100/mo on Lifestyle fuel, AED 200/mo on each other accelerated category",
    lastVerified: "2026-05-24",
  },
  AJMAN_ULTRACASH: {
    bank: "Ajman Bank",
    productUrl: "https://www.ajmanbank.ae/site/mastercard_ultracash/en",
    tncUrl: "https://www.ajmanbank.ae/site/files/AB_EN_AR_ULTRACASH_CASHBACK_REWARDS_TC_R2.pdf",
    annualFeeAED: 500,
    annualFeeNote: "AED 500; waived in year 2 with AED 12,000 retail spend",
    minMonthlySalaryAED: 10000,
    rewardCurrency: "AED cashback",
    keyTerms: [
      "Choose any 2 of 4 categories (fuel, supermarket, online, school fees) at 5%.",
      "1% on everything else.",
      "Per-category monthly caps: ~AED 400/mo on fuel, ~AED 200/mo on other accelerated categories.",
      "UAE Nationals: 10% on fuel for the first 3 months (if fuel is selected).",
      "Cash withdrawals, balance transfers, government, money transfers and wallet top-ups don't earn.",
    ],
    monthlyCapAED: 400,
    monthlyCapNote: "Per-category: AED 400/mo on fuel, AED 200/mo on others",
    lastVerified: "2026-05-24",
  },
  SIB_CASHBACK: {
    bank: "Sharjah Islamic Bank",
    productUrl: "https://www.sib.ae/en/Cashback",
    tncUrl: "https://www.sib.ae/en/Cashback-TCs",
    annualFeeAED: 199,
    annualFeeNote: "Free year 1, AED 199 from year 2 (waived with AED 10,000 prior-year spend)",
    minMonthlySalaryAED: null,
    rewardCurrency: "AED cashback",
    keyTerms: [
      "10% on online & digital-wallet spend (Apple/Samsung/Google Pay), domestic & international.",
      "10% bucket capped at AED 300 per month total. Other tiers are uncapped.",
      "0.5% on utilities · telecom · supermarket / hypermarket · government · education.",
      "2% on international retail · 1% on domestic retail.",
      "Sharia-compliant 'Covered Card' product.",
    ],
    monthlyCapAED: 300,
    monthlyCapNote: "AED 300/mo total on the 10% online & wallet bucket only",
    lastVerified: "2026-05-24",
  },
  DIB_WALAA: {
    bank: "Dubai Islamic Bank",
    productUrl: "https://www.dib.ae/personal/cards/prime-infinite-card",
    tncUrl: "https://www.dib.ae/personal/cards/prime-infinite-card",
    annualFeeAED: 0,
    annualFeeNote: "Free for life (with AED 8,000 monthly spend to keep premium benefits)",
    minMonthlySalaryAED: 20000,
    rewardCurrency: "Wala'a points",
    keyTerms: [
      "3 pts/AED domestic retail · 3.5 pts/AED foreign-currency retail.",
      "Only 0.2 pts/AED on supermarket, fuel, education, utilities, telecom, government services.",
      "EU-region transactions earn ZERO Wala'a points (effective Dec 2019).",
      "Utility & government bills paid via DIB online/app earn ZERO points.",
      "Point value depends on redemption — default ~0.005 AED/pt (editable in settings).",
    ],
    monthlyCapAED: null,
    monthlyCapNote: "No monthly cap (points-based)",
    redemptionGuide: [
      "Typical redemption: ~0.005 AED per Wala'a point (i.e. 1,000 pts ≈ AED 5).",
      "Statement credit / cashback: usually the worst-value option — closer to 0.003 AED/pt.",
      "Travel & duty-free via DIB Rewards portal: often the best value at ~0.005–0.007 AED/pt.",
      "Points expire after 36 months if unused — redeem in chunks rather than hoarding.",
    ],
    lastVerified: "2026-05-24",
  },
  CITI_PREMIER: {
    bank: "Citibank",
    productUrl: "https://www.citibank.ae/credit-cards/rewards/citi-premier-credit-card",
    tncUrl: "https://www.citibank.ae/tnc",
    annualFeeAED: 787.5,
    annualFeeNote: "AED 750 + 5% VAT (~AED 787.50)",
    minMonthlySalaryAED: 15000,
    rewardCurrency: "ThankYou Points",
    keyTerms: [
      "3 ThankYou® pts/USD on dining, grocery, fuel.",
      "2 ThankYou® pts/USD on international (non-AED) spend.",
      "1 ThankYou® pt/USD on domestic AED spend.",
      "Best value when transferred to airline partners or redeemed for travel.",
      "Note: This is the 'Citi Premier' (ThankYou points), not the separate 'Citi PremierMiles' card.",
    ],
    monthlyCapAED: null,
    monthlyCapNote: "No monthly cap stated",
    redemptionGuide: [
      "Travel via Citi rewards portal: ~AED 500 per 15,000 pts (~0.033 AED/pt) — what the default in settings uses.",
      "Airline partner transfers (e.g. Etihad Guest, Asia Miles, Avios): often 0.04–0.08 AED/pt when used for premium-cabin redemptions.",
      "Statement cashback: typically ~0.02 AED/pt — worst value but no planning required.",
      "Gift cards / merchandise: usually the worst option, often <0.02 AED/pt.",
    ],
    lastVerified: "2026-05-24",
  },
  FAB_TRAVEL: {
    bank: "First Abu Dhabi Bank",
    productUrl: "https://www.bankfab.com/en-ae/personal/credit-cards/fab-travel-credit-card",
    tncUrl:
      "https://www.bankfab.com/-/media/fab-uds/personal/credit-cards/fab-travel-credit-card/pdf/card-benefits-terms-and-conditions-en.pdf",
    annualFeeAED: 1500,
    annualFeeNote: "AED 1,500 per year",
    minMonthlySalaryAED: 20000,
    rewardCurrency: "FAB Rewards",
    keyTerms: [
      "12 FAB Rewards / AED on flights & hotels (bank headline: 12% at default redemption).",
      "Cap AED 1,800/mo on the travel rewards. Requires AED 5,000 monthly spend.",
      "Realised AED value depends on how you redeem points — adjust the rate in settings.",
      "Zero international transaction fee + free flight welcome offer.",
      "Base FAB Rewards earn on everyday spend — rate not publicly disclosed; estimated ~1 pt/AED.",
      "14 free airport lounge visits/yr + 4 free Careem airport transfers/yr.",
    ],
    monthlyCapAED: 1800,
    monthlyCapNote: "AED 1,800/mo cap on the 12% travel category",
    redemptionGuide: [
      "Default in this app: ~0.01 AED per FAB Reward point — adjust in settings if your typical redemption differs.",
      "Statement credit / cashback: typically the lowest ratio, often ~0.005–0.01 AED/pt.",
      "Transfer to airline loyalty (Etihad Guest, Skywards on partner offers): can reach ~0.02 AED/pt on smart redemptions.",
      "FAB Rewards portal travel & shopping vouchers: middle of the road — check ratios before redeeming.",
    ],
    lastVerified: "2026-05-24",
  },
  DUBAI_FIRST_CASHBACK: {
    bank: "Dubai First (FAB Group)",
    productUrl: "https://www.dubaifirst.com/en-ae/cashback-credit-card",
    tncUrl:
      "https://www.dubaifirst.com/-/media/fab-uds/dubaifirst/overview/pdf/terms-and-conditions/dubai-first-cashback-cc-programme-tcs.pdf",
    annualFeeAED: 399,
    annualFeeNote: "AED 399; first-year waiver currently advertised",
    minMonthlySalaryAED: 5000,
    rewardCurrency: "AED cashback",
    keyTerms: [
      "5% cashback on supermarket, dining, fuel.",
      "AED 150/month cap per 5% category.",
      "0.5% on all other spend, domestic or international.",
      "No minimum monthly spend required (only the AED 5,000 salary at issuance).",
    ],
    monthlyCapAED: 150,
    monthlyCapNote: "AED 150/mo cap per 5% category (supermarket, dining, fuel each)",
    lastVerified: "2026-05-24",
  },
}

export const CATEGORY_LABELS: Record<PurchaseCategory, string> = {
  grocery: "Grocery / Supermarket / Hypermarket",
  online_grocery: "Online groceries (Talabat Mart, Careem, Instashop)",
  dining: "Dining / Cafes / Restaurants",
  online_food: "Online food delivery (Talabat, Deliveroo, etc.)",
  fuel: "Fuel / Petrol station",
  utilities: "Utilities / Telecom / Salik",
  government: "Government fees / Real estate / Traffic fines",
  education: "Education / School / University fees",
  online_shopping: "Online shopping (Amazon, Noon, etc.)",
  instore_shopping: "In-store shopping (malls, clothes, electronics, etc.)",
  travel_air: "Travel – airline tickets",
  travel_hotel: "Travel – hotels",
  other: "Other / I'm not sure",
}

export const DEFAULT_SETTINGS: CardSettings = {
  ADCB_365: {
    enabled: true,
    minSpendMet: true,
  },
  EI_SWITCH: {
    enabled: true,
    plan: "lifestyle",
    minSpendMet: true,
  },
  AJMAN_ULTRACASH: {
    enabled: true,
    activeCategories: ["fuel", "supermarket"],
  },
  SIB_CASHBACK: {
    enabled: true,
    apply10OnFuelWallet: false,
  },
  DIB_WALAA: {
    enabled: true,
    walaaValuePerPointAED: 0.005,
  },
  CITI_PREMIER: {
    enabled: true,
    aedPerUsd: 3.67,
    tyValuePerPointAED: 500 / 15000, // ~0.0333
  },
  FAB_TRAVEL: {
    enabled: true,
    minSpendMet: true,
    fabRewardValuePerPointAED: 0.01,
  },
  DUBAI_FIRST_CASHBACK: {
    enabled: true,
  },
}

function deriveFlags(p: PurchaseInput) {
  const isDomestic = p.location === "domestic"
  const isInternational = p.location === "international"
  const isOnline = p.channel === "online"
  const isWallet = p.channel === "wallet"
  const isOnlineOrWallet = isOnline || isWallet
  const isDining = p.category === "dining" || p.category === "online_food"
  const isGrocery = p.category === "grocery" || p.category === "online_grocery"
  const isFuel = p.category === "fuel"
  const isEducation = p.category === "education"
  const isGovernment = p.category === "government"
  const isUtilities = p.category === "utilities"
  const isTravelAir = p.category === "travel_air"
  const isTravelHotel = p.category === "travel_hotel"
  const isGeneralRetail =
    p.category === "online_shopping" || p.category === "instore_shopping" || p.category === "other"

  return {
    isDomestic,
    isInternational,
    isOnline,
    isWallet,
    isOnlineOrWallet,
    isDining,
    isGrocery,
    isFuel,
    isEducation,
    isGovernment,
    isUtilities,
    isTravelAir,
    isTravelHotel,
    isGeneralRetail,
  }
}

function calcAdcb365(p: PurchaseInput, settings: AdcbSettings): CardResult {
  const flags = deriveFlags(p)

  if (!settings.enabled || !settings.minSpendMet) {
    return {
      cardId: "ADCB_365",
      cardName: CARD_NAMES.ADCB_365,
      rewardType: "cashback",
      rewardValueAED: 0,
      effectiveRate: 0,
      note: "Requires AED 5,000 monthly spend for cashback.",
    }
  }

  let rate: number
  let categoryNote: string

  if (flags.isInternational) {
    rate = 0.01
    categoryNote = "1% international"
  } else if (flags.isDining) {
    rate = 0.06
    categoryNote = "6% dining"
  } else if (flags.isGrocery) {
    rate = 0.05
    categoryNote = "5% grocery"
  } else if (flags.isFuel || flags.isUtilities) {
    rate = 0.03
    categoryNote = "3% fuel/utilities"
  } else {
    rate = 0.01
    categoryNote = "1% base rate"
  }

  const cashback = p.amountAED * rate

  return {
    cardId: "ADCB_365",
    cardName: CARD_NAMES.ADCB_365,
    rewardType: "cashback",
    rewardValueAED: cashback,
    effectiveRate: rate,
    note: `${categoryNote} cashback (ignoring monthly caps; assumes AED 5k min spend met).`,
  }
}

function calcEiSwitch(p: PurchaseInput, settings: EiSwitchSettings): CardResult {
  const flags = deriveFlags(p)

  if (!settings.enabled || !settings.minSpendMet) {
    return {
      cardId: "EI_SWITCH",
      cardName: CARD_NAMES.EI_SWITCH,
      rewardType: "cashback",
      rewardValueAED: 0,
      effectiveRate: 0,
      note: "Requires AED 2,500 monthly spend for cashback.",
    }
  }

  let rate: number
  let categoryNote: string

  if (settings.plan === "lifestyle") {
    if (flags.isFuel && flags.isDomestic) {
      rate = 0.08
      categoryNote = "8% domestic fuel (Lifestyle)"
    } else if (flags.isGrocery && flags.isDomestic) {
      rate = 0.04
      categoryNote = "4% domestic grocery (Lifestyle)"
    } else if (flags.isDining) {
      rate = 0.04
      categoryNote = "4% dining (Lifestyle)"
    } else if (flags.isEducation) {
      rate = 0.04
      categoryNote = "4% education (Lifestyle)"
    } else if (flags.isUtilities || flags.isGovernment) {
      rate = 0.005
      categoryNote = "0.5% utilities/government (Lifestyle)"
    } else {
      rate = 0.01
      categoryNote = "1% base rate (Lifestyle)"
    }
  } else {
    // Travel plan
    if (flags.isTravelAir) {
      rate = 0.04
      categoryNote = "4% airline tickets (Travel)"
    } else if (flags.isTravelHotel) {
      rate = 0.04
      categoryNote = "4% hotels (Travel)"
    } else if (flags.isDining) {
      rate = 0.04
      categoryNote = "4% dining (Travel)"
    } else if (flags.isUtilities || flags.isGovernment) {
      rate = 0.005
      categoryNote = "0.5% utilities/government (Travel)"
    } else {
      rate = 0.01
      categoryNote = "1% base rate (Travel)"
    }
  }

  const cashback = p.amountAED * rate

  return {
    cardId: "EI_SWITCH",
    cardName: CARD_NAMES.EI_SWITCH,
    rewardType: "cashback",
    rewardValueAED: cashback,
    effectiveRate: rate,
    note: `${categoryNote} (category caps ignored).`,
  }
}

function calcAjmanUltracash(p: PurchaseInput, settings: AjmanSettings): CardResult {
  const flags = deriveFlags(p)

  if (!settings.enabled) {
    return {
      cardId: "AJMAN_ULTRACASH",
      cardName: CARD_NAMES.AJMAN_ULTRACASH,
      rewardType: "cashback",
      rewardValueAED: 0,
      effectiveRate: 0,
      note: "Card disabled.",
    }
  }

  // Derive Ajman category from purchase
  let derivedCategory: AjmanCategory | null = null
  if (flags.isOnlineOrWallet) {
    derivedCategory = "online"
  } else if (flags.isFuel) {
    derivedCategory = "fuel"
  } else if (flags.isGrocery) {
    derivedCategory = "supermarket"
  } else if (flags.isEducation) {
    derivedCategory = "school"
  }

  let rate: number
  let categoryNote: string

  if (derivedCategory && settings.activeCategories.includes(derivedCategory)) {
    rate = 0.05
    categoryNote = `5% on your selected '${derivedCategory}' category`
  } else {
    rate = 0.01
    categoryNote = derivedCategory
      ? `1% base rate; '${derivedCategory}' not in your chosen 5% categories`
      : "1% base rate; category not eligible for 5%"
  }

  const cashback = p.amountAED * rate

  // UAE Nationals get 10% on fuel for the first 3 months if fuel is selected —
  // surface as a note so we don't quietly understate their rewards.
  let extraNote = ""
  if (derivedCategory === "fuel" && settings.activeCategories.includes("fuel")) {
    extraNote = " ℹ UAE Nationals: 10% on fuel for the first 3 months on this card (not modelled here)."
  }

  return {
    cardId: "AJMAN_ULTRACASH",
    cardName: CARD_NAMES.AJMAN_ULTRACASH,
    rewardType: "cashback",
    rewardValueAED: cashback,
    effectiveRate: rate,
    note: `${categoryNote} (monthly caps per category not tracked).${extraNote}`,
  }
}

function calcSibCashback(p: PurchaseInput, settings: SibSettings): CardResult {
  const flags = deriveFlags(p)

  if (!settings.enabled) {
    return {
      cardId: "SIB_CASHBACK",
      cardName: CARD_NAMES.SIB_CASHBACK,
      rewardType: "cashback",
      rewardValueAED: 0,
      effectiveRate: 0,
      note: "Card disabled.",
    }
  }

  const isSupermarketLike = p.category === "grocery" || p.category === "online_grocery"
  const isExcluded = isSupermarketLike || flags.isUtilities || flags.isGovernment || flags.isEducation

  const isFuelWallet = flags.isFuel && flags.isWallet
  const apply10OnFuelWallet = settings.apply10OnFuelWallet

  let rate: number
  let categoryNote: string

  if (isExcluded) {
    rate = 0.005
    categoryNote = "0.5% on utilities/telecom/supermarket/govt/education"
  } else if (isFuelWallet && !apply10OnFuelWallet) {
    if (flags.isInternational) {
      rate = 0.02
      categoryNote = "Conservative: fuel with wallet treated as international retail (no 10%)"
    } else {
      rate = 0.01
      categoryNote = "Conservative: fuel with wallet treated as domestic retail (no 10%)"
    }
  } else if (flags.isOnlineOrWallet) {
    rate = 0.1
    categoryNote = "10% online/digital wallet"
  } else if (flags.isInternational) {
    rate = 0.02
    categoryNote = "2% international"
  } else {
    rate = 0.01
    categoryNote = "1% domestic retail"
  }

  const cashback = p.amountAED * rate

  return {
    cardId: "SIB_CASHBACK",
    cardName: CARD_NAMES.SIB_CASHBACK,
    rewardType: "cashback",
    rewardValueAED: cashback,
    effectiveRate: rate,
    note: `${categoryNote} cashback (up to AED 300/month; not tracked).`,
  }
}

function calcDibWalaa(p: PurchaseInput, settings: DibSettings): CardResult {
  const flags = deriveFlags(p)

  if (!settings.enabled) {
    return {
      cardId: "DIB_WALAA",
      cardName: CARD_NAMES.DIB_WALAA,
      rewardType: "points",
      rewardValueAED: 0,
      rawPoints: 0,
      effectiveRate: 0,
      note: "Card disabled.",
    }
  }

  const valuePerPoint = settings.walaaValuePerPointAED

  const isSuppressed = flags.isGrocery || flags.isFuel || flags.isEducation || flags.isUtilities || flags.isGovernment

  let pointsPerAED: number
  let categoryNote: string

  if (isSuppressed) {
    pointsPerAED = 0.2
    categoryNote = "0.2 pts/AED (suppressed: grocery/fuel/telecom/education/government/utility)"
  } else if (flags.isInternational) {
    pointsPerAED = 3.5
    categoryNote = "3.5 pts/AED international"
  } else {
    pointsPerAED = 3.0
    categoryNote = "3 pts/AED domestic"
  }

  const points = p.amountAED * pointsPerAED
  const valueAED = points * valuePerPoint
  const effectiveRate = valueAED / p.amountAED

  // DIB has two known "earn zero" exclusions that our calc can't detect from a
  // single transaction, but we should warn the user when they're plausibly
  // relevant so the displayed number isn't quietly optimistic.
  const exclusionWarnings: string[] = []
  if (flags.isInternational) {
    exclusionWarnings.push("EU-region transactions earn ZERO Wala'a (Dec 2019 rule).")
  }
  if (flags.isUtilities || flags.isGovernment) {
    exclusionWarnings.push("Paying via DIB online/app earns ZERO — use another channel to keep the 0.2 pts/AED.")
  }
  const exclusionText = exclusionWarnings.length > 0 ? ` ⚠ ${exclusionWarnings.join(" ")}` : ""

  return {
    cardId: "DIB_WALAA",
    cardName: CARD_NAMES.DIB_WALAA,
    rewardType: "points",
    rewardValueAED: valueAED,
    rawPoints: points,
    effectiveRate: effectiveRate,
    note: `${categoryNote}; ${points.toFixed(0)} Wala'a Rewards (~AED ${valueAED.toFixed(2)} equivalent).${exclusionText}`,
  }
}

function calcCitiPremier(p: PurchaseInput, settings: CitiSettings): CardResult {
  const flags = deriveFlags(p)

  if (!settings.enabled) {
    return {
      cardId: "CITI_PREMIER",
      cardName: CARD_NAMES.CITI_PREMIER,
      rewardType: "points",
      rewardValueAED: 0,
      rawPoints: 0,
      effectiveRate: 0,
      note: "Card disabled.",
    }
  }

  const aedPerUsd = settings.aedPerUsd
  const tyValue = settings.tyValuePerPointAED

  let pointsPerUsd: number
  let categoryNote: string

  if (flags.isDining || flags.isGrocery || flags.isFuel) {
    pointsPerUsd = 3
    categoryNote = "3 TY pts/USD (dining/grocery/fuel)"
  } else if (flags.isInternational) {
    pointsPerUsd = 2
    categoryNote = "2 TY pts/USD (international)"
  } else {
    pointsPerUsd = 1
    categoryNote = "1 TY pt/USD (base rate)"
  }

  const pointsPerAED = pointsPerUsd / aedPerUsd
  const points = p.amountAED * pointsPerAED
  const valueAED = points * tyValue
  const effectiveRate = valueAED / p.amountAED
  const percentEquivalent = (effectiveRate * 100).toFixed(2)

  return {
    cardId: "CITI_PREMIER",
    cardName: CARD_NAMES.CITI_PREMIER,
    rewardType: "points",
    rewardValueAED: valueAED,
    rawPoints: points,
    effectiveRate: effectiveRate,
    note: `~${percentEquivalent}% equivalent; ${categoryNote}; ${points.toFixed(0)} ThankYou Points.`,
  }
}

function calcFabTravel(p: PurchaseInput, settings: FabTravelSettings): CardResult {
  const flags = deriveFlags(p)

  if (!settings.enabled) {
    return {
      cardId: "FAB_TRAVEL",
      cardName: CARD_NAMES.FAB_TRAVEL,
      rewardType: "points",
      rewardValueAED: 0,
      rawPoints: 0,
      effectiveRate: 0,
      note: "Card disabled.",
    }
  }

  // The bank markets "12% cashback in FAB Rewards on flight & hotel bookings,
  // capped at AED 1,800/month, with AED 5,000 minimum monthly spend". The
  // headline 12% is the AED-equivalent at the standard portal redemption
  // (~0.01 AED per FAB Reward point), i.e. 12 points per AED on travel.
  //
  // We model it explicitly as points so the user's redemption-rate setting
  // determines the *realised* AED value. If they redeem at 0.01 AED/pt they
  // get the bank's headline 12%. If they expect 0.005 AED/pt (closer to
  // statement-credit reality), they get 6%. If they hit airline-transfer
  // sweet spots at 0.02 AED/pt, they get 24%.
  const valuePerPoint = settings.fabRewardValuePerPointAED

  if (flags.isTravelAir || flags.isTravelHotel) {
    if (!settings.minSpendMet) {
      return {
        cardId: "FAB_TRAVEL",
        cardName: CARD_NAMES.FAB_TRAVEL,
        rewardType: "points",
        rewardValueAED: 0,
        rawPoints: 0,
        effectiveRate: 0,
        note: "12% on flights/hotels requires AED 5,000 monthly spend (toggle off).",
      }
    }
    const pointsPerAED = 12 // bank's effective earn rate on the travel category
    const points = p.amountAED * pointsPerAED
    const valueAED = points * valuePerPoint
    const effectiveRate = p.amountAED > 0 ? valueAED / p.amountAED : 0
    return {
      cardId: "FAB_TRAVEL",
      cardName: CARD_NAMES.FAB_TRAVEL,
      rewardType: "points",
      rewardValueAED: valueAED,
      rawPoints: points,
      effectiveRate,
      note: `12 FAB Rewards/AED on flights & hotels — cap AED 1,800/mo (not tracked). Realised value depends on redemption ratio (settings).`,
    }
  }

  // Base FAB Rewards earn — not publicly disclosed; use a conservative ~1 pt/AED.
  // Zero FX fee marketed, so we treat international the same as domestic for the estimate.
  const pointsPerAED = 1
  const points = p.amountAED * pointsPerAED
  const valueAED = points * valuePerPoint
  const effectiveRate = p.amountAED > 0 ? valueAED / p.amountAED : 0

  return {
    cardId: "FAB_TRAVEL",
    cardName: CARD_NAMES.FAB_TRAVEL,
    rewardType: "points",
    rewardValueAED: valueAED,
    rawPoints: points,
    effectiveRate,
    note: flags.isInternational
      ? "Zero FX fee + base FAB Rewards (estimated rate; see T&C for exact earn)."
      : "Base FAB Rewards on everyday spend (estimated rate; see T&C for exact earn).",
  }
}

function calcDubaiFirstCashback(p: PurchaseInput, settings: DubaiFirstSettings): CardResult {
  const flags = deriveFlags(p)

  if (!settings.enabled) {
    return {
      cardId: "DUBAI_FIRST_CASHBACK",
      cardName: CARD_NAMES.DUBAI_FIRST_CASHBACK,
      rewardType: "cashback",
      rewardValueAED: 0,
      effectiveRate: 0,
      note: "Card disabled.",
    }
  }

  let rate: number
  let categoryNote: string

  if (flags.isGrocery) {
    rate = 0.05
    categoryNote = "5% supermarket (cap AED 150/month)"
  } else if (flags.isDining) {
    rate = 0.05
    categoryNote = "5% dining (cap AED 150/month)"
  } else if (flags.isFuel) {
    rate = 0.05
    categoryNote = "5% fuel (cap AED 150/month)"
  } else {
    rate = 0.005
    categoryNote = "0.5% on all other spend (domestic & international)"
  }

  const cashback = p.amountAED * rate

  return {
    cardId: "DUBAI_FIRST_CASHBACK",
    cardName: CARD_NAMES.DUBAI_FIRST_CASHBACK,
    rewardType: "cashback",
    rewardValueAED: cashback,
    effectiveRate: rate,
    note: `${categoryNote} (per-category cap not tracked here).`,
  }
}

export function computeBestCard(purchase: PurchaseInput, settings: CardSettings): ComputeResult {
  if (purchase.amountAED <= 0) {
    return { bestCard: null, results: [] }
  }

  const results: CardResult[] = []

  results.push(calcAdcb365(purchase, settings.ADCB_365))
  results.push(calcEiSwitch(purchase, settings.EI_SWITCH))
  results.push(calcAjmanUltracash(purchase, settings.AJMAN_ULTRACASH))
  results.push(calcSibCashback(purchase, settings.SIB_CASHBACK))
  results.push(calcDibWalaa(purchase, settings.DIB_WALAA))
  results.push(calcCitiPremier(purchase, settings.CITI_PREMIER))
  results.push(calcFabTravel(purchase, settings.FAB_TRAVEL))
  results.push(calcDubaiFirstCashback(purchase, settings.DUBAI_FIRST_CASHBACK))

  results.sort((a, b) => b.effectiveRate - a.effectiveRate)

  const bestCard = results.find((r) => r.effectiveRate > 0) || null

  return { bestCard, results }
}
