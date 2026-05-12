import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DashboardNav from '../../app/components/DashboardNav';

describe('DashboardNav', () => {
  it('shows navigation actions and empty state when the user has no clubs', () => {
    render(React.createElement(DashboardNav));

    expect(screen.getByRole('link', { name: /Utwórz nowy klub/i })).toHaveAttribute('href', '/club/create');
    expect(screen.getByRole('link', { name: /Dołącz do klubu/i })).toHaveAttribute('href', '/club/join');
    expect(
      screen.getByText(
        'Nie masz jeszcze klubów. Zacznij od utworzenia nowego klubu albo dołączenia do istniejącego.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the list of clubs when data is available', () => {
    render(
      React.createElement(DashboardNav, {
        clubs: [
          { id: 'alpha', name: 'Alpha Club', description: 'Wieczorne dyskusje.' },
          { id: 'beta', name: 'Beta Club' },
        ],
      }),
    );

    expect(screen.getByRole('link', { name: /Alpha Club/i })).toHaveAttribute('href', '/club/alpha');
    expect(screen.getByRole('link', { name: /Beta Club/i })).toHaveAttribute('href', '/club/beta');
  });
});