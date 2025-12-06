"use client"

import { useState, useEffect } from "react"
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
import { CreditCard } from "lucide-react"

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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Which Card?</h1>
          </div>
          <CardSettingsPanel settings={settings} onSave={handleSettingsSave} />
        </header>

        {/* Purchase form */}
        <PurchaseForm onSubmit={handlePurchaseSubmit} />

        {/* Results */}
        {result && <ResultsDisplay result={result} />}
      </div>
    </main>
  )
}
