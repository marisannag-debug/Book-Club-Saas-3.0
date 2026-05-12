import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoginForm from '../../app/components/auth/LoginForm';
import RegisterForm from '../../app/components/auth/RegisterForm';
import { loginUser, registerUser } from '../../lib/auth';

describe('auth helpers', () => {
  it('formats a register success message', async () => {
    await expect(registerUser('reader@example.com', 'secret123')).resolves.toEqual({
      ok: true,
      message: 'Zarejestrowano: reader@example.com (mock)',
    });
  });

  it('formats a login success message', async () => {
    await expect(loginUser('reader@example.com', 'secret123')).resolves.toEqual({
      ok: true,
      message: 'Zalogowano: reader@example.com (mock)',
    });
  });
});

describe('RegisterForm', () => {
  it('submits the form and shows a success message', async () => {
    render(React.createElement(RegisterForm));

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'reader@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Hasło'), {
      target: { value: 'secret123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Zarejestruj się' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Zarejestrowano: reader@example.com (mock)',
      );
    });
  });
});

describe('LoginForm', () => {
  it('submits the form and shows a success message', async () => {
    render(React.createElement(LoginForm));

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'reader@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Hasło'), {
      target: { value: 'secret123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Zaloguj' }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Zalogowano: reader@example.com (mock)',
      );
    });
  });
});