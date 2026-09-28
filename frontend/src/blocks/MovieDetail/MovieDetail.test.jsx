import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import MovieDetail from './MovieDetail.jsx'

const matrix = {
  id: 603, title: 'The Matrix', year: 1999, poster_url: null, backdrop_url: null,
  vote_average: 8.2, vote_count: 26000, overview: 'A hacker learns the truth.',
  genres: ['Action', 'Science Fiction'], runtime: 136,
}

function summary(combined, app = { app_average: null, app_count: 0 }) {
  return { my_stars: null, ...app, combined }
}

test('shows synopsis, facts and the TMDB score', () => {
  renderWithContext(<MovieDetail movie={matrix} />)
  expect(screen.getByText('A hacker learns the truth.')).toBeTruthy()
  expect(screen.getByText('Action, Science Fiction')).toBeTruthy()
  expect(screen.getByText('2h 16m')).toBeTruthy()
  expect(screen.getByText('8.2')).toBeTruthy()
  expect(screen.getByText('26,000 votes')).toBeTruthy()
})

test('shows the combined score and this app\'s score, with the explanation', () => {
  const combined = { score: 8.07, votes: 26001, explanation: 'Based on 26,001 votes.' }
  renderWithContext(<MovieDetail movie={matrix} summary={summary(combined, { app_average: 9, app_count: 1 })} />)
  expect(screen.getByText('Combined')).toBeTruthy()
  expect(screen.getByText('8.07')).toBeTruthy()
  expect(screen.getByText('26,001 votes')).toBeTruthy() // how many votes the combined score is based on
  expect(screen.getByText('9.0')).toBeTruthy()
  expect(screen.getByText('1 vote')).toBeTruthy()
  expect(screen.getByText('Based on 26,001 votes.')).toBeTruthy()
})

test('combined score without votes says there is not enough information', () => {
  const combined = { score: null, votes: 0, explanation: 'Not enough information: no votes.' }
  renderWithContext(<MovieDetail movie={{ ...matrix, vote_count: 0 }} summary={summary(combined)} />)
  expect(screen.getByText('Not enough information')).toBeTruthy()
})

test('handles missing data', () => {
  renderWithContext(<MovieDetail movie={{ ...matrix, overview: '', genres: [], runtime: null, vote_count: 0 }} />)
  expect(screen.getByText('No synopsis available.')).toBeTruthy()
  expect(screen.getByText('No genres listed')).toBeTruthy()
  expect(screen.getByText('No votes')).toBeTruthy()
})
