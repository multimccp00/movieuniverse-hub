import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import MovieCard from './MovieCard.jsx'

const matrix = {
  id: 603, title: 'The Matrix', year: 1999,
  poster_url: 'https://image.tmdb.org/t/p/w342/m.jpg', vote_average: 8.2, vote_count: 26000,
}

test('shows title, year, TMDB score with its votes, and links to the movie page', () => {
  renderWithContext(<MovieCard movie={matrix} />)
  expect(screen.getByText('1999')).toBeTruthy()
  expect(screen.getByTitle('TMDB score').textContent).toBe('8.2 · 26,000 votes')
  expect(screen.getByRole('link').getAttribute('href')).toBe('/movies/603')
})

test('handles a movie with no poster, year or votes', () => {
  renderWithContext(<MovieCard movie={{ ...matrix, poster_url: null, year: null, vote_count: 0 }} />)
  expect(screen.getByText('No poster')).toBeTruthy()
  expect(screen.getByText('Unknown year')).toBeTruthy()
  expect(screen.getByText('No votes')).toBeTruthy()
})

test('playlist card: numbered, with the combined score', () => {
  renderWithContext(<MovieCard movie={{ ...matrix, score: 8.07 }} position={3} />)
  expect(screen.getByText('03')).toBeTruthy()
  expect(screen.getByText('8.07')).toBeTruthy()
})
