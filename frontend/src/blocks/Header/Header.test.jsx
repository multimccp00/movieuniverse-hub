import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { UserContext } from '../../context/UserContext.jsx'
import Header from './Header.jsx'

test('shows the brand name', () => {
  // Links need a router around them (MemoryRouter = fake one for tests);
  // UserMenu inside the header needs a user context.
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user: null }}>
        <Header />
      </UserContext.Provider>
    </MemoryRouter>,
  )
  expect(screen.getByText('MovieUniverse Hub')).toBeTruthy()
})
