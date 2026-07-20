import { render, screen, fireEvent } from '@testing-library/react';
import AlertsPage from '@/app/(buyer)/dashboard/page';

describe('Alerts Hub Feature', () => {
    it('renders alerts list', () => {
        render(<AlertsPage />);
        expect(screen.getByText(/3 unread notifications/i)).toBeInTheDocument();
    });
});
