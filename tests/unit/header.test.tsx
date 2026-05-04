import { render, screen } from '@testing-library/react'
import Header from '../../book_club_saas_3/app/components/Header'

describe('Header', () => {
  it('renders links', () => {
    render(<Header />)
    expect(screen.getByText(/BookClub Pro/i)).toBeInTheDocument()
    expect(screen.getByText(/Log in/i)).toBeInTheDocument()
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument()
  })
})
