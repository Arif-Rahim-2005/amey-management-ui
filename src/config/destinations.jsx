/**
 * Centralized destination configuration.
 *
 * The Flask API returns a `category` string on each consignment. We map that
 * raw value to a "destination" — a canonical section of the dashboard. Adding
 * a new destination or changing a color only requires editing this file.
 *
 * NOTE: `category` is used as-is from the API. No new Category model is created.
 * Raw values are normalized (case-insensitive, trimmed) when matching.
 */

const DESTINATIONS = [
  {
    id: "uganda",
    label: "Uganda",
    // Values returned by Flask in the `category` field that should map here.
    aliases: ["uganda", "ug", "UG"],
    color: "#2563EB",
    text: "text-brand-700",
    bg: "bg-brand-50",
    border: "border-brand-200",
    ring: "ring-brand-500",
    gradient: "from-brand-600 to-brand-800",
    softGradient: "from-brand-50 to-brand-100",
    icon: "Flag",
    blurb: "Cross-border clearing & forwarding into Uganda.",
  },
  {
    id: "drc",
    label: "DRC",
    aliases: [
      "drc",
      "dr congo",
      "democratic republic of congo",
      "congo",
      "CD",
      "DRC",
    ],
    color: "#16A34A",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    ring: "ring-emerald-500",
    gradient: "from-emerald-600 to-emerald-800",
    softGradient: "from-emerald-50 to-emerald-100",
    icon: "Flag",
    blurb: "Freight movement to the Democratic Republic of Congo.",
  },
  {
    id: "south-sudan",
    label: "South Sudan",
    aliases: ["south sudan", "ss", "SS", "s. sudan"],
    color: "#EAB308",
    text: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    ring: "ring-yellow-500",
    gradient: "from-yellow-500 to-yellow-700",
    softGradient: "from-yellow-50 to-yellow-100",
    icon: "Flag",
    blurb: "Consolidated cargo services into South Sudan.",
  },
  {
    id: "local",
    label: "Local / Kenya",
    aliases: ["local", "kenya", "ke", "KE", "local / kenya", "local/kenya"],
    color: "#DC2626",
    text: "text-accent-700",
    bg: "bg-accent-50",
    border: "border-accent-200",
    ring: "ring-accent-500",
    gradient: "from-accent-600 to-accent-800",
    softGradient: "from-accent-50 to-accent-100",
    icon: "Flag",
    blurb: "Domestic clearing and forwarding within Kenya.",
  },
];

// Neutral fallback for unknown categories returned by the API.
export const FALLBACK_DESTINATION = {
  id: "other",
  label: "Other",
  aliases: [],
  color: "#64748b",
  text: "text-ink-600",
  bg: "bg-ink-100",
  border: "border-ink-200",
  ring: "ring-ink-400",
  gradient: "from-ink-600 to-ink-800",
  softGradient: "from-ink-50 to-ink-100",
  icon: "Folder",
  blurb: "Consignments with an unrecognized destination.",
};

// Reserved colors for future destinations — do not reuse.
export const RESERVED_COLORS = {
  purple: "#9333ea",
  teal: "#0d9488",
  orange: "#ea580c",
  pink: "#db2777",
};

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Resolve a raw API `category` value to a destination config object.
 * Falls back to FALLBACK_DESTINATION for unknown categories.
 */
export function resolveDestination(rawCategory) {
  const norm = normalize(rawCategory);
  if (!norm) return FALLBACK_DESTINATION;
  const match = DESTINATIONS.find((d) =>
    d.aliases.some((a) => normalize(a) === norm),
  );
  return match || FALLBACK_DESTINATION;
}

export function getDestinationById(id) {
  return DESTINATIONS.find((d) => d.id === id) || FALLBACK_DESTINATION;
}

export function getAllDestinations() {
  return DESTINATIONS;
}

export default DESTINATIONS;
