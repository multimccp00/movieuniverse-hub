import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { expect, test } from 'vitest'
import SearchBar from './SearchBar.jsx'

// Shows the current URL so the test can check where SearchBar navigated
function CurrentUrl() {
  const location = useLocation()
  return <p data-testid="url">{location.pathname + location.search}</p>
}

test('submitting goes to the search page with the trimmed query', () => {
  render(
    <MemoryRouter>
      <SearchBar />
      <Routes><Route path="*" element={<CurrentUrl />} /></Routes>
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByLabelText('Search movies'), { target: { value: '  the matrix ' } })
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  expect(screen.getByTestId('url').textContent).toBe('/search?q=the%20matrix')
})
