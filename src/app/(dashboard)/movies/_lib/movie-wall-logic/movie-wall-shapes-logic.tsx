// Pure math — no React. Returns % rects inside a 100x100 square.
export type WallRect = { x: number; y: number; w: number; h: number; id: number }

export function getWallLayout(n: number): WallRect[] {
  if (n <= 1) return [{ x: 0, y: 0, w: 100, h: 100, id: 0 }]
  if (n === 2) return [
    { x: 0, y: 0, w: 50, h: 100, id: 0 },
    { x: 50, y: 0, w: 50, h: 100, id: 1 },
  ]
  if (n === 3) return [
    { x: 0, y: 0, w: 60, h: 100, id: 0 },
    { x: 60, y: 0, w: 40, h: 50, id: 1 },
    { x: 60, y: 50, w: 40, h: 50, id: 2 },
  ]
  if (n === 4) return [
    { x: 0, y: 0, w: 50, h: 50, id: 0 },
    { x: 50, y: 0, w: 50, h: 50, id: 1 },
    { x: 0, y: 50, w: 50, h: 50, id: 2 },
    { x: 50, y: 50, w: 50, h: 50, id: 3 },
  ]
  if (n === 5) return [
    { x: 0, y: 0, w: 50, h: 50, id: 0 },
    { x: 50, y: 0, w: 50, h: 50, id: 1 },
    { x: 0, y: 50, w: 33.333, h: 50, id: 2 },
    { x: 33.333, y: 50, w: 33.333, h: 50, id: 3 },
    { x: 66.666, y: 50, w: 33.334, h: 50, id: 4 },
  ]
  if (n === 6) return [
    { x: 0, y: 0, w: 33.333, h: 50, id: 0 },
    { x: 33.333, y: 0, w: 33.333, h: 50, id: 1 },
    { x: 66.666, y: 0, w: 33.334, h: 50, id: 2 },
    { x: 0, y: 50, w: 33.333, h: 50, id: 3 },
    { x: 33.333, y: 50, w: 33.333, h: 50, id: 4 },
    { x: 66.666, y: 50, w: 33.334, h: 50, id: 5 },
  ]
  if (n === 7) return [
    { x: 0, y: 0, w: 33.333, h: 50, id: 0 },
    { x: 33.333, y: 0, w: 33.333, h: 50, id: 1 },
    { x: 66.666, y: 0, w: 33.334, h: 50, id: 2 },
    { x: 0, y: 50, w: 25, h: 50, id: 3 },
    { x: 25, y: 50, w: 25, h: 50, id: 4 },
    { x: 50, y: 50, w: 25, h: 50, id: 5 },
    { x: 75, y: 50, w: 25, h: 50, id: 6 },
  ]
  if (n === 8) return [
    { x: 0, y: 0, w: 25, h: 50, id: 0 },
    { x: 25, y: 0, w: 25, h: 50, id: 1 },
    { x: 50, y: 0, w: 25, h: 50, id: 2 },
    { x: 75, y: 0, w: 25, h: 50, id: 3 },
    { x: 0, y: 50, w: 25, h: 50, id: 4 },
    { x: 25, y: 50, w: 25, h: 50, id: 5 },
    { x: 50, y: 50, w: 25, h: 50, id: 6 },
    { x: 75, y: 50, w: 25, h: 50, id: 7 },
  ]
  if (n === 9) {
    const out: WallRect[] = []
    for (let i = 0; i < 9; i++) out.push({ x: (i % 3) * 33.333, y: Math.floor(i / 3) * 33.333, w: 33.333, h: 33.333, id: i })
    return out
  }
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)
  const out: WallRect[] = []
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols)
    const c = i % cols
    const isLastRow = r === rows - 1
    const itemsInLastRow = n - (rows - 1) * cols
    if (isLastRow && itemsInLastRow < cols) {
      const w = 100 / itemsInLastRow
      out.push({ x: c * w, y: r * (100 / rows), w, h: 100 / rows, id: i })
    } else {
      out.push({ x: c * (100 / cols), y: r * (100 / rows), w: 100 / cols, h: 100 / rows, id: i })
    }
  }
  return out
}

export function rectToObjectPosition(r: WallRect) {
  return `${r.x + r.w / 2}% ${r.y + r.h / 2}%`
}