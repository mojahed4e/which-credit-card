"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PurchaseForm } from "@/components/purchase-form"
import { ResultsDisplay } from "@/components/results-display"
import { CardSettingsPanel } from "@/components/card-settings-panel"
import {
  computeBestCard,
  DEFAULT_SETTINGS,
  type CardSettings,
  type PurchaseInput,
  type ComputeResult,
} from "@/lib/cards"

const STORAGE_KEY = "which-card-settings"

export default function Home() {
  const [settings, setSettings] = useState<CardSettings>(DEFAULT_SETTINGS)
  const [result, setResult] = useState<ComputeResult | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CardSettings
        setSettings(parsed)
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, [])

  const handleSettingsSave = (newSettings: CardSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    // Re-compute if we have a previous result
    if (result) {
      // We don't have the last purchase stored, so clear result
      setResult(null)
    }
  }

  const handlePurchaseSubmit = (purchase: PurchaseInput) => {
    const computed = computeBestCard(purchase, settings)
    setResult(computed)
  }

  return (
    <main className="min-h-screen bg-background pwa-safe-bottom">
      <header className="bg-brand-header text-brand-header-foreground pwa-safe-top">
        <div className="container mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="https://www.raqm.ae"
              target="_blank"
              rel="noreferrer"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <span className="text-xl font-semibold tracking-wide">RAQM</span>
            </Link>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-tight">Which Card?</span>
              <span className="text-xs text-white/60">by RAQM</span>
            </div>
          </div>
          <CardSettingsPanel settings={settings} onSave={handleSettingsSave} />
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-6">
        {/* Purchase form */}
        <PurchaseForm onSubmit={handlePurchaseSubmit} />

        {/* Results */}
        {result && <ResultsDisplay result={result} />}
      </div>
    </main>
  )
}
