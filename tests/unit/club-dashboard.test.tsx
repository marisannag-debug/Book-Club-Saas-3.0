import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ClubDashboard, { buildClubDashboardMock } from '../../app/components/ClubDashboard/ClubDashboard';

describe('ClubDashboard', () => {
  it('renders the main dashboard sections for a populated club', () => {
    render(<ClubDashboard club={buildClubDashboardMock('sunset-readers')} />);

    expect(screen.getByRole('heading', { name: 'Sunset Readers' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Wróć do dashboardu' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('heading', { name: 'Wybór książki na najbliższy miesiąc' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nadchodzące spotkanie' })).toBeInTheDocument();
    expect(screen.getByText('Aktywne zaproszenia')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Generuj zaproszenie' })).toHaveAttribute(
      'href',
      '/club/sunset-readers/invite',
    );
  });

  it('renders empty states when the club has no activity yet', () => {
    render(<ClubDashboard club={buildClubDashboardMock('empty-club')} />);

    expect(screen.getByRole('heading', { name: 'Empty Club' })).toBeInTheDocument();
    expect(screen.getByText(/Nie ma jeszcze aktywnego głosowania/i)).toBeInTheDocument();
    expect(screen.getByText(/Nie ma jeszcze zaplanowanego spotkania/i)).toBeInTheDocument();
    expect(screen.getByText(/Wygeneruj pierwsze zaproszenie/i)).toBeInTheDocument();
  });
});