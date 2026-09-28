import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { renderWithContext } from '../../test-utils.jsx'
import Header from './Header.jsx'

test('shows the brand name, linking home', () => {
  renderWithContext(<Header />)
  expect(screen.getByRole('link', { name: 'MovieUniverse Hub' }).getAttribute('href')).toBe('/')
})

test('logged out: offers to sign in', () => {
  renderWithContext(<Header />)
  expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy()
})
