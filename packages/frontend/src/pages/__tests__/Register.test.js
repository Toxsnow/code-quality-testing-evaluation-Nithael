import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import Register from '../Register';
import * as api from '../../services/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock('../../services/api');

describe('Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  it('should render register form', () => {
    renderRegister();

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should render link to login page', () => {
    renderRegister();

    const loginLink = screen.getByText(/already have an account/i).nextSibling;
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should update firstname input', async () => {
    const user = userEvent.setup();
    renderRegister();

    const firstnameInput = screen.getByLabelText(/first name/i);
    await user.type(firstnameInput, 'John');

    expect(firstnameInput).toHaveValue('John');
  });

  it('should update lastname input', async () => {
    const user = userEvent.setup();
    renderRegister();

    const lastnameInput = screen.getByLabelText(/last name/i);
    await user.type(lastnameInput, 'Doe');

    expect(lastnameInput).toHaveValue('Doe');
  });

  it('should update username input', async () => {
    const user = userEvent.setup();
    renderRegister();

    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'johndoe');

    expect(usernameInput).toHaveValue('johndoe');
  });

  it('should update password input', async () => {
    const user = userEvent.setup();
    renderRegister();

    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  it('should call registerUser on form submit', async () => {
    const user = userEvent.setup();
    api.registerUser.mockResolvedValue({ auth: true, token: 'test-token', user: { id: 1 } });

    renderRegister();

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith({
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        password: 'password123'
      });
    });
  });

  it('should navigate to /products on successful registration', async () => {
    const user = userEvent.setup();
    api.registerUser.mockResolvedValue({ auth: true, token: 'test-token', user: { id: 1 } });

    renderRegister();

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('should show error message on registration failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Username already exists';
    api.registerUser.mockResolvedValue({ auth: false, error: errorMessage });

    renderRegister();

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should show error when API throws exception', async () => {
    const user = userEvent.setup();
    api.registerUser.mockRejectedValue(new Error('Network error'));

    renderRegister();

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('should not navigate when auth is false', async () => {
    const user = userEvent.setup();
    api.registerUser.mockResolvedValue({ auth: false, error: 'Invalid' });

    renderRegister();

    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should clear error message on new submit', async () => {
    const user = userEvent.setup();
    api.registerUser
      .mockResolvedValueOnce({ auth: false, error: 'First error' })
      .mockResolvedValueOnce({ auth: true, token: 'token', user: { id: 1 } });

    renderRegister();

    // First failed attempt
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/username/i), 'test');
    await user.type(screen.getByLabelText(/password/i), 'pass');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Second successful attempt
    await user.clear(screen.getByLabelText(/username/i));
    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });
});
