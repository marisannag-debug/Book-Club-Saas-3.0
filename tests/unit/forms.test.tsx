import { render, screen } from '@testing-library/react'
import RegisterForm from '../../book_club_saas_3/app/components/auth/RegisterForm'
import LoginForm from '../../book_club_saas_3/app/components/auth/LoginForm'

describe('Auth forms', () => {
  it('renders RegisterForm inputs and submit button', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Zarejestruj się/i })).toBeInTheDocument()
  })

  it('renders LoginForm inputs and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Hasło/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Zaloguj/i })).toBeInTheDocument()
  })
})
