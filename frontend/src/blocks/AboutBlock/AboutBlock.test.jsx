import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import AboutBlock from './AboutBlock.jsx'

test('credits TMDB as TMDB requires', () => {
  render(<AboutBlock />)
  expect(screen.getByText(/uses the TMDB API but is not endorsed or certified by TMDB/)).toBeTruthy()
  expect(screen.getByRole('link', { name: 'themoviedb.org' }).getAttribute('href')).toBe('https://www.themoviedb.org/')
})

test('worked examples match the backend formula', () => {
  render(<AboutBlock />)
  expect(screen.getByText('6.03')).toBeTruthy() // 8.9 from 12 votes
  expect(screen.getByText('8.32')).toBeTruthy() // 8.4 from 30,000 votes
})
