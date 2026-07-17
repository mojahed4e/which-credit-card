// Re-runnable research workflow for refreshing the card PERKS catalog (lib/perks.ts).
//
// Usage (in Claude Code): ask Claude to run this file with the Workflow tool, e.g.
//   "Run docs/workflows/refresh-card-perks.workflow.js and update lib/perks.ts with the
//    verified results, applying the honesty rules in docs/refreshing-card-data.md"
//
// It fans out one research agent per card, adversarially verifies the high-risk claims
// (valet at named malls, specific discount %s), then synthesizes the taxonomy +
// perk->purchase-category relevance map. The research agents need web access.
//
// See docs/refreshing-card-data.md for the full methodology, sources, and honesty rules.

export const meta = {
  name: 'uae-card-perks-research',
  description: 'Research + verify non-reward cardholder perks (valet, lounge, car-rental/flight/hotel discounts) for the 9 UAE cards, then synthesize a taxonomy + purchase-context relevance map',
  phases: [
    { title: 'Research', detail: 'one agent per card — bank + network-tier benefits' },
    { title: 'Verify', detail: 'adversarially check valet/location + named-partner discount claims' },
    { title: 'Synthesize', detail: 'taxonomy + purchase-category relevance map + data-quality notes' },
  ],
}

const PERK_ITEM = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['valet_parking','airport_lounge','car_rental','flight_discount','hotel_discount','dining_offer','cinema','golf','concierge','travel_insurance','fitness','welcome_offer','meet_and_greet','other'],
    },
    title: { type: 'string' },
    detail: { type: 'string' },
    partner: { type: 'string' },
    locations: { type: 'array', items: { type: 'string' } },
    discountPct: { type: 'number' },
    limit: { type: 'string' },
    via: { type: 'string', enum: ['bank','network','unknown'] },
    networkTier: { type: 'string' },
    sourceUrl: { type: 'string' },
    confidence: { type: 'string', enum: ['high','medium','low'] },
  },
  required: ['category','title','detail','confidence'],
}

const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    cardId: { type: 'string' },
    cardName: { type: 'string' },
    perks: { type: 'array', items: PERK_ITEM },
    notes: { type: 'string' },
  },
  required: ['cardId','cardName','perks'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    cardId: { type: 'string' },
    cardName: { type: 'string' },
    verifiedPerks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          title: { type: 'string' },
          detail: { type: 'string' },
          partner: { type: 'string' },
          locations: { type: 'array', items: { type: 'string' } },
          discountPct: { type: 'number' },
          limit: { type: 'string' },
          via: { type: 'string' },
          networkTier: { type: 'string' },
          sourceUrl: { type: 'string' },
          verified: { type: 'boolean' },
          correction: { type: 'string' },
        },
        required: ['category','title','verified'],
      },
    },
    summary: { type: 'string' },
  },
  required: ['cardId','cardName','verifiedPerks'],
}

const CARDS = [
  { cardId: 'ADCB_365', cardName: 'ADCB 365 Cashback', bank: 'Abu Dhabi Commercial Bank', url: 'https://www.adcb.com/en/personal/cards/credit-cards/365-cashback-card' },
  { cardId: 'EI_SWITCH', cardName: 'Emirates Islamic SWITCH', bank: 'Emirates Islamic', url: 'https://www.emiratesislamic.ae/en/cards/credit-cards/switch-cashback-credit-card' },
  { cardId: 'AJMAN_ULTRACASH', cardName: 'Ajman Bank ULTRACASH', bank: 'Ajman Bank', url: 'https://www.ajmanbank.ae/site/mastercard_ultracash/en' },
  { cardId: 'SIB_CASHBACK', cardName: 'SIB Cashback', bank: 'Sharjah Islamic Bank', url: 'https://www.sib.ae/en/Cashback' },
  { cardId: 'DIB_WALAA', cardName: 'DIB Prime Infinite (Wala\'a)', bank: 'Dubai Islamic Bank', url: 'https://www.dib.ae/personal/cards/prime-infinite-card' },
  { cardId: 'CITI_PREMIER', cardName: 'Citi Premier', bank: 'Citibank', url: 'https://www.citibank.ae/credit-cards/rewards/citi-premier-credit-card' },
  { cardId: 'FAB_TRAVEL', cardName: 'FAB Travel', bank: 'First Abu Dhabi Bank', url: 'https://www.bankfab.com/en-ae/personal/credit-cards/fab-travel-credit-card' },
  { cardId: 'DUBAI_FIRST_CASHBACK', cardName: 'Dubai First Cashback', bank: 'Dubai First', url: 'https://www.dubaifirst.com/en-ae/cashback-credit-card' },
  { cardId: 'ENBD_DARNA_SIGNATURE', cardName: 'Emirates NBD Darna Signature', bank: 'Emirates NBD', url: 'https://www.emiratesnbd.com/en/cards/credit-cards/darna-visa-signature-credit-card' },
  { cardId: 'ADIB_GOLD_DEBIT', cardName: 'ADIB Gold Signature Debit', bank: 'Abu Dhabi Islamic Bank', url: 'https://www.adib.ae/en/personal/priority-banking/gold/lifestyle-benefits' },
]

const APP_CATEGORIES = 'grocery, online_grocery, dining, online_food, fuel, utilities, government, education, online_shopping, instore_shopping, travel_air, travel_hotel, other'

const researched = await pipeline(
  CARDS,
  (card) =>
    agent(
      `You are researching the NON-REWARD cardholder PERKS / BENEFITS of "${card.cardName}" (${card.bank}, UAE). ` +
        `Reward/cashback RATES are already covered elsewhere — IGNORE them. Focus ONLY on lifestyle & travel benefits: ` +
        `free/discounted VALET PARKING (and which specific malls), AIRPORT LOUNGE access (which program e.g. LoungeKey/Priority Pass, how many free visits/year, guests), ` +
        `CAR RENTAL discounts (which partner e.g. Avis/Hertz, what %), FLIGHT booking discounts or free-flight vouchers, HOTEL discounts (which chain e.g. IHG/Marriott, what %), ` +
        `dining offers, cinema tickets, golf, concierge, travel insurance, airport transfers (Careem etc.), meet-and-greet, fitness/gym, and welcome/sign-up offers.\n\n` +
        `CRITICAL distinction: many UAE perks (valet, lounge) are NETWORK-TIER benefits of the underlying Visa Infinite / Visa Signature / Mastercard World / Mastercard World Elite card, NOT bank-specific. ` +
        `For each perk, set "via" to "bank" or "network" and put the tier in "networkTier" when it's a network benefit.\n\n` +
        `Start at ${card.url}. Then run web searches like "${card.cardName} benefits valet parking lounge UAE", "${card.cardName} Visa Infinite / Mastercard benefits", and check the card's network-tier benefits page. ` +
        `Cross-reference at least 2 sources where you can. Be CONSERVATIVE: if you cannot confirm a perk, set confidence "low" rather than inventing it — do NOT hallucinate specific mall names or discount percentages. ` +
        `Capture a sourceUrl per perk. Return the structured object (cardId="${card.cardId}").`,
      { label: `research:${card.cardId}`, phase: 'Research', schema: RESEARCH_SCHEMA },
    ),
  (research, card) => {
    if (!research || !research.perks || research.perks.length === 0) {
      return { cardId: card.cardId, cardName: card.cardName, verifiedPerks: [], summary: 'No perks found in research stage.' }
    }
    const perkList = research.perks
      .map((p, i) => `${i + 1}. [${p.category}] ${p.title} — ${p.detail}${p.partner ? ` (partner: ${p.partner})` : ''}${p.locations && p.locations.length ? ` (locations: ${p.locations.join(', ')})` : ''}${p.discountPct ? ` (${p.discountPct}%)` : ''} [confidence: ${p.confidence}, via: ${p.via || 'unknown'}]`)
      .join('\n')
    return agent(
      `Adversarially VERIFY these claimed perks for "${card.cardName}" (${card.bank}, UAE). ` +
        `Your job is to catch STALE or HALLUCINATED claims — especially (a) free valet parking at named malls, and (b) specific car-rental/hotel discount percentages and partners. ` +
        `These expire often and are frequently network-tier benefits mistaken for card-specific ones.\n\n` +
        `Claimed perks:\n${perkList}\n\n` +
        `For EACH perk, search for a corroborating source. Set verified=true ONLY if you find supporting evidence; otherwise verified=false. ` +
        `If a detail is outdated or wrong (e.g. wrong mall, wrong %), set verified=false and put the corrected fact in "correction". ` +
        `Keep accurate perks with their details intact. Default to verified=false when uncertain. Return structured (cardId="${card.cardId}").`,
      { label: `verify:${card.cardId}`, phase: 'Verify', schema: VERIFY_SCHEMA },
    )
  },
)

const clean = researched.filter(Boolean)
const flatForSynthesis = clean.map((c) => ({
  cardId: c.cardId,
  cardName: c.cardName,
  perks: (c.verifiedPerks || []).map((p) => ({
    category: p.category, title: p.title, partner: p.partner, locations: p.locations,
    discountPct: p.discountPct, limit: p.limit, via: p.via, networkTier: p.networkTier, verified: p.verified,
  })),
}))

phase('Synthesize')
const synthesis = await agent(
  `You are designing the data model for a UAE credit-card advisor app that wants to add a "card perks" feature ` +
    `(valet parking, lounge access, car-rental / flight / hotel discounts, etc.) on top of its existing per-transaction reward calculator.\n\n` +
    `Here are the VERIFIED perks across 9 cards as JSON:\n${JSON.stringify(flatForSynthesis, null, 2)}\n\n` +
    `Produce a structured design artifact:\n` +
    `1. taxonomy: the final list of perk categories that actually occur in the data, each with a short human label and a suggested lucide-react icon name.\n` +
    `2. relevanceMap: for each perk category, which of the app's PURCHASE categories make it worth surfacing in the results screen. The app's purchase categories are exactly: ${APP_CATEGORIES}. (e.g. car_rental + flight_discount + hotel_discount + airport_lounge + travel_insurance are relevant to travel_air / travel_hotel; valet_parking + cinema + dining_offer relevant to instore_shopping / dining.)\n` +
    `3. networkVsBank: a short note on which perk categories tend to be network-tier (Visa Infinite / Mastercard World Elite) vs genuinely bank-specific, and the design implication (perks may need to attach to a card's network tier, not just the card).\n` +
    `4. dataQuality: which specific claims were weak/unverified and should be marked low-confidence or omitted in the app.\n` +
    `5. topPerksPerCard: a compact one-line headline of the single most compelling perk for each of the 9 cards (or "none notable").`,
  {
    label: 'synthesize:design',
    phase: 'Synthesize',
    schema: {
      type: 'object',
      properties: {
        taxonomy: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, label: { type: 'string' }, icon: { type: 'string' } }, required: ['category','label'] } },
        relevanceMap: { type: 'array', items: { type: 'object', properties: { category: { type: 'string' }, relevantPurchaseCategories: { type: 'array', items: { type: 'string' } } }, required: ['category','relevantPurchaseCategories'] } },
        networkVsBank: { type: 'string' },
        dataQuality: { type: 'string' },
        topPerksPerCard: { type: 'array', items: { type: 'object', properties: { cardId: { type: 'string' }, headline: { type: 'string' } }, required: ['cardId','headline'] } },
      },
      required: ['taxonomy','relevanceMap','networkVsBank','dataQuality','topPerksPerCard'],
    },
  },
)

return { perCard: clean, synthesis }
