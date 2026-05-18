import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateClubForm, { validateClubDescription, validateClubName } from '../../app/components/club/CreateClubForm';

const mockReplace = vi.fn();
const mockCreateClubPreview = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('../../lib/club-create', () => ({
  createClub: (...args: unknown[]) => mockCreateClubPreview(...args),
  validateClubName: (value: string) => value === '' ? 'Nazwa klubu jest wymagana.' : value.length < 3 ? 'Nazwa klubu musi mieć co najmniej 3 znaki.' : value.length > 60 ? 'Nazwa klubu może mieć maksymalnie 60 znaków.' : undefined,
  validateClubDescription: (value: string) => value.trim().length > 240 ? 'Opis może mieć maksymalnie 240 znaków.' : undefined,
}));

beforeEach(() => {
  mockReplace.mockReset();
  mockCreateClubPreview.mockReset();
});

describe('create club validation helpers', () => {
  it('validates the club name boundaries', () => {
    expect(validateClubName('')).toBe('Nazwa klubu jest wymagana.');
    expect(validateClubName('ab')).toBe('Nazwa klubu musi mieć co najmniej 3 znaki.');
    expect(validateClubName('a'.repeat(61))).toBe('Nazwa klubu może mieć maksymalnie 60 znaków.');
    expect(validateClubName('Book Club')).toBeUndefined();
  });

  it('validates the club description boundaries', () => {
    expect(validateClubDescription('a'.repeat(241))).toBe('Opis może mieć maksymalnie 240 znaków.');
    expect(validateClubDescription('Krótki opis')).toBeUndefined();
  });
});

describe('CreateClubForm', () => {
  it('blocks submit until the fields are valid and shows inline validation', async () => {
    render(React.createElement(CreateClubForm));

    expect(screen.getByRole('button', { name: 'Utwórz klub' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Nazwa klubu'), {
      target: { value: 'ab' },
    });

    fireEvent.blur(screen.getByLabelText('Nazwa klubu'));

    expect(await screen.findByText('Nazwa klubu musi mieć co najmniej 3 znaki.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Utwórz klub' })).toBeDisabled();
  });

  it('submits the form and redirects to the new club page', async () => {
    mockCreateClubPreview.mockResolvedValue({
      ok: true,
      message: 'Twój klub jest gotowy — zaproś pierwszych członków lub dodaj głosowanie.',
      clubId: 'sunset-readers',
    });

    render(React.createElement(CreateClubForm));

    fireEvent.change(screen.getByLabelText('Nazwa klubu'), {
      target: { value: 'Sunset Readers' },
    });

    fireEvent.change(screen.getByLabelText('Opis klubu'), {
      target: { value: 'Wieczorne spotkania przy kawie.' },
    });

    expect(screen.getByRole('button', { name: 'Utwórz klub' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Utwórz klub' }));

    await waitFor(() => {
      expect(mockCreateClubPreview).toHaveBeenCalledWith({
        name: 'Sunset Readers',
        description: 'Wieczorne spotkania przy kawie.',
      });
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/club/sunset-readers');
    });
  });

  it('shows a user-friendly error message when the mock returns an error', async () => {
    mockCreateClubPreview.mockResolvedValue({
      ok: false,
      message: 'Nie udało się utworzyć klubu. Spróbuj ponownie.',
    });

    render(React.createElement(CreateClubForm));

    fireEvent.change(screen.getByLabelText('Nazwa klubu'), {
      target: { value: 'Sunset Readers' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Utwórz klub' }));

    expect(await screen.findByText('Nie udało się utworzyć klubu. Spróbuj ponownie.')).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});