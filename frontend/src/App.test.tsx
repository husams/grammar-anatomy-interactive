import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple test to verify the testing setup works
test('renders test setup correctly', () => {
  render(<div>Test Setup Working</div>);
  const testElement = screen.getByText(/Test Setup Working/i);
  expect(testElement).toBeInTheDocument();
});
