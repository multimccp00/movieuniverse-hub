// Turning raw numbers into the text shown on screen. Pure functions: easy to test.

// 7.8 and 12340 -> "7.8 · 12,340 votes". The brief: no votes must say so, never "0".
export function formatVotes(average, count) {
  if (!count) return 'No votes'
  const votes = count.toLocaleString('en-US') // 12340 -> "12,340"
  return `${average.toFixed(1)} · ${votes} ${count === 1 ? 'vote' : 'votes'}`
}

// A combined score or average: 7.625 -> "7.63" (2 decimals: close averages must look different)
export function formatScore(score) {
  return score === null ? 'No score' : score.toFixed(2)
}

// 136 -> "2h 16m"; missing -> null so the page can hide it
export function formatRuntime(minutes) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours}h ${rest}m` : `${rest}m`
}
