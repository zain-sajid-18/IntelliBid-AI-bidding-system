import { render, screen, fireEvent } from '@testing-library/react';
import AuctionsPage from '@/app/(seller)/seller/products/page';

describe('Auctions list management', () => {
    it('renders the auctions dashboard with stats', () => {
        render(<AuctionsPage />);
        expect(screen.getByRole('heading', { level: 1, name: /Your Auctions/i })).toBeInTheDocument();
        expect(screen.getByText(/Active Bids/i)).toBeInTheDocument();
    });

    it('displays user bids by default', () => {
        render(<AuctionsPage />);
        expect(screen.getByText(/Air Jordan 1 'Chicago'/i)).toBeInTheDocument();
    });
});
