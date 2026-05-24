"use client"

import { useEffect, useState } from "react"
import { Download, Smartphone, X, Share } from "lucide-react"

const DISMISSED_KEY = "whichcard:install-dismissed"
/** Don't pester users repeatedly. After dismissal we wait this many days before showing again. */
const DISMISSAL_TTL_DAYS = 30

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  // Safari iOS uses a non-standard property on `navigator`.
  return Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
}

function loadDismissedAt(): number | null {
  if (typeof localStorage === "undefined") return null
  const raw = localStorage.getItem(DISMISSED_KEY)
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function InstallPrompt() {
  // The native install event (Android Chrome / desktop Chromium).
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  // iOS gets a manual instructional banner since beforeinstallprompt doesn't fire there.
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isStandalone()) return // Already installed, nothing to show.

    const dismissedAt = loadDismissedAt()
    if (dismissedAt && Date.now() - dismissedAt < DISMISSAL_TTL_DAYS * 24 * 60 * 60 * 1000) {
      setDismissed(true)
      return
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall)

    // For iOS Safari we fall back to a manual hint.
    if (isIOS()) {
      setShowIosHint(true)
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setDismissed(true)
    setInstallEvent(null)
    setShowIosHint(false)
  }

  const handleNativeInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === "accepted") {
      // The app is now installed; remove the prompt for good.
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    }
    setInstallEvent(null)
  }

  if (dismissed) return null
  if (!installEvent && !showIosHint) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pwa-safe-bottom px-3 pb-3 pointer-events-none">
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card text-card-foreground shadow-lg p-3 pointer-events-auto">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-md bg-primary/10 text-primary p-2">
            {installEvent ? <Download className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Install Which Card?</p>
            {installEvent ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Add to your home screen for one-tap access. Your card settings and history will be saved permanently —
                no more re-configuring after iOS clears Safari data.
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Tap the <Share className="inline-block h-3 w-3 align-text-bottom mx-0.5" /> Share icon in Safari, then{" "}
                <strong>&quot;Add to Home Screen&quot;</strong>. Your card preferences will then be remembered forever
                (Safari otherwise wipes them after 7 idle days).
              </p>
            )}
            {installEvent && (
              <button
                type="button"
                onClick={handleNativeInstall}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 hover:bg-primary/90"
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
