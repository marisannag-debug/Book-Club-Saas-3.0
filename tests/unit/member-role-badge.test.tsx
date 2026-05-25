import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MemberRoleBadge from '../../app/components/club/MemberRoleBadge';

describe('MemberRoleBadge', () => {
  it('renders the host label', () => {
    render(<MemberRoleBadge role="host" />);

    expect(screen.getByText('Prowadzący')).toBeInTheDocument();
  });

  it('renders the member label', () => {
    render(<MemberRoleBadge role="member" />);

    expect(screen.getByText('Członek')).toBeInTheDocument();
  });
});
