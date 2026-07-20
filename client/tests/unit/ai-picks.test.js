import { render, screen, fireEvent } from '@testing-library/react';
import AIPicksPage from '../app/(buyer)/ai-picks/page';

describe('AI Picks feature', () => {
    it('renders AI insights and recommendations', () => {
        render(<AIPicksPage />);
        expect(screen.getByText(/Powered by IntelliBid AI/i)).toBeInTheDocument();
    });
});
