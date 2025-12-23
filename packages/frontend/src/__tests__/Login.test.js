import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

jest.mock('../services/api');

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login Component', () => {
  it('should render login form', () => {
    renderWithRouter(<Login onLogin={() => {}} />);

    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should render register link', () => {
    renderWithRouter(<Login onLogin={() => {}} />);

    expect(screen.getByText(/register/i)).toBeInTheDocument();
  });
});
