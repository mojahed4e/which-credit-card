"use client"

import {
  Sofa,
  CarFront,
  Car,
  Plane,
  BedDouble,
  ShieldCheck,
  ConciergeBell,
  Headset,
  Clapperboard,
  UtensilsCrossed,
  Flag,
  Dumbbell,
  Gift,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import type { PerkCategory } from "@/lib/perks"
import { PERK_META } from "@/lib/perks"

// Static map so the bundler can tree-shake; PERK_META stores icon names as strings.
const ICONS: Record<string, LucideIcon> = {
  Sofa,
  CarFront,
  Car,
  Plane,
  BedDouble,
  ShieldCheck,
  ConciergeBell,
  Headset,
  Clapperboard,
  UtensilsCrossed,
  Flag,
  Dumbbell,
  Gift,
  Sparkles,
}

interface PerkIconProps {
  category: PerkCategory
  className?: string
}

export function PerkIcon({ category, className = "h-4 w-4" }: PerkIconProps) {
  const Icon = ICONS[PERK_META[category].icon] ?? Sparkles
  return <Icon className={className} />
}
