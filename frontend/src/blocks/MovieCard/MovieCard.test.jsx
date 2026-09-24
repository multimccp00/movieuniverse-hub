import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import MovieCard from './MovieCard.jsx'

const matrix = {
  id: 603, title: 'The Matrix', year: 1999,
  poster_url: 'https://image.tmdb.org/t/p/w342/m.jpg', vote_average: 8.2, vote_count: 26000,
}

function renderCard(movie) {
  render(<MemoryRouter><MovieCard movie={movie} /></MemoryRouter>)
}

test('shows title, year and links to the movie page', () => {
  renderCard(matrix)
  expect(screen.getByText('1999')).toBeTruthy()
  expect(screen.getByRole('link').getAttribute('href')).toBe('/movies/603')
})

test('handles a movie with no poster, year or votes', () => {
  renderCard({ ...matrix, poster_url: null, year: null, vote_count: 0 })
  expect(screen.getByText('No poster')).toBeTruthy()
  expect(screen.getByText('Unknown year')).toBeTruthy()
  expect(screen.getByText('No votes')).toBeTruthy()
})
