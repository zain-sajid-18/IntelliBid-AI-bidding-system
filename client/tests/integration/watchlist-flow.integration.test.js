/**
 * Integration: WatchlistPage → Watchlist Components → api client → rendering
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WatchlistPage from '@/app/(buyer)/dashboard/page';
import { createApiMock } from './helpers/apiMock';

jest.mock('@/lib/api', () => ({
    api: jest.fn(),
}));

jest.mock('@/store/authStore', () => ({
    useAuthStore: jest.fn((selector) => {
        const state = { user: { _id: 'user-1', watchlist: ['auction-1'] } };
        return selector ? selector(state) : state;
    }),
}));

const { api } = require('@/lib/api');

describe('Integration — Buyer Watchlist Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Storage.prototype.getItem = jest.fn(() => 'true');
    });

    it('fetches and displays watchlisted items', async () => {
        api.mockImplementation(
            createApiMock({
                'GET /api/buyer/watchlist': async () => {
                    return {
                        data: {
                            success: true,
                            watchlist: [
                                {
                                    _id: 'auction-1',
                                    title: 'Vintage Camera',
                                    currentPrice: 150,
                                    images: ['https://cdn.test/camera.jpg'],
                                    endTime: new Date(Date.now() + 86400000).toISOString(),
                                    status: 'active'
                                },
                            ],
                        },
                    };
                },
            })
        );

        render(<WatchlistPage />);

        await waitFor(() => {
            expect(api).toHaveBeenCalledWith('/api/buyer/watchlist');
            expect(screen.getByText('Vintage Camera')).toBeInTheDocument();
            expect(screen.getByText('$150')).toBeInTheDocument();
        });
    });

    it('removes item from watchlist on remove button click', async () => {
        api.mockImplementation(
            createApiMock({
                'GET /api/buyer/watchlist': async () => {
                    return {
                        data: {
                            success: true,
                            watchlist: [
                                {
                                    _id: 'auction-1',
                                    title: 'Vintage Camera',
                                    currentPrice: 150,
                                    images: ['https://cdn.test/camera.jpg'],
                                    endTime: new Date(Date.now() + 86400000).toISOString(),
                                    status: 'active'
                                }
                            ]
                        }
                    };
                },
                'DELETE /api/buyer/watchlist/auction-1': async () => {
                    return { data: { success: true, message: 'Removed' } };
                }
            })
        );

        render(<WatchlistPage />);

        // Wait for initial render
        await waitFor(() => {
            expect(screen.getByText('Vintage Camera')).toBeInTheDocument();
        });

        // Click remove (assuming a remove button exists and has appropriate role or label)
        const user = userEvent.setup();
        const removeButtons = screen.getAllByRole('button', { name: /remove|delete/i });
        await user.click(removeButtons[0]);

        await waitFor(() => {
            expect(api).toHaveBeenCalledWith('/api/buyer/watchlist/auction-1', expect.objectContaining({ method: 'DELETE' }));
        });
    });
});
