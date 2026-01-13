import React from 'react';
import { render, screen } from '@testing-library/react';

import App from '../App';

// Mock all page components
jest.mock('../pages/Login', () => ({
  __esModule: true,
  default: () => <div>Login Page</div>
}));

jest.mock('../pages/Register', () => ({
  __esModule: true,
  default: () => <div>Register Page</div>
}));

jest.mock('../pages/ProductList', () => ({
  __esModule: true,
  default: () => <div>Product List Page</div>
}));

jest.mock('../pages/AddProduct', () => ({
  __esModule: true,
  default: () => <div>Add Product Page</div>
}));

jest.mock('../pages/UserList', () => ({
  __esModule: true,
  default: () => <div>User List Page</div>
}));

jest.mock('../components/Navigation', () => ({
  __esModule: true,
  default: () => <div>Navigation Component</div>
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Login Page|Register Page/i)).toBeInTheDocument();
  });

  it('should render login page when not authenticated', () => {
    render(<App />);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should render navigation when authenticated', () => {
    localStorage.setItem('token', 'fake-token');
    render(<App />);
    expect(screen.getByText('Navigation Component')).toBeInTheDocument();
  });
});
