export function briefNumber(n: number): string {
  if (!Number.isFinite(n)) return "0"
  const num = Math.max(Math.floor(n), 0)
  if (num < 1000) return num.toString()

  const units = [
    { value: 1e9, symbol: "b" },
    { value: 1e6, symbol: "m" },
    { value: 1e3, symbol: "k" },
  ]

  for (const { value, symbol } of units) {
    if (num >= value) {
      const divided = num / value
      let formatted: string
      if (divided >= 100) formatted = Math.floor(divided).toString()
      else formatted = divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(1).replace(".0", "")
      return `${formatted}${symbol}`
    }
  }
  return num.toString()
}

// aliases so you can import any name
export const briefCount = briefNumber
export const formatCount = briefNumber

// Hook version for your stores pattern
export function useBriefNumbers() {
  return { briefNumber, briefCount, formatCount }
}

export default briefNumber
