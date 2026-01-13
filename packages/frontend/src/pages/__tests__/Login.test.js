import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import Login from '../Login';
import * as api from '../../services/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock('../../services/api');

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('should render login form', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should render link to register page', () => {
    renderLogin();

    const registerLink = screen.getByText(/don't have an account/i).nextSibling;
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should update username input', async () => {
    const user = userEvent.setup();
    renderLogin();

    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'testuser');

    expect(usernameInput).toHaveValue('testuser');
  });

  it('should update password input', async () => {
    const user = userEvent.setup();
    renderLogin();

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  it('should call loginUser on form submit', async () => {
    const user = userEvent.setup();
    api.loginUser.mockResolvedValue({ auth: true, token: 'test-token', user: { id: 1 } });

    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('should navigate to /products on successful login', async () => {
    const user = userEvent.setup();
    api.loginUser.mockResolvedValue({ auth: true, token: 'test-token', user: { id: 1 } });

    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    api.loginUser.mockResolvedValue({ auth: false, error: errorMessage });

    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should show error when API throws exception', async () => {
    const user = userEvent.setup();
    api.loginUser.mockRejectedValue(new Error('Network error'));

    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('should not navigate when auth is false', async () => {
    const user = userEvent.setup();
    api.loginUser.mockResolvedValue({ auth: false, error: 'Invalid' });

    renderLogin();

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should clear error message on new submit', async () => {
    const user = userEvent.setup();
    api.loginUser
      .mockResolvedValueOnce({ auth: false, error: 'First error' })
      .mockResolvedValueOnce({ auth: true, token: 'token', user: { id: 1 } });

    renderLogin();

    // First failed attempt
    await user.type(screen.getByLabelText(/username/i), 'test');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Second successful attempt
    await user.clear(screen.getByLabelText(/username/i));
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });
});
