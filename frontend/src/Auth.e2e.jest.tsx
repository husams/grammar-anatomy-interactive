/// <reference types="jest" />
// @jest-environment jsdom
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('Authentication E2E', () => {
  beforeEach(() => {
    // Clear localStorage and session for a clean state
    window.localStorage.clear();
    window.sessionStorage.clear();
    // Mock window.alert for login success
    window.alert = jest.fn();
  });

  test('Login page is default and links work', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  test('User can register, login, and request password reset (real backend)', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Go to registration page
    fireEvent.click(screen.getByText(/register/i));
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();

    // Register a new user
    const email = `testuser${Date.now()}@example.com`;
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'TestPass123!' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'TestPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Wait for registration success message
    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });

    // Go back to login
    fireEvent.click(screen.getByText(/back to login/i));
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();

    // Login with the new user
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'TestPass123!' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for login success (alert or dashboard)
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Login successful!');
    });
  });

  test('Shows error on invalid login', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('User can request password reset', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    fireEvent.click(screen.getByText(/forgot password/i));
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(screen.getByText(/you will receive a password reset link/i)).toBeInTheDocument();
    });
  });
}); 