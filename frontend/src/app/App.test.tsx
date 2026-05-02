import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders the login page when there is no authenticated user', () => {
    render(<App />);

    expect(screen.getByText(/sistema de seguimiento estudiantil/i)).toBeInTheDocument();
  });

  it('renders the reportería page when user data is stored in localStorage', async () => {
    localStorage.setItem('currentUser', JSON.stringify({ email: 'demo@test.com', name: 'Demo' }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/reportería/i)).toBeInTheDocument();
    });
  });
});
