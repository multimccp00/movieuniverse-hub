import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import MovieDetail from './MovieDetail.jsx'

const matrix = {
  id: 603, title: 'The Matrix', year: 1999, poster_url: null,
  vote_average: 8.2, vote_count: 26000, overview: 'A hacker learns the truth.',
  genres: ['Action', 'Science Fiction'], runtime: 136,
}

test('shows synopsis, genres, runtime and score', () => {
  render(<MovieDetail movie={matrix} />)
  expect(screen.getByText('A hacker learns the truth.')).toBeTruthy()
  expect(screen.getByText('Action, Science Fiction · 2h 16m')).toBeTruthy()
  expect(screen.getByText('8.2 · 26,000 votes')).toBeTruthy()
})

test('shows the combined score next to TMDB, with its explanation', () => {
  const combined = { score: 8.07, votes: 26001, explanation: 'Based on 26,001 votes.' }
  render(<MovieDetail movie={matrix} combined={combined} />)
  expect(screen.getByText('Combined')).toBeTruthy()
  expect(screen.getByText('8.1 · 26,001 votes')).toBeTruthy()
  expect(screen.getByText('Based on 26,001 votes.')).toBeTruthy()
})

test('combined score without votes says there is not enough information', () => {
  const combined = { score: null, votes: 0, explanation: 'Not enough information: no votes.' }
  render(<MovieDetail movie={{ ...matrix, vote_count: 0 }} combined={combined} />)
  expect(screen.getByText('Not enough information')).toBeTruthy()
})

test('handles missing data', () => {
  render(<MovieDetail movie={{ ...matrix, overview: '', genres: [], runtime: null, vote_count: 0 }} />)
  expect(screen.getByText('No synopsis available.')).toBeTruthy()
  expect(screen.getByText('No genres listed')).toBeTruthy()
  expect(screen.getByText('No votes')).toBeTruthy()
})
