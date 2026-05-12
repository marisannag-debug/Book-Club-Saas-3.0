import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import LoginForm from '../../app/components/auth/LoginForm';
import RegisterForm from '../../app/components/auth/RegisterForm';
import { loginUser, registerUser, resetSupabaseClientForTests } from '../../lib/auth';

const { mockReplace } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

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

const mockedCreateClient = vi.mocked(createClient);
const mockSignUp = vi.fn();
const mockSignIn = vi.fn();

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  resetSupabaseClientForTests();
  mockReplace.mockReset();
  mockSignUp.mockReset();
  mockSignIn.mockReset();
  mockedCreateClient.mockReset();
  mockedCreateClient.mockReturnValue({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignIn,
    },
  } as never);
});

describe('auth helpers', () => {
  it('uses Supabase Auth for registration success', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { email: 'reader@example.com' }, session: null },
      error: null,
    });

    await expect(registerUser('reader@example.com', 'secret123')).resolves.toEqual({
      ok: true,
      message: 'Konto utworzone dla reader@example.com. Sprawdź skrzynkę, aby potwierdzić adres e-mail.',
    });

    expect(mockedCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key');
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'reader@example.com',
      password: 'secret123',
    });
  });

  it('maps Supabase registration errors to user-friendly messages', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    await expect(registerUser('reader@example.com', 'secret123')).resolves.toEqual({
      ok: false,
      message: 'Ten adres e-mail jest już zarejestrowany.',
    });
  });

  it('uses Supabase Auth for login success', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { email: 'reader@example.com' }, session: { access_token: 'token' } },
      error: null,
    });

    await expect(loginUser('reader@example.com', 'secret123')).resolves.toEqual({
      ok: true,
      message: 'Zalogowano jako reader@example.com.',
    });

    expect(mockedCreateClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key');
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'reader@example.com',
      password: 'secret123',
    });
  });

  it('maps Supabase login errors to user-friendly messages', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(loginUser('reader@example.com', 'secret123')).resolves.toEqual({
      ok: false,
      message: 'Nieprawidłowy e-mail lub hasło.',
    });
  });
});

describe('RegisterForm', () => {
  it('blocks submit until the fields are valid and shows inline validation', async () => {
    render(React.createElement(RegisterForm));

    expect(screen.getByRole('button', { name: 'Zarejestruj się' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'reader@' },
    });

    expect(await screen.findByText('Wpisz poprawny adres e-mail.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Hasło'), {
      target: { value: 'abc' },
    });

    expect(await screen.findByText('Hasło musi mieć co najmniej 6 znaków.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zarejestruj się' })).toBeDisabled();
  });

  it('submits the form and shows a success message', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { email: 'reader@example.com' }, session: null },
      error: null,
    });

    render(React.createElement(RegisterForm));

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'reader@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Hasło'), {
      target: { value: 'secret123' },
    });

    expect(screen.getByRole('button', { name: 'Zarejestruj się' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Zarejestruj się' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Konto utworzone dla reader@example.com. Sprawdź skrzynkę, aby potwierdzić adres e-mail.',
      );
    });
  });
});

describe('LoginForm', () => {
  it('blocks submit until the fields are valid and shows inline validation', async () => {
    render(React.createElement(LoginForm));

    expect(screen.getByRole('button', { name: 'Zaloguj się' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'reader@' },
    });

    expect(await screen.findByText('Wpisz poprawny adres e-mail.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zaloguj się' })).toBeDisabled();
  });

  it('submits the form and shows a success message', async () => {
    mockSignIn.mockResolvedValue({
      data: { user: { email: 'reader@example.com' }, session: { access_token: 'token' } },
      error: null,
    });

    render(React.createElement(LoginForm));

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'reader@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Hasło'), {
      target: { value: 'secret123' },
    });

    expect(screen.getByRole('button', { name: 'Zaloguj się' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });
});