"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, X } from "lucide-react"
import { hasConsentDecision, setConsent, getConsentFromStorage, clearConsent, type ConsentLevel } from "@/lib/consent"

interface ConsentBannerProps {
  /** Called when user makes a consent decision */
  onConsentChange?: (level: ConsentLevel) => void
}

export function ConsentBanner({ onConsentChange }: ConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentConsent, setCurrentConsent] = useState<ConsentLevel | null>(null)

  useEffect(() => {
    // Check if user has already made a decision
    const hasDecision = hasConsentDecision()
    setShowBanner(!hasDecision)
    setCurrentConsent(getConsentFromStorage())
  }, [])

  const handleConsent = (level: ConsentLevel) => {
    setConsent(level)
    setCurrentConsent(level)
    setShowBanner(false)
    setShowSettings(false)
    onConsentChange?.(level)
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
    setShowBanner(false)
  }

  const handleResetConsent = () => {
    clearConsent()
    setCurrentConsent(null)
    setShowBanner(true)
    setShowSettings(false)
  }

  // Consent settings dialog
  if (showSettings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setShowSettings(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Manage how we collect and use your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Current setting:{" "}
                <span className="font-medium text-foreground">
                  {currentConsent === "full"
                    ? "Full logging enabled"
                    : currentConsent === "none"
                      ? "Logging disabled"
                      : "Not set"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant={currentConsent === "full" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleConsent("full")}
              >
                Allow full logging
              </Button>
              <p className="text-xs text-muted-foreground pl-4">
                Includes: purchase amount, category, best card, IP address, browser info, and approximate location
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant={currentConsent === "none" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleConsent("none")}
              >
                Disable logging
              </Button>
              <p className="text-xs text-muted-foreground pl-4">No data will be logged. The app works the same way.</p>
            </div>

            {currentConsent && (
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleResetConsent}>
                Reset and show banner again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Initial consent banner
  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
      <Card className="mx-auto max-w-lg shadow-lg border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 space-y-3">
              <p className="text-sm">
                We use analytics to collect information about how you use this app. With your consent, we may also collect technical data to help improve the service. You can change your consent at any time.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleConsent("full")}>
                  Allow full logging
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleConsent("none")}>
                  Only essential
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={handleOpenSettings}>
                  More options
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Small button to reopen consent settings.
 * Place this in the footer or settings area.
 */
export function ConsentSettingsButton() {
  const [showSettings, setShowSettings] = useState(false)
  const [currentConsent, setCurrentConsent] = useState<ConsentLevel | null>(null)

  useEffect(() => {
    setCurrentConsent(getConsentFromStorage())
  }, [])

  const handleConsent = (level: ConsentLevel) => {
    setConsent(level)
    setCurrentConsent(level)
    setShowSettings(false)
  }

  const handleResetConsent = () => {
    clearConsent()
    setCurrentConsent(null)
    setShowSettings(false)
    // Force page reload to show banner
    window.location.reload()
  }

  if (showSettings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setShowSettings(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Manage how we collect and use your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Current setting:{" "}
                <span className="font-medium text-foreground">
                  {currentConsent === "full"
                    ? "Full logging enabled"
                    : currentConsent === "none"
                      ? "Logging disabled"
                      : "Not set"}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant={currentConsent === "full" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleConsent("full")}
              >
                Allow full logging
              </Button>
              <p className="text-xs text-muted-foreground pl-4">
                Includes: purchase amount, category, best card, IP address, browser info, and approximate location
              </p>
            </div>

            <div className="space-y-2">
              <Button
                variant={currentConsent === "none" ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleConsent("none")}
              >
                Disable logging
              </Button>
              <p className="text-xs text-muted-foreground pl-4">No data will be logged. The app works the same way.</p>
            </div>

            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleResetConsent}>
              Reset consent choice
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowSettings(true)}
      className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
    >
      Privacy & consent settings
    </button>
  )
}
