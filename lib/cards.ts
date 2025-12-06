// Types for the card recommendation system

export type CardId = "ADCB_365" | "EI_SWITCH" | "AJMAN_ULTRACASH" | "SIB_CASHBACK" | "DIB_WALAA" | "CITI_PREMIER"

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

export interface PerCardSettings {
  ADCB_365: AdcbSettings
  EI_SWITCH: EiSwitchSettings
  AJMAN_ULTRACASH: AjmanSettings
  SIB_CASHBACK: SibSettings
  DIB_WALAA: DibSettings
  CITI_PREMIER: CitiSettings
}

export interface CardSettings {
  cards: PerCardSettings
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
  cards: {
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

  return {
    cardId: "AJMAN_ULTRACASH",
    cardName: CARD_NAMES.AJMAN_ULTRACASH,
    rewardType: "cashback",
    rewardValueAED: cashback,
    effectiveRate: rate,
    note: `${categoryNote} (monthly caps per category not tracked).`,
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

  return {
    cardId: "DIB_WALAA",
    cardName: CARD_NAMES.DIB_WALAA,
    rewardType: "points",
    rewardValueAED: valueAED,
    rawPoints: points,
    effectiveRate: effectiveRate,
    note: `${categoryNote}; ${points.toFixed(0)} Wala'a Rewards (~AED ${valueAED.toFixed(2)} equivalent).`,
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

export function computeBestCard(purchase: PurchaseInput, settings: CardSettings): ComputeResult {
  if (purchase.amountAED <= 0) {
    return { bestCard: null, results: [] }
  }

  const results: CardResult[] = []

  results.push(calcAdcb365(purchase, settings.cards.ADCB_365))
  results.push(calcEiSwitch(purchase, settings.cards.EI_SWITCH))
  results.push(calcAjmanUltracash(purchase, settings.cards.AJMAN_ULTRACASH))
  results.push(calcSibCashback(purchase, settings.cards.SIB_CASHBACK))
  results.push(calcDibWalaa(purchase, settings.cards.DIB_WALAA))
  results.push(calcCitiPremier(purchase, settings.cards.CITI_PREMIER))

  results.sort((a, b) => b.effectiveRate - a.effectiveRate)

  const bestCard = results.find((r) => r.effectiveRate > 0) || null

  return { bestCard, results }
}
