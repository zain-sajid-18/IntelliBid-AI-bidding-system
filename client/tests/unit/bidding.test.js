import { render, screen, fireEvent } from '@testing-library/react';
import AIPicksPage from '@/app/(buyer)/buyer/ai-picks/page';

describe('Bidding flow', () => {
    it('allows opening the bidding form and entering a value', () => {
        render(<AIPicksPage />);

        const bidNowButtons = screen.getAllByRole('button', { name: /bid now/i });
        fireEvent.click(bidNowButtons[0]);

        const bidInput = screen.getByPlaceholderText(/enter your max bid/i);
        fireEvent.change(bidInput, { target: { value: '2000' } });
        expect(bidInput.value).toBe('2000');

        const placeButton = screen.getByRole('button', { name: /place/i });
        expect(placeButton).toBeInTheDocument();
    });

    it('allows cancelling a bid before submission', () => {
        render(<AIPicksPage />);

        const bidNowButtons = screen.getAllByRole('button', { name: /bid now/i });
        fireEvent.click(bidNowButtons[0]);

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(screen.queryByPlaceholderText(/enter your max bid/i)).not.toBeInTheDocument();
    });
});
