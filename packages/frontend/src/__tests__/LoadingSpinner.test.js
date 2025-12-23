import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../components/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render loading spinner', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByText('Loading...');
    expect(spinner).toBeInTheDocument();
  });
});
