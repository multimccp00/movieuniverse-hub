import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import Header from './Header.jsx'

test('shows the brand name', () => {
  // Links need a router around them; MemoryRouter is a fake one for tests
  render(<MemoryRouter><Header /></MemoryRouter>)
  expect(screen.getByText('MovieUniverse Hub')).toBeTruthy()
})
