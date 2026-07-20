/**
 * Integration: authStore.checkAuth → api(/api/auth/me) → user state hydration
 */
import { useAuthStore } from '@/store/authStore';
import { createApiMock } from './helpers/apiMock';

jest.mock('@/lib/api', () => ({
    api: jest.fn(),
}));

const { api } = require('@/lib/api');

describe('Integration — Auth Store Session Hydration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({ user: null, viewMode: null });
    });

    it('hydrates user from /api/auth/me on checkAuth success', async () => {
        api.mockImplementation(
            createApiMock({
                'GET /api/auth/me': async () => ({
                    data: {
                        success: true,
                        user: {
                            id: 'user-99',
                            email: 'session@gmail.com',
                            role: 'buyer',
                            firstName: 'Session',
                        },
                    },
                }),
            })
        );

        await useAuthStore.getState().checkAuth();

        expect(api).toHaveBeenCalledWith('/api/auth/me');
        expect(useAuthStore.getState().user).toEqual(
            expect.objectContaining({ email: 'session@gmail.com', role: 'buyer' })
        );
    });

    it('clears user state when session check fails', async () => {
        useAuthStore.setState({
            user: { id: 'stale', email: 'stale@gmail.com', role: 'buyer' },
        });

        api.mockImplementation(
            createApiMock({
                'GET /api/auth/me': async () => ({ error: 'Not authenticated' }),
            })
        );

        await useAuthStore.getState().checkAuth();

        expect(useAuthStore.getState().user).toBeNull();
    });
});
