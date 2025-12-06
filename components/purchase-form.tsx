"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { PurchaseInput, Location, Channel, PurchaseCategory } from "@/lib/cards"
import { SearchableCategorySelect } from "@/components/searchable-category-select"

interface PurchaseFormProps {
  onSubmit: (purchase: PurchaseInput) => void
}

type PresetId = "groceries" | "fuel" | "dining" | "amazon" | "bills" | "travel_flight" | "travel_hotel"

const PRESETS: { id: PresetId; label: string }[] = [
  { id: "groceries", label: "Groceries" },
  { id: "fuel", label: "Fuel" },
  { id: "dining", label: "Dining" },
  { id: "amazon", label: "Amazon / Noon" },
  { id: "bills", label: "Bills / Utilities" },
  { id: "travel_flight", label: "Flight" },
  { id: "travel_hotel", label: "Hotel" },
]

function inferChannelForCategory(category: PurchaseCategory): Channel {
  switch (category) {
    case "online_food":
    case "online_grocery":
    case "online_shopping":
      return "online"
    default:
      return "pos"
  }
}

function inferLocationForCategory(category: PurchaseCategory): Location {
  switch (category) {
    case "travel_air":
    case "travel_hotel":
      return "international"
    default:
      return "domestic"
  }
}

const LAST_INPUT_KEY = "whichcard:lastInput"

export function PurchaseForm({ onSubmit }: PurchaseFormProps) {
  const [amount, setAmount] = useState("")
  const [location, setLocation] = useState<Location>("domestic")
  const [channel, setChannel] = useState<Channel>("pos")
  const [category, setCategory] = useState<PurchaseCategory>("grocery")
  const [error, setError] = useState("")

  const [channelTouched, setChannelTouched] = useState(false)
  const [locationTouched, setLocationTouched] = useState(false)

  const [activePreset, setActivePreset] = useState<PresetId | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_INPUT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.amount) setAmount(parsed.amount)
        if (parsed.location) setLocation(parsed.location)
        if (parsed.channel) setChannel(parsed.channel)
        if (parsed.category) setCategory(parsed.category)
        setChannelTouched(true)
        setLocationTouched(true)
      }
    } catch {
      // Ignore parse errors
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(LAST_INPUT_KEY, JSON.stringify({ amount, location, channel, category }))
    } catch {
      // Ignore storage errors
    }
  }, [amount, location, channel, category])

  const handleCategoryChange = (nextCategory: PurchaseCategory) => {
    setCategory(nextCategory)
    setActivePreset(null)

    if (!channelTouched) {
      setChannel(inferChannelForCategory(nextCategory))
    }
    if (!locationTouched) {
      setLocation(inferLocationForCategory(nextCategory))
    }
  }

  const handleChannelChange = (nextChannel: Channel) => {
    setChannelTouched(true)
    setChannel(nextChannel)
    setActivePreset(null)
  }

  const handleLocationChange = (nextLocation: Location) => {
    setLocationTouched(true)
    setLocation(nextLocation)
    setActivePreset(null)
  }

  const applyPreset = (preset: PresetId) => {
    setChannelTouched(false)
    setLocationTouched(false)
    setActivePreset(preset)

    switch (preset) {
      case "amazon":
        setCategory("online_shopping")
        setChannel("online")
        setLocation("domestic")
        break
      case "fuel":
        setCategory("fuel")
        setChannel("wallet")
        setLocation("domestic")
        break
      case "groceries":
        setCategory("grocery")
        setChannel("pos")
        setLocation("domestic")
        break
      case "dining":
        setCategory("dining")
        setChannel("pos")
        setLocation("domestic")
        break
      case "bills":
        setCategory("utilities")
        setChannel("online")
        setLocation("domestic")
        break
      case "travel_flight":
        setCategory("travel_air")
        setChannel("online")
        setLocation("international")
        break
      case "travel_hotel":
        setCategory("travel_hotel")
        setChannel("online")
        setLocation("international")
        break
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const parsedAmount = Number.parseFloat(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a positive amount")
      return
    }

    onSubmit({
      amountAED: parsedAmount,
      location,
      channel,
      category,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">What should I pay with?</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Quick scenarios</Label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.id}
                  type="button"
                  variant={activePreset === preset.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyPreset(preset.id)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (AED)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label>Purchase category</Label>
            <SearchableCategorySelect value={category} onChange={handleCategoryChange} />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label>Location</Label>
            <RadioGroup
              value={location}
              onValueChange={(v) => handleLocationChange(v as Location)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="domestic" id="loc-domestic" />
                <Label htmlFor="loc-domestic" className="font-normal cursor-pointer">
                  Inside UAE (AED)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="international" id="loc-intl" />
                <Label htmlFor="loc-intl" className="font-normal cursor-pointer">
                  Outside UAE / foreign currency
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Channel */}
          <div className="space-y-3">
            <Label>How are you paying?</Label>
            <RadioGroup
              value={channel}
              onValueChange={(v) => handleChannelChange(v as Channel)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pos" id="ch-pos" />
                <Label htmlFor="ch-pos" className="font-normal cursor-pointer">
                  In-store with card
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="ch-online" />
                <Label htmlFor="ch-online" className="font-normal cursor-pointer">
                  Online / in-app
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wallet" id="ch-wallet" />
                <Label htmlFor="ch-wallet" className="font-normal cursor-pointer">
                  Apple / Samsung / Google Pay (wallet)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full">
            Find best card
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
