"use client";

import { useState, useRef, useEffect } from 'react';
import { useMessagesStore } from '@/store/messagesStore';
import { useAuthStore } from '@/store/authStore';
import MessageBubble from './MessageBubble';
import AuctionContextCard from './AuctionContextCard';
import QuickReplyBar from './QuickReplyBar';
import { Send, Loader2 } from 'lucide-react';

export default function MessageThread() {
    const { activeConversationId, threads, messages, loading, sendMessage } = useMessagesStore();
    const { user } = useAuthStore();
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const thread = threads.find(t => t._id === activeConversationId);
    const threadMessages = messages[activeConversationId] || [];
    const isSeller = user?.role === 'seller';

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [threadMessages]);

    if (!thread) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending) return;
        setSending(true);
        await sendMessage(activeConversationId, input);
        setInput('');
        setSending(false);
    };

    const otherName = thread.type === 'system'
        ? 'System Notifications'
        : `${thread.otherParticipant?.firstName || 'User'} ${thread.otherParticipant?.lastName || ''}`.trim();

    return (
        <div className="flex-1 flex flex-col h-full bg-[var(--background)] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b-[3px] border-[var(--ink)] bg-white flex items-center gap-3 shrink-0">
                {/* Avatar */}
                <div className="h-10 w-10 shrink-0 rounded-full border-[3px] border-[var(--ink)] bg-[var(--background)] overflow-hidden flex items-center justify-center font-display font-black text-sm shadow-[2px_2px_0_0_var(--ink)]">
                    {thread.otherParticipant?.avatar
                        ? <img src={thread.otherParticipant.avatar} alt={otherName} className="h-full w-full object-cover" />
                        : otherName.charAt(0).toUpperCase()
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-display font-black text-base leading-tight truncate">{otherName}</h3>
                    {thread.auctionRef && (
                        <span className="text-[10px] font-bold text-[var(--ink)]/50 uppercase tracking-widest">
                            Re: {thread.auctionRef.title}
                        </span>
                    )}
                </div>
                {isSeller && (
                    <div className="shrink-0 rounded-full border-[2px] border-[var(--ink)] bg-[var(--acid)] px-3 py-1 font-display text-[10px] font-black uppercase shadow-[1px_1px_0_0_var(--ink)]">
                        Seller View
                    </div>
                )}
            </div>

            {/* Auction context card (shown to sellers when thread is linked to an auction) */}
            {thread.auctionRef && <AuctionContextCard auction={thread.auctionRef} />}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : threadMessages.length === 0 ? (
                    <div className="text-center opacity-50 mt-10 text-sm font-medium">
                        {isSeller
                            ? 'No messages yet. The buyer will reach out shortly.'
                            : 'No messages yet. Send a message to start the conversation!'}
                    </div>
                ) : (
                    threadMessages.map(msg => (
                        <MessageBubble key={msg._id} message={msg} isSystem={thread.type === 'system'} />
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            {thread.type !== 'system' && (
                <div className="shrink-0 bg-white border-t-[3px] border-[var(--ink)]">
                    {/* Quick reply bar for sellers */}
                    {isSeller && <QuickReplyBar onSelect={(text) => setInput(text)} />}

                    <div className="p-4">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isSeller ? "Reply to buyer…" : "Type your message..."}
                                className="flex-1 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl px-4 py-3 font-medium outline-none focus:shadow-[4px_4px_0_0_var(--hotpink)] focus:-translate-y-1 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || sending}
                                className="bg-[var(--electric)] text-white px-6 py-3 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
