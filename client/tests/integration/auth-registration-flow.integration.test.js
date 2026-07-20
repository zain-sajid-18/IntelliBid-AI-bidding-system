/**
 * Integration: Registration Page → api client → success UI state
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../../app/(auth)/register/page';
import { createApiMock } from './helpers/apiMock';

jest.mock('@/lib/api', () => ({
    api: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@react-oauth/google', () => ({
    GoogleLogin: () => <div data-testid="google-login" />,
    GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
}));

const { api } = require('@/lib/api');

describe('Integration — Registration Page + API Layer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('submits full registration payload and shows verification message', async () => {
        api.mockImplementation(
            createApiMock({
                'POST /api/auth/signup': async ({ body }) => ({
                    data: {
                        success: true,
                        message: 'Account created. Check your email to verify.',
                        user: { id: '1', email: body.email, role: 'buyer' },
                    },
                }),
            })
        );

        render(<Signup />);

        fireEvent.change(screen.getByPlaceholderText('Jane'), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'jane.integration@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'SecurePass123' } });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        await waitFor(() => {
            expect(api).toHaveBeenCalledWith(
                '/api/auth/signup',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('jane.integration@gmail.com'),
                })
            );
            expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        });
    });

    it('displays server validation error from API layer', async () => {
        api.mockImplementation(
            createApiMock({
                'POST /api/auth/signup': async () => ({ error: 'Email already registered' }),
            })
        );

        render(<Signup />);

        fireEvent.change(screen.getByPlaceholderText('Jane'), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'exists@gmail.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'SecurePass123' } });
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        expect(await screen.findByText(/Email already registered/i)).toBeInTheDocument();
    });
});
