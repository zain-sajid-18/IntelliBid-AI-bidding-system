/**
 * Integration: DiscoverPage → SearchBar → api client → search results rendering
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiscoverPage from '@/app/(buyer)/discover/page';
import { createApiMock } from './helpers/apiMock';

jest.mock('@/lib/api', () => ({
    api: jest.fn(),
}));

jest.mock('@/store/feedStore', () => ({
    useFeedStore: jest.fn((selector) => {
        const state = {
            fetchNextPage: jest.fn(),
            items: [{ id: 'feed-1', title: 'Feed Item' }],
            page: 1,
            loading: false,
            feedType: 'personalized',
            filters: { category: 'all', priceRange: [0, 10000], query: '' },
            setFilters: jest.fn()
        };
        return selector ? selector(state) : state;
    }),
}));

jest.mock('@/store/authStore', () => ({
    useAuthStore: jest.fn((selector) => {
        const state = { user: { _id: 'user-1' } };
        return selector ? selector(state) : state;
    }),
}));

const { api } = require('@/lib/api');

describe('Integration — Discover Search + API Layer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Storage.prototype.getItem = jest.fn(() => 'true');
    });

    it('calls auction search API and renders returned results', async () => {
        api.mockImplementation(
            createApiMock({
                'GET /api/auction/search': async ({ endpoint }) => {
                    expect(endpoint).toContain('q=rolex');
                    return {
                        data: {
                            success: true,
                            data: [
                                {
                                    _id: 'auction-1',
                                    title: 'Rolex Submariner',
                                    description: 'A classic film camera in mint condition.',
                                    currentPrice: 250,
                                    seller: { name: 'VintageCameras', id: 'seller-456' },
                                    endDate: new Date(Date.now() + 86400000).toISOString(),
                                    status: 'active',
                                    images: [],
                                },
                            ],
                        },
                    };
                },
            })
        );

        render(<DiscoverPage />);

        const user = userEvent.setup();
        const searchInput = screen.getByRole('textbox');

        await user.type(searchInput, 'rolex');
        await user.keyboard('{Enter}');

        await waitFor(() => {
            expect(api).toHaveBeenCalledWith(expect.stringContaining('/api/auction/search?q=rolex'));
            expect(screen.getByText('Rolex Submariner')).toBeInTheDocument();
        });
    });
});
