import type { CardResult } from "./cards"
import { CARD_TERMS } from "./cards"

export interface RunnerUpReason {
  /** Short headline that explains why to consider the runner-up. */
  headline: string
  /** AED difference between best and runner-up. Negative if runner-up is somehow ahead (won't happen with current sort). */
  deltaAED: number
  /** Same as delta but as a percentage of best's reward (0 if best is zero). */
  deltaPct: number
}

/**
 * Build a context-aware "use this instead if..." reason for the runner-up card.
 *
 * Priority order:
 *  1. If the best card has a per-month cap, lead with "use the runner-up once you hit it".
 *  2. If best/runner-up use different reward currencies, mention the currency trade-off.
 *  3. If the AED gap is small (< 5% of best), call it a close alternative.
 *  4. Fallback: generic close-second framing.
 */
export function getRunnerUpReason(best: CardResult, runnerUp: CardResult): RunnerUpReason {
  const deltaAED = best.rewardValueAED - runnerUp.rewardValueAED
  const deltaPct = best.rewardValueAED > 0 ? deltaAED / best.rewardValueAED : 0

  const bestTerms = CARD_TERMS[best.cardId]
  const runnerTerms = CARD_TERMS[runnerUp.cardId]

  // 1. Cap-aware suggestion — most actionable
  if (bestTerms.monthlyCapAED !== null) {
    const capLabel = bestTerms.monthlyCapNote ?? `AED ${bestTerms.monthlyCapAED}/mo cap`
    return {
      headline: `Use ${runnerUp.cardName} once you're at ${best.cardName}'s ${capLabel}.`,
      deltaAED,
      deltaPct,
    }
  }

  // 2. Different reward currencies — non-trivial trade-off
  if (bestTerms.rewardCurrency !== runnerTerms.rewardCurrency) {
    return {
      headline: `${runnerUp.cardName} pays in ${runnerTerms.rewardCurrency} — pick this if you prefer it over ${bestTerms.rewardCurrency}.`,
      deltaAED,
      deltaPct,
    }
  }

  // 3. Close gap — worth knowing for backup
  if (deltaPct < 0.05) {
    return {
      headline: `Close runner-up — only AED ${deltaAED.toFixed(2)} behind ${best.cardName}.`,
      deltaAED,
      deltaPct,
    }
  }

  // 4. Fallback
  return {
    headline: `Backup if ${best.cardName} isn't accepted or you can't use it.`,
    deltaAED,
    deltaPct,
  }
}
