import { expect, test } from 'vitest'
import { formatRuntime, formatScore, formatVotes } from './format.js'

test('formatScore', () => {
  expect(formatScore(7.625)).toBe('7.63')
  expect(formatScore(8)).toBe('8.00')
  expect(formatScore(null)).toBe('No score')
})

test('formatVotes', () => {
  expect(formatVotes(7.8, 12340)).toBe('7.8 · 12,340 votes')
  expect(formatVotes(9, 1)).toBe('9.0 · 1 vote')
  expect(formatVotes(0, 0)).toBe('No votes') // never "0"
})

test('formatRuntime', () => {
  expect(formatRuntime(136)).toBe('2h 16m')
  expect(formatRuntime(45)).toBe('45m')
  expect(formatRuntime(null)).toBe(null)
})
