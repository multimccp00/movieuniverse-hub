import { expect, test } from 'vitest'
import { averageScore, formatCount, formatRuntime, formatScore } from './format.js'

test('formatScore', () => {
  expect(formatScore(7.625)).toBe('7.63')
  expect(formatScore(8)).toBe('8.00')
  expect(formatScore(null)).toBe('No score')
})

test('formatCount', () => {
  expect(formatCount(12340)).toBe('12,340 votes')
  expect(formatCount(1)).toBe('1 vote')
  expect(formatCount(0)).toBe('No votes') // never "0"
})

test('averageScore leaves out movies without a score', () => {
  expect(averageScore([{ score: 8 }, { score: 7 }, { score: null }])).toBe(7.5)
  expect(averageScore([{ score: null }])).toBe(null)
  expect(averageScore([])).toBe(null)
})

test('formatRuntime', () => {
  expect(formatRuntime(136)).toBe('2h 16m')
  expect(formatRuntime(45)).toBe('45m')
  expect(formatRuntime(null)).toBe(null)
})
