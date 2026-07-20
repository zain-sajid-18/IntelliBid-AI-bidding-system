import { useState, useRef, useEffect } from 'react';
import { useMessagesStore } from '@/store/messagesStore';
import { Bot, Sparkles, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AiChatPanel() {
    const { aiHistory, aiLoading, sendAiMessage } = useMessagesStore();
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    const suggestions = [
        "Should I raise my bid?",
        "Draft a message asking about condition",
        "Summarize my active bids",
        "Explain how proxy bidding works"
    ];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiHistory, aiLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || aiLoading) return;
        const msg = input;
        setInput('');
        await sendAiMessage(msg);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[var(--background)]">
            {/* Header */}
            <div className="p-4 border-b-[3px] border-[var(--ink)] bg-[var(--electric)] text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-[var(--electric)] flex items-center justify-center border-[2px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]">
                    <Bot size={24} />
                </div>
                <div>
                    <h3 className="font-display font-black text-xl uppercase tracking-tight">BidMind</h3>
                    <p className="text-xs font-bold opacity-80">Powered by Gemini AI</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {aiHistory.length === 0 && !aiLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
                        <div className="w-20 h-20 bg-white border-[3px] border-[var(--ink)] rounded-3xl shadow-[4px_4px_0_0_var(--ink)] flex items-center justify-center mb-6">
                            <Sparkles size={40} className="text-[var(--electric)]" />
                        </div>
                        <h2 className="font-display text-2xl font-black uppercase mb-2">Your Personal Auction Expert</h2>
                        <p className="font-medium opacity-70 mb-8">
                            I know your bidding history, active auctions, and preferences. How can I help you win today?
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {suggestions.map(s => (
                                <button
                                    key={s}
                                    onClick={() => sendAiMessage(s)}
                                    className="bg-white border-[2px] border-[var(--ink)] px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[var(--acid)] transition-colors shadow-[2px_2px_0_0_var(--ink)]"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {aiHistory.map((msg, i) => (
                    <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--electric)] border-[2px] border-[var(--ink)] flex items-center justify-center text-white mr-2 mt-1">
                                <Bot size={16} />
                            </div>
                        )}
                        <div className={`max-w-[75%] px-4 py-3 border-[3px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] text-sm font-medium leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-white rounded-2xl rounded-tr-sm' 
                                : 'bg-[var(--acid)] rounded-2xl rounded-tl-sm'
                        }`}>
                            {msg.role === 'model' ? (
                                <div className="prose prose-sm max-w-none">
                                    <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.parts[0].text
                            )}
                        </div>
                    </div>
                ))}
                
                {aiLoading && (
                    <div className="flex w-full justify-start">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--electric)] border-[2px] border-[var(--ink)] flex items-center justify-center text-white mr-2">
                            <Bot size={16} />
                        </div>
                        <div className="px-4 py-4 border-[3px] border-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)] bg-[var(--acid)] rounded-2xl rounded-tl-sm flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-[var(--ink)] animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-[var(--ink)] animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <div className="w-2 h-2 rounded-full bg-[var(--ink)] animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t-[3px] border-[var(--ink)]">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask BidMind..."
                        className="flex-1 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl px-4 py-3 font-medium outline-none focus:shadow-[4px_4px_0_0_var(--electric)] transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || aiLoading}
                        className="bg-[var(--ink)] text-white px-6 py-3 rounded-xl border-[3px] border-[var(--ink)] font-black shadow-[4px_4px_0_0_rgba(0,0,0,0.2)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.2)] transition-all disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
