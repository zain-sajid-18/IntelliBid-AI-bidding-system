import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ChatbotPage from '@/app/(chat)/chat/page';

describe('Chatbot AI Interaction', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders initial bot greeting', () => {
        render(<ChatbotPage />);
        expect(screen.getByText(/Yo! I'm IntelliBot/i)).toBeInTheDocument();
    });

    it('allows user to send a message and receive a response', async () => {
        render(<ChatbotPage />);
        const input = screen.getByPlaceholderText(/ask the agent anything/i);

        const buttons = screen.getAllByRole('button');
        const sendButton = buttons.find(b => !b.textContent);

        fireEvent.change(input, { target: { value: 'Show me vintage cameras' } });
        fireEvent.click(sendButton);

        expect(screen.getByText('Show me vintage cameras')).toBeInTheDocument();

        // Fast-forward through the random timeout (up to 1800ms)
        act(() => {
            jest.advanceTimersByTime(2000);
        });

        // Use a more flexible regex to handle the ** markdown characters in the response
        const response = await screen.findByText(/Found.*6 vintage camera lots/i);
        expect(response).toBeInTheDocument();
    });

    it('handles quick replies', async () => {
        render(<ChatbotPage />);
        const quickReply = screen.getByRole('button', { name: /Find me vintage cameras under \$1,000/i });

        fireEvent.click(quickReply);

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        // Use findByText for the dynamic response
        const chatMessages = await screen.findAllByText(/Find me vintage cameras under \$1,000/i);
        expect(chatMessages.length).toBeGreaterThan(0);

        const botResponse = await screen.findByText(/Found.*6 vintage camera lots/i);
        expect(botResponse).toBeInTheDocument();
    });
});
