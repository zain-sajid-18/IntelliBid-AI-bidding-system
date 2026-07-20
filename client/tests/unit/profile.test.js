import { render, screen, fireEvent } from '@testing-library/react';
import ProfilePage from '@/app/(profile)/profile/page';

describe('Profile Page Feature', () => {
    it('renders profile information correctly', () => {
        render(<ProfilePage />);
        expect(screen.getByText('Maya R.')).toBeInTheDocument();
        expect(screen.getByText(/@mayacollects/i)).toBeInTheDocument();
    });

    it('toggles edit mode when the edit button is clicked', () => {
        render(<ProfilePage />);
        const editButton = screen.getByRole('button', { name: /edit/i });

        fireEvent.click(editButton);
        expect(screen.getByDisplayValue(/collector of all things/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });

    it('displays correctly switching between activity and payments tabs', () => {
        render(<ProfilePage />);

        const paymentTab = screen.getByRole('button', { name: /payments/i });
        fireEvent.click(paymentTab);

        expect(screen.getByText(/\*\*\*\* \*\*\*\* \*\*\*\* 4291/i)).toBeInTheDocument();
    });
});
