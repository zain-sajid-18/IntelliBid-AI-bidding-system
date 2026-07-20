import { render, screen, fireEvent } from '@testing-library/react';
import ProfilePage from '@/app/(profile)/profile/page';

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Payment Feature', () => {
    it('renders payment method information in profile', () => {
        render(<ProfilePage />);

        const paymentTab = screen.getByRole('button', { name: /payments/i });
        fireEvent.click(paymentTab);

        expect(screen.getByText(/\*\*\*\* \*\*\*\* \*\*\*\* 4291/i)).toBeInTheDocument();
    });

    it('displays the add payment method button', () => {
        render(<ProfilePage />);

        const paymentTab = screen.getByRole('button', { name: /payments/i });
        fireEvent.click(paymentTab);

        expect(screen.getByRole('button', { name: /\+ add payment method/i })).toBeInTheDocument();
    });
});
