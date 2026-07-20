/**
 * Integration: AuctionDetailPage → Bidding Component → api client → updated state
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuctionDetailPage from '@/app/(buyer)/auction/[id]/page';
import { createApiMock } from './helpers/apiMock';

jest.mock('@/lib/api', () => ({
    api: jest.fn(),
}));

jest.mock('@/store/authStore', () => ({
    useAuthStore: jest.fn((selector) => {
        const state = { user: { _id: 'user-buyer' } };
        return selector ? selector(state) : state;
    }),
}));

// Mock params for Next.js app router component
jest.mock('next/navigation', () => ({
    useParams: () => ({ id: 'auction-1' }),
    useRouter: () => ({ push: jest.fn() })
}));

const { api } = require('@/lib/api');

describe('Integration — Auction Detail Bidding Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('displays auction details and successfully places a bid', async () => {
        api.mockImplementation(
            createApiMock({
                'GET /api/auction/auction-1': async () => {
                    return {
                        data: {
                            success: true,
                            data: {
                                _id: 'auction-1',
                                title: 'Rare Stamp',
                                description: 'A very rare stamp from 1900',
                                currentPrice: 500,
                                startingPrice: 100,
                                seller: { username: 'seller-john' },
                                endTime: new Date(Date.now() + 86400000).toISOString(),
                                status: 'active',
                                images: [],
                                bids: []
                            },
                        },
                    };
                },
                'POST /api/bidding/auction-1/bid': async ({ body }) => {
                    expect(body.amount).toBe(550);
                    return {
                        data: {
                            success: true,
                            data: {
                                amount: 550,
                                bidder: 'user-buyer'
                            },
                            message: 'Bid placed successfully'
                        }
                    };
                }
            })
        );

        // Render page with mocked params
        render(<AuctionDetailPage params={{ id: 'auction-1' }} />);

        // Wait for auction data to load
        await waitFor(() => {
            expect(screen.getByText('Rare Stamp')).toBeInTheDocument();
            expect(screen.getByText('$500')).toBeInTheDocument();
        });

        const user = userEvent.setup();
        
        // Find bid input and button (assuming standard accessibility roles)
        const bidInput = screen.getByRole('spinbutton'); // usually input type number
        const bidButton = screen.getByRole('button', { name: /place bid/i });

        await user.type(bidInput, '550');
        await user.click(bidButton);

        await waitFor(() => {
            expect(api).toHaveBeenCalledWith('/api/bidding/auction-1/bid', expect.objectContaining({
                method: 'POST',
                data: { amount: 550 }
            }));
            // UI should update to show success message or new bid price
            expect(screen.getByText(/success/i)).toBeInTheDocument();
        });
    });
});
