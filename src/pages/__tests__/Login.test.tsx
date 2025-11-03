import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';
import * as authContext from '@/contexts/AuthContext';
import Login from '../Login';

// Mock the modules
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  
  // Mock the AuthContext
  const mockAuth = {
    login: mockLogin,
    logout: jest.fn().mockResolvedValue(undefined),
    isAuthenticated: false,
    username: null,
    isLoading: false,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup the AuthContext mock
    jest.spyOn(authContext, 'useAuth').mockReturnValue(mockAuth);

    // Setup the component with necessary providers
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  });

  it('renders the login form', () => {
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls login function with correct credentials', async () => {
    // Mock the login function to resolve successfully
    mockLogin.mockResolvedValueOnce({});

    // Enter credentials
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check if login was called with correct credentials
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'admin',
        password: 'admin',
      });
    });
  });

  it('shows error message when login fails', async () => {
    // Mock the login function to reject with an error
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));

    // Enter credentials
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check if error toast is shown with the correct structure
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Login failed',
        description: 'Invalid credentials',
        variant: 'destructive',
      });
    });
  });

  it('navigates to chat page on successful login', async () => {
    // Mock successful login
    mockLogin.mockResolvedValueOnce({});

    // Enter credentials and submit
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'admin' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Check if navigation occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/chat');
    });
  });
});
