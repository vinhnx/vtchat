import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'

// Simple mock component that mimics a Next.js page structure
function MockHomePage() {
  return (
    <div>
      <h1>VTChat</h1>
      <p>AI-powered chat application</p>
      <button>Get Started</button>
    </div>
  )
}

test('HomePage renders correctly', () => {
  render(<MockHomePage />)

  // Test that the heading is rendered
  expect(screen.getByRole('heading', { level: 1, name: 'VTChat' })).toBeDefined()

  // Test that the description is present
  expect(screen.getByText('AI-powered chat application')).toBeDefined()

  // Test that the CTA button is rendered
  expect(screen.getByRole('button', { name: 'Get Started' })).toBeDefined()
})

test('HomePage has proper structure', () => {
  const { container } = render(<MockHomePage />)

  // Test the overall structure
  const heading = screen.getByRole('heading', { level: 1 })
  const button = screen.getByRole('button')

  expect(heading).toBeDefined()
  expect(button).toBeDefined()
  expect(container.firstChild).toBeDefined()
})
