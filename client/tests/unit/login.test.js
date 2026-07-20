import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/components/auth/LoginView';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));
jest.mock('@react-oauth/google', () => ({
    GoogleLogin: () => <div data-testid="google-login" />,
    GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
}));

describe('Login Feature', () => {
    const mockRouter = { push: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue(mockRouter);
    });

    it('renders login form correctly', () => {
        render(<LoginPage />);
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('validates empty fields', async () => {
        render(<LoginPage />);
        const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
        fireEvent.submit(form);
        await waitFor(() => {
            expect(screen.getByText(/email and password are required/i)).toBeInTheDocument();
        });
    });

    it('submits login successfully and redirects based on role', async () => {
        api.mockResolvedValueOnce({ user: { id: '1', role: 'buyer' } });
        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'buyer@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(api).toHaveBeenCalledWith('/api/auth/login', expect.anything());
            expect(mockRouter.push).toHaveBeenCalledWith('/buyer/dashboard');
        });
    });

    it('handles login server error', async () => {
        api.mockRejectedValueOnce(new Error('Invalid credentials'));
        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });
});
