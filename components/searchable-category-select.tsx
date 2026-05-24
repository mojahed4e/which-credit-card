"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { ChevronDown, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PurchaseCategory } from "@/lib/cards"
import { CATEGORY_OPTIONS, GROUP_LABELS, type CategoryOption } from "@/lib/categories"

interface SearchableCategorySelectProps {
  value: PurchaseCategory
  onChange: (value: PurchaseCategory) => void
}

export function SearchableCategorySelect({ value, onChange }: SearchableCategorySelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [highlightIndex, setHighlightIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = CATEGORY_OPTIONS.find((opt) => opt.value === value)

  // Filter options based on query — tokenize so "carrefour grocery" matches.
  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CATEGORY_OPTIONS
    const tokens = q.split(/\s+/).filter(Boolean)
    const matches = (opt: CategoryOption) =>
      tokens.every(
        (tok) =>
          opt.label.toLowerCase().includes(tok) ||
          opt.keywords.some((kw) => kw.toLowerCase().includes(tok)),
      )
    return CATEGORY_OPTIONS.filter(matches)
  }, [query])

  // Group filtered options
  const groupedOptions = useMemo(() => {
    const groups: Record<CategoryOption["group"], CategoryOption[]> = {
      food: [],
      bills: [],
      shopping: [],
      travel: [],
    }
    filteredOptions.forEach((opt) => {
      groups[opt.group].push(opt)
    })
    return groups
  }, [filteredOptions])

  // Flat list for keyboard navigation
  const flatList = useMemo(() => {
    const order: CategoryOption["group"][] = ["food", "bills", "shopping", "travel"]
    return order.flatMap((g) => groupedOptions[g])
  }, [groupedOptions])

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIndex(0)
  }, [filteredOptions.length])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current) {
      const highlighted = listRef.current.querySelector('[data-highlighted="true"]')
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" })
      }
    }
  }, [highlightIndex, open])

  const handleSelect = (opt: CategoryOption) => {
    onChange(opt.value)
    setQuery("")
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        setOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightIndex((prev) => (prev + 1) % flatList.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightIndex((prev) => (prev - 1 + flatList.length) % flatList.length)
        break
      case "Enter":
        e.preventDefault()
        if (flatList[highlightIndex]) {
          handleSelect(flatList[highlightIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        setQuery("")
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    if (!open) setOpen(true)
  }

  const handleTriggerClick = () => {
    setOpen(!open)
    if (!open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  let flatIndex = -1

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate text-left">{selectedOption?.label || "Select category..."}</span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md",
            "max-h-[min(400px,60vh)] overflow-hidden flex flex-col",
          )}
        >
          {/* Search input */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search categories..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Options list */}
          <div ref={listRef} className="overflow-y-auto flex-1 py-1" role="listbox">
            {flatList.length === 0 ? (
              <div className="px-3 py-6 text-sm text-muted-foreground space-y-3">
                <p className="text-center font-medium text-foreground">No matching categories</p>
                <div className="space-y-2">
                  <p className="text-xs">Try one of these instead:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>
                      A pharmacy, salon, gym, taxi, cinema or doctor visit → pick{" "}
                      <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() => handleSelect(CATEGORY_OPTIONS.find((o) => o.value === "instore_shopping")!)}
                      >
                        In-store shopping
                      </button>
                    </li>
                    <li>
                      Streaming, subscription, app store, AWS, ChatGPT → pick{" "}
                      <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() => handleSelect(CATEGORY_OPTIONS.find((o) => o.value === "online_shopping")!)}
                      >
                        Online shopping
                      </button>
                    </li>
                    <li>
                      Salik, Nol, parking, traffic fine → pick{" "}
                      <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() => handleSelect(CATEGORY_OPTIONS.find((o) => o.value === "utilities")!)}
                      >
                        Utilities
                      </button>{" "}
                      or{" "}
                      <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() => handleSelect(CATEGORY_OPTIONS.find((o) => o.value === "government")!)}
                      >
                        Government
                      </button>
                    </li>
                    <li>
                      Truly nothing fits → use{" "}
                      <button
                        type="button"
                        className="underline hover:text-foreground"
                        onClick={() => handleSelect(CATEGORY_OPTIONS.find((o) => o.value === "other")!)}
                      >
                        Other
                      </button>{" "}
                      (most cards pay 0.5–1% base on uncategorised retail).
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              (["food", "bills", "shopping", "travel"] as const).map((groupKey) => {
                const items = groupedOptions[groupKey]
                if (items.length === 0) return null

                return (
                  <div key={groupKey}>
                    {/* Only show group header when not searching */}
                    {!query.trim() && (
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                        {GROUP_LABELS[groupKey]}
                      </div>
                    )}
                    {items.map((opt) => {
                      flatIndex++
                      const isHighlighted = flatIndex === highlightIndex
                      const isSelected = opt.value === value

                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          data-highlighted={isHighlighted}
                          onClick={() => handleSelect(opt)}
                          className={cn(
                            "flex w-full items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer",
                            "hover:bg-accent hover:text-accent-foreground",
                            isHighlighted && "bg-accent text-accent-foreground",
                            isSelected && "font-medium",
                          )}
                        >
                          <Check className={cn("h-4 w-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                          <span className="truncate">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
