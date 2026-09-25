import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import AboutBlock from './AboutBlock.jsx'

test('credits TMDB as TMDB requires', () => {
  render(<AboutBlock />)
  expect(screen.getByText(/uses the TMDB API but is not endorsed or certified by TMDB/)).toBeTruthy()
  expect(screen.getByRole('link', { name: 'themoviedb.org' }).getAttribute('href')).toBe('https://www.themoviedb.org/')
})
