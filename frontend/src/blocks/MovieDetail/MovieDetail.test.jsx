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

test('handles missing data', () => {
  render(<MovieDetail movie={{ ...matrix, overview: '', genres: [], runtime: null, vote_count: 0 }} />)
  expect(screen.getByText('No synopsis available.')).toBeTruthy()
  expect(screen.getByText('No genres listed')).toBeTruthy()
  expect(screen.getByText('No votes')).toBeTruthy()
})
