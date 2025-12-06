import type { PurchaseCategory } from "./cards"

export interface CategoryOption {
  value: PurchaseCategory
  label: string
  keywords: string[]
  group: "food" | "bills" | "shopping" | "travel"
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  // Food & Groceries
  {
    value: "online_food",
    label: "Food delivery – Talabat / Deliveroo / Careem Food",
    keywords: [
      "talabat",
      "careem",
      "careem food",
      "deliveroo",
      "zomato",
      "food",
      "delivery",
      "restaurant",
      "order",
      "app",
    ],
    group: "food",
  },
  {
    value: "online_grocery",
    label: "Online groceries – Talabat Mart / Careem / Instashop",
    keywords: [
      "talabat mart",
      "talabat grocery",
      "careem",
      "careem mart",
      "careem market",
      "careem quik",
      "instashop",
      "grocery app",
      "online grocery",
      "noon minutes",
    ],
    group: "food",
  },
  {
    value: "grocery",
    label: "Groceries – supermarket / hypermarket (Carrefour, Lulu, etc.)",
    keywords: ["carrefour", "lulu", "supermarket", "hypermarket", "grocery", "spinneys", "waitrose", "union coop"],
    group: "food",
  },
  {
    value: "dining",
    label: "Dining in-store – restaurants / cafes",
    keywords: ["restaurant", "cafe", "dine in", "eat out", "coffee", "brunch", "dinner", "lunch"],
    group: "food",
  },
  {
    value: "fuel",
    label: "Fuel / Petrol station",
    keywords: ["fuel", "petrol", "gas station", "adnoc", "enoc", "epco", "emarat", "gas"],
    group: "bills",
  },
  // Bills
  {
    value: "utilities",
    label: "Utilities / Telecom / Salik / Etisalat / Du",
    keywords: ["utility", "utilities", "etisalat", "du", "salik", "bill", "dewa", "fewa", "sewa", "telecom", "phone"],
    group: "bills",
  },
  {
    value: "government",
    label: "Government / Real estate / Traffic fines",
    keywords: ["rta", "tasheel", "government", "traffic fine", "ejari", "visa", "emirates id", "amer", "typsa"],
    group: "bills",
  },
  {
    value: "education",
    label: "Education / School / University fees",
    keywords: ["school", "university", "tuition", "education", "college", "nursery", "fees"],
    group: "bills",
  },
  // Shopping
  {
    value: "online_shopping",
    label: "Online shopping – Amazon / Noon / websites",
    keywords: ["amazon", "noon", "online shopping", "ecommerce", "namshi", "ounass", "shein", "aliexpress"],
    group: "shopping",
  },
  {
    value: "instore_shopping",
    label: "In-store shopping – clothes / electronics / malls",
    keywords: ["mall", "clothes", "electronics", "shop", "store", "dubai mall", "moe", "zara", "h&m", "sharaf dg"],
    group: "shopping",
  },
  // Travel
  {
    value: "travel_air",
    label: "Travel – airline tickets",
    keywords: ["flight", "airline", "emirates", "etihad", "flydubai", "air arabia", "ticket", "booking"],
    group: "travel",
  },
  {
    value: "travel_hotel",
    label: "Travel – hotels",
    keywords: ["hotel", "booking.com", "airbnb", "stay", "agoda", "expedia", "resort", "accommodation"],
    group: "travel",
  },
  {
    value: "other",
    label: "Other / not sure",
    keywords: ["other", "misc", "unknown", "not sure"],
    group: "shopping",
  },
]

export const GROUP_LABELS: Record<CategoryOption["group"], string> = {
  food: "Food & Groceries",
  bills: "Bills & Services",
  shopping: "Shopping",
  travel: "Travel",
}
