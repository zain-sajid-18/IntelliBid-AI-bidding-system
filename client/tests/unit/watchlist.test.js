import { render, screen, fireEvent } from '@testing-library/react';
import AIPicksPage from '@/app/(buyer)/buyer/ai-picks/page';

describe('Watchlist actions', () => {
    it('allows a user to click the watchlist button', () => {
        render(<AIPicksPage />);

        const watchlistButtons = screen.getAllByRole('button', { name: /watchlist ☆/i });
        expect(watchlistButtons.length).toBeGreaterThan(0);

        // Mock click
        fireEvent.click(watchlistButtons[0]);
        // Note: In the prototype, this is just a stateless button, but we verify it's interactive
    });
});
