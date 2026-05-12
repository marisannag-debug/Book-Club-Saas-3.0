import { render, screen } from '@testing-library/react';
import Header from '../../app/components/Header';

describe('Header', () => {
  it('renders the brand and navigation links', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: 'BookClub Pro' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Zaloguj' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Zarejestruj się' })).toHaveAttribute('href', '/register');
  });
});