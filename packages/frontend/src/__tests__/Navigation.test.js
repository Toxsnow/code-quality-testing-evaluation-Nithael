import { render, screen } from '@testing-library/react';
import Navigation from '../components/Navigation';
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navigation Component', () => {
  it('should render navigation links when authenticated', () => {
    renderWithRouter(<Navigation isAuthenticated={true} onLogout={() => {}} />);

    expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
  });

  it('should render logout button when authenticated', () => {
    renderWithRouter(<Navigation isAuthenticated={true} onLogout={() => {}} />);

    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should render login link when not authenticated', () => {
    renderWithRouter(<Navigation isAuthenticated={false} onLogout={() => {}} />);

    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
