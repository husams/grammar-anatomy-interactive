import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModuleSearch from '../ModuleSearch';

describe('ModuleSearch', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Search modules...',
    debounceMs: 300
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders with correct initial value', () => {
    render(<ModuleSearch {...defaultProps} value="initial search" />);
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('initial search');
  });

  it('renders with correct placeholder', () => {
    render(<ModuleSearch {...defaultProps} placeholder="Custom placeholder" />);
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
  });

  it('shows search icon initially', () => {
    render(<ModuleSearch {...defaultProps} />);
    
    const searchIcon = screen.getByRole('searchbox').parentElement?.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  it('updates local value immediately on input change', () => {
    render(<ModuleSearch {...defaultProps} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test search' } });
    
    expect(input).toHaveValue('test search');
  });

  it('calls onChange after debounce delay', async () => {
    const onChangeMock = jest.fn();
    render(<ModuleSearch {...defaultProps} onChange={onChangeMock} debounceMs={300} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test search' } });
    
    // Should not call onChange immediately
    expect(onChangeMock).not.toHaveBeenCalled();
    
    // Fast-forward time past debounce delay
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith('test search');
    });
  });

  it('shows loading spinner during search', () => {
    render(<ModuleSearch {...defaultProps} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should show loading spinner
    const spinner = screen.getByRole('searchbox').parentElement?.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows clear button when there is input', () => {
    render(<ModuleSearch {...defaultProps} value="test" />);
    
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('does not show clear button when input is empty', () => {
    render(<ModuleSearch {...defaultProps} value="" />);
    
    const clearButton = screen.queryByLabelText('Clear search');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const onChangeMock = jest.fn();
    render(<ModuleSearch {...defaultProps} value="test" onChange={onChangeMock} />);
    
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    expect(onChangeMock).toHaveBeenCalledWith('');
  });

  it('clears input when Escape key is pressed', () => {
    const onChangeMock = jest.fn();
    render(<ModuleSearch {...defaultProps} value="test" onChange={onChangeMock} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(onChangeMock).toHaveBeenCalledWith('');
  });

  it('cancels previous debounced calls when new input is typed', async () => {
    const onChangeMock = jest.fn();
    render(<ModuleSearch {...defaultProps} onChange={onChangeMock} debounceMs={300} />);
    
    const input = screen.getByRole('searchbox');
    
    // Type first search
    fireEvent.change(input, { target: { value: 'first' } });
    act(() => {
      jest.advanceTimersByTime(200); // Advance but not enough to trigger
    });
    
    // Type second search before first one triggers
    fireEvent.change(input, { target: { value: 'second' } });
    act(() => {
      jest.advanceTimersByTime(300); // Complete the debounce for second search
    });
    
    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledTimes(1);
      expect(onChangeMock).toHaveBeenCalledWith('second');
    });
  });

  it('is disabled when disabled prop is true', () => {
    render(<ModuleSearch {...defaultProps} disabled={true} />);
    
    const input = screen.getByRole('searchbox');
    expect(input).toBeDisabled();
    
    const clearButton = screen.queryByLabelText('Clear search');
    if (clearButton) {
      expect(clearButton).toBeDisabled();
    }
  });

  it('updates when value prop changes externally', () => {
    const { rerender } = render(<ModuleSearch {...defaultProps} value="initial" />);
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveValue('initial');
    
    rerender(<ModuleSearch {...defaultProps} value="updated" />);
    expect(input).toHaveValue('updated');
  });

  it('shows search hint text when there is input', () => {
    render(<ModuleSearch {...defaultProps} value="test search" />);
    
    expect(screen.getByText('Searching for "test search"')).toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(<ModuleSearch {...defaultProps} />);
    
    const input = screen.getByRole('searchbox');
    expect(input).toHaveAttribute('aria-label', 'Search modules');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('spellCheck', 'false');
  });

  it('applies custom className', () => {
    render(<ModuleSearch {...defaultProps} className="custom-class" />);
    
    const container = screen.getByRole('searchbox').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('uses custom debounce time', async () => {
    const onChangeMock = jest.fn();
    render(<ModuleSearch {...defaultProps} onChange={onChangeMock} debounceMs={500} />);
    
    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // Should not trigger after 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(onChangeMock).not.toHaveBeenCalled();
    
    // Should trigger after 500ms
    act(() => {
      jest.advanceTimersByTime(200);
    });
    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith('test');
    });
  });
});