import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '@/app/(auth)/register/page';
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

describe('User Registration', () => {
    const mockRouter = { push: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue(mockRouter);
    });

    it('renders registration form correctly', () => {
        render(<Signup />);
        expect(screen.getByText(/join the hustle/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Jane')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('updates state on input change', () => {
        render(<Signup />);
        const firstNameInput = screen.getByPlaceholderText('Jane');
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        expect(firstNameInput.value).toBe('John');
    });

    it('submits registration form successfully', async () => {
        api.mockResolvedValueOnce({ user: { id: '1', email: 'test@example.com' } });
        render(<Signup />);

        fireEvent.change(screen.getByPlaceholderText('Jane'), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(api).toHaveBeenCalledWith('/api/auth/signup', expect.anything());
            expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        });
    });

    it('displays error message on failure', async () => {
        api.mockRejectedValueOnce(new Error('Registration failed'));
        render(<Signup />);

        fireEvent.change(screen.getByPlaceholderText('Jane'), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'test@example.com' } });

        const form = screen.getByRole('button', { name: /create account/i }).closest('form');
        fireEvent.submit(form);

        expect(await screen.findByText(/Registration failed/i)).toBeInTheDocument();
    });
});
