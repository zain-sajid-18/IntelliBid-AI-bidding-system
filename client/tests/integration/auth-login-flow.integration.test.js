/**
 * Integration: LoginPage → api client → authStore → router navigation
 *
 * Unlike unit tests that only assert api() was called, this verifies the auth
 * store receives the user payload and navigation uses the role-based route map.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginView from '@/components/auth/LoginView';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { createApiMock } from './helpers/apiMock';

jest.mock('@/lib/api', () => ({
    api: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@react-oauth/google', () => ({
    GoogleLogin: () => <div data-testid="google-login" />,
    GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
}));

const { api } = require('@/lib/api');

describe('Integration — Login Page + Auth Store + API Layer', () => {
    const mockRouter = { push: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({ user: null, viewMode: null });
        useRouter.mockReturnValue(mockRouter);
    });

    it('updates auth store and redirects buyer after successful login API response', async () => {
        api.mockImplementation(
            createApiMock({
                'POST /api/auth/login': async ({ body }) => ({
                    data: {
                        success: true,
                        user: { id: 'buyer-1', email: body.email, role: 'buyer', firstName: 'Alex' },
                    },
                }),
            })
        );

        render(<LoginView />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'buyer.integration@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'SecurePass123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(api).toHaveBeenCalledWith(
                '/api/auth/login',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        email: 'buyer.integration@gmail.com',
                        password: 'SecurePass123',
                    }),
                })
            );
            expect(useAuthStore.getState().user).toEqual(
                expect.objectContaining({ email: 'buyer.integration@gmail.com', role: 'buyer' })
            );
            expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('routes sellers to seller dashboard after login', async () => {
        api.mockImplementation(
            createApiMock({
                'POST /api/auth/login': async () => ({
                    data: {
                        success: true,
                        user: { id: 'seller-1', email: 'seller.integration@gmail.com', role: 'seller' },
                    },
                }),
            })
        );

        render(<LoginView />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'seller.integration@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'SecurePass123' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('/seller/dashboard');
        });
    });

    it('surfaces API error without mutating auth store', async () => {
        api.mockImplementation(
            createApiMock({
                'POST /api/auth/login': async () => ({ error: 'Invalid email or password' }),
            })
        );

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
        expect(useAuthStore.getState().user).toBeNull();
        expect(mockRouter.push).not.toHaveBeenCalled();
    });
});
