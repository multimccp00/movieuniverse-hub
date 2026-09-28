// Turning raw numbers into the text shown on screen. Pure functions: easy to test.

// 12340 -> "12,340 votes". The brief: no votes must say so, never "0".
export function formatCount(count) {
  if (!count) return 'No votes'
  return `${count.toLocaleString('en-US')} ${count === 1 ? 'vote' : 'votes'}`
}

// A combined score or average: 7.625 -> "7.63" (2 decimals: close averages must look different)
export function formatScore(score) {
  return score === null ? 'No score' : score.toFixed(2)
}

// Average combined score of a list of movies. Movies without a score are left out,
// the same rule the compare page uses. null when none has a score.
export function averageScore(movies) {
  const scores = movies.map((m) => m.score).filter((s) => s !== null)
  return scores.length ? scores.reduce((sum, s) => sum + s, 0) / scores.length : null
}

// 136 -> "2h 16m"; missing -> null so the page can hide it
export function formatRuntime(minutes) {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours ? `${hours}h ${rest}m` : `${rest}m`
}
