// Card perks (non-reward cardholder benefits): valet, lounge, car-rental /
// flight / hotel discounts, cinema, golf, etc.
//
// These answer a DIFFERENT question than the reward calculator: not "best card
// for THIS transaction's rewards" but "what do I get for OWNING this card". We
// deliberately keep them separate from effectiveRate so a valet perk never
// inflates a cashback %.
//
// Data model note: many UAE perks (lounge, Avis, concierge) are NETWORK-TIER
// benefits of the underlying Visa Infinite / Mastercard World Elite card, not
// the bank's own program. We store each card's networkTier as a first-class
// field and tag every perk with `source` ("bank" | "network") + an optional
// `requiredTier`, so the UI can honestly say "comes from your Visa Infinite
// tier" vs "this bank's own offer". We keep perks flat per-card (rather than a
// shared per-tier table) because the verified data shows network perks carry
// card-specific specifics — lounge visit counts, providers and percentages all
// vary by card — that a shared table would flatten.
//
// All data verified on 2026-06-21 via per-bank research + adversarial
// verification. Expired / contradicted claims are omitted; weak claims are
// marked confidence "low" and rendered with a caveat.

import type { CardId, PurchaseCategory } from "./cards"

export const PERKS_VERIFIED_ON = "2026-06-21"

export type NetworkTier =
  | "Visa Infinite"
  | "Visa Signature"
  | "Mastercard World Elite"
  | "Mastercard World"
  | "Mastercard Platinum"
  | "Mastercard Titanium"

export type PerkCategory =
  | "airport_lounge"
  | "valet_parking"
  | "car_rental"
  | "flight_discount"
  | "hotel_discount"
  | "travel_insurance"
  | "meet_and_greet"
  | "concierge"
  | "cinema"
  | "dining_offer"
  | "golf"
  | "fitness"
  | "welcome_offer"
  | "other"

export interface CardPerk {
  category: PerkCategory
  title: string
  detail: string
  partner?: string
  /** Named malls / venues — drives the (future) valet-at-the-mall feature. */
  locations?: string[]
  discountPct?: number
  /** Human-readable limit, e.g. "12 visits/year + 1 guest". */
  limit?: string
  source: "bank" | "network"
  /** For network perks: the Visa/Mastercard tier that unlocks it. */
  requiredTier?: NetworkTier
  /**
   * Override for when this perk is worth surfacing against a purchase. Defaults
   * to PERK_META[category].relevantCategories when omitted.
   */
  relevantCategories?: PurchaseCategory[]
  /** "low" perks are shown with an "unconfirmed" caveat (sources weak/conflicting). */
  confidence: "high" | "medium" | "low"
  sourceUrl?: string
}

export interface PerkCategoryMeta {
  label: string
  /** lucide-react icon name; mapped to a component in PerkIcon. */
  icon: string
  /** Purchase categories where this perk type is worth surfacing in results. */
  relevantCategories: PurchaseCategory[]
}

export const PERK_META: Record<PerkCategory, PerkCategoryMeta> = {
  airport_lounge: { label: "Airport lounge access", icon: "Sofa", relevantCategories: ["travel_air", "travel_hotel"] },
  valet_parking: { label: "Valet parking", icon: "CarFront", relevantCategories: ["instore_shopping", "dining", "grocery"] },
  car_rental: { label: "Car rental discount", icon: "Car", relevantCategories: ["travel_air", "travel_hotel"] },
  flight_discount: { label: "Flight discount / free flight", icon: "Plane", relevantCategories: ["travel_air"] },
  hotel_discount: { label: "Hotel discount", icon: "BedDouble", relevantCategories: ["travel_hotel", "travel_air"] },
  travel_insurance: { label: "Travel insurance", icon: "ShieldCheck", relevantCategories: ["travel_air", "travel_hotel"] },
  meet_and_greet: { label: "Airport meet & greet", icon: "ConciergeBell", relevantCategories: ["travel_air"] },
  concierge: { label: "Concierge service", icon: "Headset", relevantCategories: ["travel_air", "travel_hotel"] },
  cinema: { label: "Cinema offers", icon: "Clapperboard", relevantCategories: ["instore_shopping", "dining", "online_shopping"] },
  dining_offer: {
    label: "Dining & lifestyle offers",
    icon: "UtensilsCrossed",
    relevantCategories: ["dining", "online_food", "instore_shopping", "online_shopping", "online_grocery"],
  },
  golf: { label: "Golf rounds", icon: "Flag", relevantCategories: ["instore_shopping"] },
  fitness: { label: "Fitness / wellness", icon: "Dumbbell", relevantCategories: ["instore_shopping", "online_shopping"] },
  welcome_offer: { label: "Welcome / sign-up bonus", icon: "Gift", relevantCategories: [] },
  other: { label: "Other perks", icon: "Sparkles", relevantCategories: [] },
}

/** Display order for the perks browser (travel-first, then lifestyle). */
export const PERK_CATEGORY_ORDER: PerkCategory[] = [
  "airport_lounge",
  "valet_parking",
  "car_rental",
  "flight_discount",
  "hotel_discount",
  "travel_insurance",
  "meet_and_greet",
  "concierge",
  "cinema",
  "dining_offer",
  "golf",
  "fitness",
  "welcome_offer",
  "other",
]

/** Underlying Visa/Mastercard tier per card. null = not confirmed by any source. */
export const CARD_NETWORK_TIER: Record<CardId, NetworkTier | null> = {
  ADCB_365: null, // on Visa network, specific tier unconfirmed
  EI_SWITCH: "Visa Signature",
  AJMAN_ULTRACASH: "Mastercard Platinum",
  SIB_CASHBACK: "Mastercard Titanium",
  DIB_WALAA: "Visa Infinite",
  CITI_PREMIER: "Mastercard World Elite",
  FAB_TRAVEL: "Mastercard World Elite",
  DUBAI_FIRST_CASHBACK: null, // Mastercard; tier not printed on official page
}

export const CARD_PERKS: Record<CardId, CardPerk[]> = {
  ADCB_365: [
    {
      category: "cinema",
      title: "VOX Cinemas buy-1-get-1-free tickets",
      detail: "Buy-one-get-one-free movie tickets at VOX Cinemas (up to 4 free/month), redeemed via the VOX app or website.",
      partner: "VOX Cinemas",
      limit: "Up to 4 free tickets/month",
      source: "bank",
      confidence: "high",
      sourceUrl: "https://www.adcb.com/en/personal/cards/card-features/vox-cinemas-offer",
    },
    {
      category: "dining_offer",
      title: "25% off VOX candy bar + free size upgrade",
      detail: "25% off select single food & beverage items at the VOX candy bar, plus a complimentary popcorn/drink size upgrade.",
      partner: "VOX Cinemas",
      discountPct: 25,
      source: "bank",
      confidence: "high",
      sourceUrl: "https://www.adcb.com/en/personal/cards/card-features/vox-cinemas-offer",
    },
    {
      category: "hotel_discount",
      title: "Agoda hotel discount (up to 12%, tier-dependent)",
      detail:
        "Up to 12% off select hotels via the Agoda × Visa program. The exact rate depends on the card's Visa tier (Infinite/Signature/Platinum get up to 12%, Gold ~7%) — this card's tier is unconfirmed.",
      partner: "Agoda",
      discountPct: 12,
      source: "network",
      confidence: "low",
      sourceUrl: "https://www.agoda.com/visacemea",
    },
    {
      category: "welcome_offer",
      title: "AED 365 welcome cashback + first-year fee waiver",
      detail: "AED 365 welcome cashback for spending AED 5,000 in the first 45 days, plus a first-year annual fee waiver (AED 383.25 from year 2).",
      source: "bank",
      confidence: "high",
      sourceUrl: "https://www.adcb.com/en/personal/cards/credit-cards/365-cashback-card",
    },
  ],

  EI_SWITCH: [
    {
      category: "airport_lounge",
      title: "Airport lounge access (Visa Airport Companion / DragonPass)",
      detail: "Complimentary lounge access via the Visa Airport Companion (DragonPass) program, included with the Visa Signature tier.",
      partner: "Visa Airport Companion / DragonPass",
      source: "network",
      requiredTier: "Visa Signature",
      confidence: "high",
      sourceUrl: "https://www.emiratesislamic.ae/en/cards/credit-cards/switch-cashback-credit-card",
    },
    {
      category: "valet_parking",
      title: "Complimentary valet parking (1/month)",
      detail:
        "One free valet session per calendar month at malls, airports & hospitals across the UAE. Requires AED 5,000 retail spend (raised from AED 3,000 on 1 Mar 2026).",
      limit: "1 session/month · min AED 5,000 monthly spend",
      locations: ["Mall of the Emirates", "Yas Mall", "City Walk 1", "Ibn Battuta Mall", "City Centre Mirdif", "Nakheel Mall", "Dalma Mall", "& more"],
      source: "bank",
      confidence: "medium",
      sourceUrl: "https://www.emiratesislamic.ae/en/cards/credit-cards/switch-cashback-credit-card",
    },
    {
      category: "car_rental",
      title: "Up to 35% off Avis car rental",
      detail: "Up to 35% off (standard) / 30% (retail) Avis rentals, booked 24h ahead. Valid through 31 Dec 2026.",
      partner: "Avis",
      discountPct: 35,
      source: "network",
      requiredTier: "Visa Signature",
      confidence: "high",
      sourceUrl: "https://www.emiratesislamic.ae/en/cards/credit-cards/switch-cashback-credit-card",
    },
    {
      category: "hotel_discount",
      title: "Visa Luxury Hotel Collection",
      detail: "Best-available-rate plus benefits (room upgrade, breakfast, late checkout) at 900+ Visa Luxury Hotel Collection properties.",
      partner: "Visa Luxury Hotel Collection",
      source: "network",
      requiredTier: "Visa Signature",
      confidence: "high",
    },
    {
      category: "golf",
      title: "Two complimentary golf rounds/month",
      detail: "Two free golf rounds per month at select UAE courses; requires AED 5,000 retail spend, booked 5–14 days ahead.",
      limit: "2 rounds/month · min AED 5,000 spend",
      source: "bank",
      confidence: "high",
    },
    {
      category: "cinema",
      title: "Buy-1-get-1 cinema tickets + 20% Roxy",
      detail: "Two BOGO cinema tickets/month (min AED 5,000 spend) at VOX/Reel, plus 20% off tickets & F&B at Roxy Cinemas.",
      partner: "VOX / Reel / Roxy Cinemas",
      discountPct: 20,
      limit: "2 BOGO/month",
      source: "bank",
      confidence: "high",
    },
    {
      category: "meet_and_greet",
      title: "Marhaba airport meet & greet (2/year)",
      detail: "Two Marhaba meet & greet services per year; requires AED 3,000 monthly retail spend.",
      partner: "Marhaba",
      limit: "2/year",
      source: "bank",
      confidence: "high",
    },
    {
      category: "travel_insurance",
      title: "Multi-trip travel takaful",
      detail: "Complimentary multi-trip travel takaful covering accident & travel inconvenience, trips up to 90 days.",
      source: "bank",
      confidence: "high",
    },
  ],

  AJMAN_ULTRACASH: [
    {
      category: "airport_lounge",
      title: "Unlimited airport lounge access (LoungeKey + Marhaba)",
      detail: "Unlimited complimentary lounge access via LoungeKey and Marhaba across UAE, GCC and select global airports.",
      partner: "LoungeKey + Marhaba",
      limit: "Unlimited visits",
      source: "bank",
      confidence: "high",
    },
    {
      category: "valet_parking",
      title: "Complimentary valet parking (3/month)",
      detail: "Three free valet visits per calendar month at 35+ UAE locations; requires AED 5,000 monthly card spend (Platinum tier; World tier gets 4).",
      limit: "3 visits/month · min AED 5,000 spend",
      locations: ["Mall of the Emirates", "Wafi City", "Ibn Battuta Mall", "The Beach", "Dragon Mart", "Dubai Airport", "Dalma Mall", "& more"],
      source: "bank",
      requiredTier: "Mastercard Platinum",
      confidence: "medium",
    },
    {
      category: "car_rental",
      title: "20% off Avis car rental",
      detail: "Up to 20% off Avis rentals via the Mastercard Avis Preferred program (Platinum tier; World/World Elite reach up to 35%).",
      partner: "Avis",
      discountPct: 20,
      source: "network",
      requiredTier: "Mastercard Platinum",
      confidence: "high",
    },
    {
      category: "car_rental",
      title: "10% off rentalcars.com",
      detail: "10% discount on rentalcars.com bookings via the Mastercard network.",
      partner: "rentalcars.com",
      discountPct: 10,
      source: "network",
      confidence: "high",
    },
    {
      category: "flight_discount",
      title: "Up to 30% off Cleartrip",
      detail: "Up to 30% off travel bookings on Cleartrip via the Mastercard network.",
      partner: "Cleartrip",
      discountPct: 30,
      source: "network",
      confidence: "high",
    },
    {
      category: "hotel_discount",
      title: "15% off IHG Hotels & Resorts",
      detail: "15% discount at IHG Hotels & Resorts via the Mastercard network.",
      partner: "IHG Hotels & Resorts",
      discountPct: 15,
      source: "network",
      confidence: "high",
    },
    {
      category: "hotel_discount",
      title: "Up to 7% back on Booking.com",
      detail: "Up to 7% money-back (Booking.com wallet credit, ~64 days after stay) via the current Mastercard offer.",
      partner: "Booking.com",
      discountPct: 7,
      source: "network",
      confidence: "high",
    },
    {
      category: "welcome_offer",
      title: "Welcome bonus up to AED 500",
      detail: "AED 500 (UAE Nationals) / AED 300 (Expats) for one retail transaction in the first 30 days + annual fee payment. Two free supplementary cards.",
      source: "bank",
      confidence: "high",
    },
  ],

  // SIB Cashback: lounge access was discontinued 1 May 2025 and both welcome
  // promos have expired — no standing lifestyle perks currently confirmed.
  SIB_CASHBACK: [],

  DIB_WALAA: [
    {
      category: "airport_lounge",
      title: "Airport lounge access (Visa Airport Companion)",
      detail: "12 complimentary lounge visits per calendar year (cardholder + 1 guest) via Visa Airport Companion / DragonPass.",
      partner: "Visa Airport Companion / DragonPass",
      limit: "12 visits/year + 1 guest",
      source: "network",
      requiredTier: "Visa Infinite",
      confidence: "high",
      sourceUrl: "https://www.dib.ae/personal/cards/prime-infinite-card",
    },
    {
      category: "valet_parking",
      title: "Valet parking (2/month)",
      detail: "Two complimentary valet services per month at 18 key UAE locations; requires min AED 8,000 monthly spend or the fee is charged.",
      limit: "2/month · min AED 8,000 spend",
      source: "bank",
      confidence: "high",
    },
    {
      category: "car_rental",
      title: "Up to 35% off Avis",
      detail: "Up to 35% off Avis rentals (Visa Infinite/Signature tier), booked 24h ahead. Valid through 31 Dec 2026.",
      partner: "Avis",
      discountPct: 35,
      source: "network",
      requiredTier: "Visa Infinite",
      confidence: "high",
    },
    {
      category: "hotel_discount",
      title: "Visa Infinite Luxury Hotel Collection",
      detail: "Best-rate guarantee plus benefits at 900+ Visa Infinite Luxury Hotel Collection properties.",
      partner: "Visa Luxury Hotel Collection",
      source: "network",
      requiredTier: "Visa Infinite",
      confidence: "high",
    },
    {
      category: "travel_insurance",
      title: "Multi-trip travel & medical insurance",
      detail: "Up to US$500,000 cover for cardholder + spouse + up to 5 children; trips up to 90 days.",
      limit: "Up to US$500,000",
      source: "network",
      requiredTier: "Visa Infinite",
      confidence: "high",
    },
    {
      category: "concierge",
      title: "24-hour Visa Infinite concierge",
      detail: "Round-the-clock Visa Infinite concierge & lifestyle-manager service.",
      partner: "Visa Concierge",
      source: "network",
      requiredTier: "Visa Infinite",
      confidence: "high",
    },
    {
      category: "other",
      title: "Roadside assistance (5/year)",
      detail: "Up to 5 complimentary roadside-assistance services per year.",
      limit: "5/year",
      source: "bank",
      confidence: "high",
    },
  ],

  CITI_PREMIER: [
    {
      category: "airport_lounge",
      title: "Airport lounge access (Mastercard Travel Pass)",
      detail: "14 complimentary lounge visits per year (cardholder + guest) via Mastercard Travel Pass.",
      partner: "Mastercard Travel Pass",
      limit: "14 visits/year + guest",
      source: "network",
      requiredTier: "Mastercard World Elite",
      confidence: "high",
      sourceUrl: "https://www.citibank.ae/credit-cards/rewards/citi-premier-credit-card",
    },
    {
      category: "meet_and_greet",
      title: "Marhaba Bronze meet & greet (1/year)",
      detail: "One Marhaba Bronze meet & greet service per year at Dubai International Airport.",
      partner: "Marhaba",
      limit: "1/year",
      locations: ["Dubai International Airport (DXB)"],
      source: "network",
      confidence: "high",
    },
    {
      category: "other",
      title: "Complimentary Careem airport rides (4/year)",
      detail: "Four free Careem airport rides per year, up to AED 84 each (Mastercard World Elite).",
      partner: "Careem",
      limit: "4/year · up to AED 84 each",
      relevantCategories: ["travel_air"],
      source: "network",
      requiredTier: "Mastercard World Elite",
      confidence: "high",
    },
    {
      category: "flight_discount",
      title: "Up to 20% off flights on Trip.com",
      detail: "Up to 20% off flights on Trip.com (max AED 150/booking, min AED 750, 5×/year).",
      partner: "Trip.com",
      discountPct: 20,
      limit: "max AED 150/booking · 5×/year",
      source: "bank",
      confidence: "high",
    },
    {
      category: "hotel_discount",
      title: "Up to 20% off hotels on Trip.com",
      detail: "Up to 20% off hotels on Trip.com (max AED 150/booking, min AED 750, 5×/year).",
      partner: "Trip.com",
      discountPct: 20,
      limit: "max AED 150/booking · 5×/year",
      source: "bank",
      confidence: "high",
    },
    {
      category: "cinema",
      title: "30% off VOX Cinemas (4/month)",
      detail: "30% off up to 4 VOX Cinemas tickets per month.",
      partner: "VOX Cinemas",
      discountPct: 30,
      limit: "4 tickets/month",
      source: "bank",
      confidence: "high",
    },
    {
      category: "golf",
      title: "Complimentary golf round (1/month)",
      detail: "One complimentary golf round per month at select UAE courses.",
      limit: "1/month",
      source: "bank",
      confidence: "high",
    },
    {
      category: "dining_offer",
      title: "20% off Talabat (1/month)",
      detail: "20% off a Talabat grocery or food order once per month (up to AED 14).",
      partner: "Talabat",
      discountPct: 20,
      limit: "up to AED 14 · 1/month",
      source: "bank",
      confidence: "high",
    },
    {
      category: "travel_insurance",
      title: "Travel insurance + purchase protection",
      detail: "Travel accident & medical insurance plus purchase protection (up to US$2,000/claim, US$5,000/year).",
      source: "network",
      requiredTier: "Mastercard World Elite",
      confidence: "high",
    },
    {
      category: "welcome_offer",
      title: "AED 350 joining bonus",
      detail: "AED 350 statement credit for spending AED 10,000 within 60 days of card issuance.",
      source: "bank",
      confidence: "high",
    },
  ],

  FAB_TRAVEL: [
    {
      category: "airport_lounge",
      title: "Airport lounge access (Mastercard Travel Pass)",
      detail: "14 complimentary lounge visits per year via Mastercard Travel Pass, with up to 2 guests per visit.",
      partner: "Mastercard Travel Pass",
      limit: "14 visits/year",
      source: "network",
      requiredTier: "Mastercard World Elite",
      confidence: "high",
      sourceUrl: "https://www.bankfab.com/en-ae/personal/credit-cards/fab-travel-credit-card",
    },
    {
      category: "welcome_offer",
      title: "Welcome free return flight",
      detail: "A complimentary return flight to a choice of 15+ destinations on card sign-up (subject to annual fee payment).",
      source: "bank",
      confidence: "high",
    },
    {
      category: "flight_discount",
      title: "Anniversary free return flight",
      detail: "A free return flight each card anniversary on high annual spend (AED 300,000 retail in the prior year).",
      source: "bank",
      confidence: "high",
    },
    {
      category: "car_rental",
      title: "Up to 35% off Avis",
      detail: "Up to 35% off Avis car rentals.",
      partner: "Avis",
      discountPct: 35,
      source: "bank",
      confidence: "high",
    },
    {
      category: "hotel_discount",
      title: "15% off IHG Hotels & Resorts",
      detail: "15% off at 5,500+ IHG Hotels & Resorts globally.",
      partner: "IHG Hotels & Resorts",
      discountPct: 15,
      source: "bank",
      confidence: "high",
    },
    {
      category: "meet_and_greet",
      title: "Airport fast-track / security bypass",
      detail: "Complimentary airport security fast-track passes.",
      partner: "Mastercard Travel Pass",
      source: "bank",
      confidence: "high",
    },
    {
      category: "other",
      title: "Free Careem airport transfers (4/year)",
      detail: "Four complimentary Careem airport transfers per year.",
      partner: "Careem",
      limit: "4/year",
      relevantCategories: ["travel_air"],
      source: "bank",
      confidence: "high",
    },
    {
      category: "travel_insurance",
      title: "Travel medical & inconvenience insurance",
      detail: "Complimentary travel medical and travel-inconvenience cover.",
      source: "bank",
      confidence: "high",
    },
    {
      category: "concierge",
      title: "World Elite Mastercard concierge",
      detail: "24/7 World Elite Mastercard concierge service.",
      source: "network",
      requiredTier: "Mastercard World Elite",
      confidence: "high",
    },
    {
      category: "cinema",
      title: "Discounted movie tickets",
      detail: "Discounted tickets at Reel, Cine Royal and Star Cinemas.",
      partner: "Reel / Cine Royal / Star Cinemas",
      source: "bank",
      confidence: "high",
    },
    {
      category: "fitness",
      title: "25% off Fiit subscription",
      detail: "25% off a Fiit fitness subscription.",
      partner: "Fiit",
      discountPct: 25,
      source: "bank",
      confidence: "high",
    },
    {
      category: "other",
      title: "Free global roaming data",
      detail: "Complimentary global roaming data (1 GB, 3× per year) via Flexiroam.",
      partner: "Flexiroam",
      relevantCategories: ["travel_air"],
      source: "bank",
      confidence: "high",
    },
    {
      category: "other",
      title: "No foreign transaction fees",
      detail: "Zero international transaction fees on foreign-currency spend.",
      relevantCategories: ["travel_air", "travel_hotel"],
      source: "bank",
      confidence: "high",
    },
  ],

  DUBAI_FIRST_CASHBACK: [
    {
      category: "airport_lounge",
      title: "Airport lounge access (Mastercard Travel Pass)",
      detail: "Complimentary lounge access via the Mastercard Travel Pass app. Visit count is tier-dependent (World ~8/yr, World Elite ~14/yr) and the card's tier isn't printed on the official page.",
      partner: "Mastercard Travel Pass",
      source: "network",
      confidence: "medium",
      sourceUrl: "https://www.dubaifirst.com/en-ae/cashback-credit-card",
    },
    {
      category: "cinema",
      title: "Up to 4 VOX tickets/month from AED 20",
      detail: "Up to 4 VOX Cinemas tickets per month from AED 20 (incl. drink & popcorn upgrades); requires AED 4,000 spend the previous month.",
      partner: "VOX Cinemas",
      limit: "4/month · min AED 4,000 prior-month spend",
      source: "bank",
      confidence: "high",
    },
    {
      category: "dining_offer",
      title: "20% off Talabat",
      detail: "20% off Talabat food & grocery delivery.",
      partner: "Talabat",
      discountPct: 20,
      source: "bank",
      confidence: "high",
    },
    {
      category: "car_rental",
      title: "Car rental discounts (Mastercard Priceless)",
      detail: "Avis and Rentalcars.com discounts via Mastercard Priceless.",
      partner: "Avis / Rentalcars.com",
      source: "network",
      confidence: "medium",
    },
    {
      category: "hotel_discount",
      title: "Hotel discounts (Mastercard Priceless)",
      detail: "IHG and Booking.com offers via Mastercard Priceless.",
      partner: "IHG / Booking.com",
      source: "network",
      confidence: "medium",
    },
    {
      category: "fitness",
      title: "25% off Fiit.tv subscription",
      detail: "25% off the first Fiit.tv subscription.",
      partner: "Fiit.tv",
      discountPct: 25,
      source: "bank",
      confidence: "high",
    },
    {
      category: "other",
      title: "50% off Go Gamers Premium",
      detail: "50% off a Go Gamers Premium membership.",
      partner: "Go Gamers",
      discountPct: 50,
      relevantCategories: ["online_shopping", "instore_shopping"],
      source: "bank",
      confidence: "high",
    },
  ],
}

/** Resolve the purchase categories a perk should surface against. */
export function perkRelevantCategories(perk: CardPerk): PurchaseCategory[] {
  return perk.relevantCategories ?? PERK_META[perk.category].relevantCategories
}

/** Perks for a card that are worth surfacing against a given purchase category. */
export function relevantPerksForPurchase(cardId: CardId, category: PurchaseCategory): CardPerk[] {
  return CARD_PERKS[cardId].filter((p) => perkRelevantCategories(p).includes(category))
}

export interface CardPerkGroup {
  cardId: CardId
  perks: CardPerk[]
}

/** Reverse lookup: which of the given cards offer a perk in this category. */
export function cardsWithPerk(category: PerkCategory, cardIds: CardId[]): CardPerkGroup[] {
  return cardIds
    .map((cardId) => ({ cardId, perks: CARD_PERKS[cardId].filter((p) => p.category === category) }))
    .filter((g) => g.perks.length > 0)
}

/** Perk categories that at least one of the given cards offers, in display order. */
export function availablePerkCategories(cardIds: CardId[]): PerkCategory[] {
  const present = new Set<PerkCategory>()
  for (const cardId of cardIds) {
    for (const p of CARD_PERKS[cardId]) present.add(p.category)
  }
  return PERK_CATEGORY_ORDER.filter((c) => present.has(c))
}
