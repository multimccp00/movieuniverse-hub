import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import ScoreBadge from './ScoreBadge.jsx'

test('shows score with votes', () => {
  render(<ScoreBadge label="TMDB" average={7.8} count={12340} />)
  expect(screen.getByText('7.8 · 12,340 votes')).toBeTruthy()
})

test('shows "No votes" instead of 0', () => {
  render(<ScoreBadge label="TMDB" average={0} count={0} />)
  expect(screen.getByText('No votes')).toBeTruthy()
})

test('the empty text can be changed', () => {
  render(<ScoreBadge label="Combined" average={null} count={0} emptyText="Not enough information" />)
  expect(screen.getByText('Not enough information')).toBeTruthy()
})
