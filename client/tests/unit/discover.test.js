import { render, screen, fireEvent } from '@testing-library/react';
import DiscoverPage from '@/app/(buyer)/discover/page';

describe('Discover and Search Feature', () => {
    it('renders search bar and category filters', () => {
        render(<DiscoverPage />);
        expect(screen.getByPlaceholderText(/search 'vintage cameras'/i)).toBeInTheDocument();
    });

    it('filters results based on search input', () => {
        render(<DiscoverPage />);
        const searchInput = screen.getByPlaceholderText(/search 'vintage cameras'/i);
        fireEvent.change(searchInput, { target: { value: 'Rolex' } });
        expect(screen.getByText(/Rolex Submariner 16610/i)).toBeInTheDocument();
    });
});
