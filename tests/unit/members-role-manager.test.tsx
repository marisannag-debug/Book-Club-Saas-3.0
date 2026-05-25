import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MembersRoleManager from '../../app/components/club/MembersRoleManager';
import type { ClubRoleMember } from '../../app/components/club/roles';

const members: ClubRoleMember[] = [
  {
    userId: 'user-host-1',
    displayName: 'Anna Kowalska',
    email: 'anna@example.com',
    role: 'host',
    joinedAt: '21 maja 2026',
    isCreator: true,
  },
  {
    userId: 'user-member-1',
    displayName: 'Marta Nowak',
    email: 'marta@example.com',
    role: 'member',
    joinedAt: '20 maja 2026',
  },
];

describe('MembersRoleManager', () => {
  it('shows role actions for a host', () => {
    render(<MembersRoleManager clubId="club-1" currentUserRole="host" members={members} />);

    expect(screen.getByRole('button', { name: 'Nadaj prowadzenie dla Marta Nowak' })).toBeInTheDocument();
  });

  it('hides role actions for a member', () => {
    render(<MembersRoleManager clubId="club-1" currentUserRole="member" members={members} />);

    expect(screen.queryByRole('button', { name: /Nadaj prowadzenie/i })).not.toBeInTheDocument();
    expect(screen.getByText('Masz dostęp tylko do podglądu listy członków i ról.')).toBeInTheDocument();
  });

  it('updates a member role through the provided updater', async () => {
    const updateRole = vi.fn().mockResolvedValue(undefined);

    render(<MembersRoleManager clubId="club-1" currentUserRole="host" members={members} updateRole={updateRole} />);

    fireEvent.click(screen.getByRole('button', { name: 'Nadaj prowadzenie dla Marta Nowak' }));

    await waitFor(() => {
      expect(updateRole).toHaveBeenCalledWith('club-1', 'user-member-1', 'host');
    });

    expect(await screen.findByText('Rola Marta Nowak została zmieniona na prowadzącego.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zmień na członka dla Marta Nowak' })).toBeInTheDocument();
  });

  it('prevents demoting the creator', () => {
    render(<MembersRoleManager clubId="club-1" currentUserRole="host" members={members} />);

    expect(screen.getByRole('button', { name: 'Zmień na członka dla Anna Kowalska' })).toBeDisabled();
  });
});
