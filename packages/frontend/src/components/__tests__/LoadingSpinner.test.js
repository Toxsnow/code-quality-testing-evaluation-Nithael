import React from 'react';
import { render, screen } from '@testing-library/react';

import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render loading spinner', () => {
    const { container } = render(<LoadingSpinner />);

    // Check for spinner element with specific styles
    const spinner = container.querySelector('div[style*="animation"]');
    expect(spinner).toBeInTheDocument();
  });

  it('should have correct container styles', () => {
    const { container } = render(<LoadingSpinner />);

    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    });
  });

  it('should render spinner with rotation animation', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('div[style*="animation"]');
    expect(spinner).toHaveStyle({
      animation: 'spin 1s linear infinite'
    });
  });

  it('should render with circular border', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('div[style*="border-radius"]');
    expect(spinner).toHaveStyle({
      borderRadius: '50%'
    });
  });
});
