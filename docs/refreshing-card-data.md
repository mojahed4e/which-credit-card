# Refreshing card data (rates, terms & perks)

All card data in this app — reward rates, fees, caps, T&C links, and perks — is
**hand-verified against the issuing banks' own pages**, not scraped live. Bank
terms change often (rates get refreshed, perks expire, lounge programs get
discontinued), so the data carries `lastVerified` / `PERKS_VERIFIED_ON` dates
and the UI shows them. This doc explains where the data lives and how to refresh
it.

## Where the data lives

| File | What it holds |
|------|---------------|
| [`lib/cards.ts`](../lib/cards.ts) | Reward calculators, `CARD_TERMS` (bank, fees, min salary, monthly caps, key terms, redemption guides, `lastVerified`), `CARD_NAMES` |
| [`lib/categories.ts`](../lib/categories.ts) | Purchase categories, search keywords, MCC reality-check quirks |
| [`lib/perks.ts`](../lib/perks.ts) | `CARD_PERKS` catalog, `CARD_NETWORK_TIER`, perk taxonomy + relevance map, `PERKS_VERIFIED_ON` |
| [`test/cards.test.ts`](../test/cards.test.ts) | 52 fuzz fixtures that pin every calculator path — run after any rate change |

## Where the numbers come from

For each of the 9 cards we cross-reference **at least two** of:

1. **The bank's official product page** (the `productUrl` in `CARD_TERMS`).
2. **The official Terms & Conditions / Key Fact Statement PDF** (the `tncUrl`).
   This is the authoritative source for rates, caps and exclusions.
3. **The card's Visa/Mastercard network-tier benefits page.** Critically, many
   UAE perks (airport lounge, valet, Avis discount, concierge, travel insurance)
   are **network-tier** benefits of the underlying Visa Infinite / Visa Signature
   / Mastercard World / World Elite card — *not* the bank's own program. They
   recur identically across unrelated banks, gated by tier. This is why
   `lib/perks.ts` stores `CARD_NETWORK_TIER` per card and tags each perk with
   `source: "bank" | "network"` + `requiredTier`.
4. **Aggregator/review sites** (kredit.ae, soulwallet, mymoneysouq, masarif,
   paisabazaar) — used **only to cross-check**, never as the sole source, since
   they go stale and sometimes copy each other's errors.

Some bank sites (ADCB, SIB) block automated fetching with HTTP 403 — for those,
verify in a browser or via the cached PDF.

## The honesty rules (important)

These are enforced in the data, not just aspirational:

- **Omit expired/contradicted claims entirely.** e.g. SIB's lounge access was
  discontinued 1 May 2025 → SIB has an empty perks array, not a stale perk.
  Dubai First's Amazon welcome offer deadline (31 May 2026) has passed → omitted.
- **Mark weak claims `confidence: "low"`** (rendered with an "unconfirmed"
  caveat) rather than stating them as fact. e.g. ADCB Agoda "up to 12%" is
  tier-dependent and the card's Visa tier is unconfirmed.
- **Never fold perk value into the reward `%`.** Perks answer "what do I get for
  *owning* this card", which is a different question than the per-transaction
  reward rate. Mixing them would mislead (see the FAB Travel note below).
- **Label network-tier perks honestly** ("Mastercard World Elite") vs bank perks
  ("Bank offer") so a network benefit isn't passed off as the bank's own.
- **Points are points, not cashback.** FAB Travel's "12%" is paid in FAB Rewards
  points; its realised AED value depends on the redemption rate
  (`fabRewardValuePerPointAED`), so it's modelled as `rewardType: "points"`.

## How the perks data was gathered (the workflow)

The perk catalog was built with a multi-agent research workflow:
**[`docs/workflows/refresh-card-perks.workflow.js`](workflows/refresh-card-perks.workflow.js)**.

It runs three phases:

1. **Research** — one agent per card (8 in parallel). Each agent reads the
   bank's product page + searches for the card's benefits and its Visa/Mastercard
   tier benefits, and returns structured perks (category, partner, discount %,
   limit, `via` bank/network, `networkTier`, source URL, confidence).
2. **Verify** — an adversarial pass per card that re-checks the **high-risk**
   claims (valet at named malls, specific discount %s) against a second source.
   Defaults to `verified: false` when it can't corroborate — this is what keeps
   stale/hallucinated perks out.
3. **Synthesize** — one agent normalizes the taxonomy, builds the
   perk → purchase-category relevance map, and flags which perks are network-tier
   vs bank-specific.

The same research-then-adversarially-verify pattern was used for the rate/terms
verification in `CARD_TERMS`.

### Re-running it (in Claude Code)

With this repo open in Claude Code, ask Claude to run the workflow:

```
Run docs/workflows/refresh-card-perks.workflow.js and update lib/perks.ts
with the verified results — apply the honesty rules in docs/refreshing-card-data.md.
```

Claude invokes the `Workflow` tool with that script (it needs web access for the
research agents). Review the diff — **do not blind-apply**: the verify stage's
job is to surface uncertainty, and a human should make the omit/low-confidence
calls before the data ships. Then bump `PERKS_VERIFIED_ON` (and the relevant
`lastVerified` dates in `CARD_TERMS`) to the date you re-verified, and run
`pnpm test`.

### Re-running it manually (no workflow tooling)

The workflow is just a structured version of: for each card, open the bank
product page + the T&C PDF + the Visa/Mastercard tier benefits page, extract the
perks, cross-check one aggregator, and apply the honesty rules above. The
[script](workflows/refresh-card-perks.workflow.js) is the canonical checklist of
what to capture per perk.

## Suggested cadence

- **Rates/terms:** re-verify every ~6 months, or when a bank announces a change.
  (ADCB has announced a 365 Cashback refresh effective **1 July 2026** — re-verify
  after that date.)
- **Perks:** re-verify every ~3 months — they expire faster than rates.
