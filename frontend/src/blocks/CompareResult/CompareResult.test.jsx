import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import CompareResult from './CompareResult.jsx'

const matrix = { id: 603, title: 'The Matrix', year: 1999, score: 8.07 }
const unreleased = { id: 999, title: 'Unreleased', year: null, score: null }

function side(id, name, movies, average) {
  const scored = movies.filter((m) => m.score !== null).length
  return { id, name, owner: 'ana', movie_count: movies.length, scored_count: scored, average, movies }
}

function renderResult(result) {
  const playlists = [result.a, result.b]
  render(
    <MemoryRouter>
      <CompareResult playlists={playlists} a={String(result.a.id)} b={String(result.b.id)} result={result} onPick={vi.fn()} />
    </MemoryRouter>,
  )
}

test('announces the winner and lists the movies in common', () => {
  renderResult({
    a: side(1, 'Sci-fi', [matrix], 8.07),
    b: side(2, 'Sunday', [matrix, unreleased], 7.5),
    winner: 'a',
    common: [matrix],
  })
  expect(screen.getByRole('status').textContent).toBe('“Sci-fi” wins: 8.07 vs 7.50.')
  expect(screen.getByText('In both playlists (1)')).toBeTruthy()
  expect(screen.getByText('(movies without a score are left out)', { exact: false })).toBeTruthy()
})

test('tie', () => {
  renderResult({ a: side(1, 'A', [matrix], 8.07), b: side(2, 'B', [matrix], 8.07), winner: 'tie', common: [matrix] })
  expect(screen.getByRole('status').textContent).toBe("It's a tie: both average 8.07.")
})

test('marks the winner and the movies in both playlists', () => {
  renderResult({ a: side(1, 'A', [matrix], 8.07), b: side(2, 'B', [matrix, unreleased], 7.5), winner: 'a', common: [matrix] })
  expect(screen.getByText('Winner')).toBeTruthy()
  expect(screen.getAllByText('Both')).toHaveLength(2) // The Matrix, in each list
})

test('changing a dropdown picks another playlist for that side', () => {
  const onPick = vi.fn()
  const a = side(1, 'A', [matrix], 8.07)
  const b = side(2, 'B', [matrix], 7.5)
  render(
    <MemoryRouter>
      <CompareResult playlists={[a, b, side(3, 'C', [], null)]} a="1" b="2" result={{ a, b, winner: 'a', common: [] }} onPick={onPick} />
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByLabelText('Second playlist'), { target: { value: '3' } })
  expect(onPick).toHaveBeenCalledWith('b', '3')
})

test('no winner when a side has no scores', () => {
  renderResult({ a: side(1, 'A', [matrix], 8.07), b: side(2, 'Empty', [], null), winner: null, common: [] })
  expect(screen.getByRole('status').textContent).toBe("Can't compare: “Empty” has no movie with a score yet.")
  expect(screen.getByText('No movies in common.')).toBeTruthy()
})
