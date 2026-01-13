import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Navigation from '../Navigation';
import * as api from '../../services/api';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../services/api');

describe('Navigation', () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify({ firstname: 'John', lastname: 'Doe' }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderNavigation = () => {
    return render(
      <BrowserRouter>
        <Navigation onLogout={mockOnLogout} />
      </BrowserRouter>
    );
  };

  it('should render navigation with links', () => {
    renderNavigation();

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('should render logout button', () => {
    renderNavigation();

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should display user greeting with firstname', () => {
    renderNavigation();

    const greeting = screen.getByText(/Good (morning|afternoon|evening), John/i);
    expect(greeting).toBeInTheDocument();
  });

  it('should handle logout when button is clicked', () => {
    api.logout = jest.fn();
    renderNavigation();

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(api.logout).toHaveBeenCalled();
    expect(mockOnLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should render Users link with correct path', () => {
    renderNavigation();

    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveAttribute('href', '/users');
  });

  it('should render Products link with correct path', () => {
    renderNavigation();

    const productsLink = screen.getByText('Products').closest('a');
    expect(productsLink).toHaveAttribute('href', '/products');
  });

  it('should display User as default when no user data', () => {
    localStorage.setItem('user', JSON.stringify({}));
    renderNavigation();

    const greeting = screen.getByText(/Good (morning|afternoon|evening), User/i);
    expect(greeting).toBeInTheDocument();
  });

  it('should show appropriate greeting based on time of day', () => {
    const originalDate = Date;
    const mockDate = new Date('2024-01-01T10:00:00');
    global.Date = jest.fn(() => mockDate);
    global.Date.now = originalDate.now;

    renderNavigation();

    const greeting = screen.getByText(/Good morning, John/i);
    expect(greeting).toBeInTheDocument();

    global.Date = originalDate;
  });
});
