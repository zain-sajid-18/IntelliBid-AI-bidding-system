"use client";

import { useEffect } from 'react';
import { useMessagesStore } from '@/store/messagesStore';
import { useAuthStore } from '@/store/authStore';
import InboxSidebar from '@/components/chat/InboxSidebar';
import MessageThread from '@/components/chat/MessageThread';
import AiChatPanel from '@/components/chat/AiChatPanel';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function ChatPage() {
    const {
        initSocket,
        destroySocket,
        fetchThreads,
        fetchAiHistory,
        activeConversationId,
    } = useMessagesStore();
    const { user } = useAuthStore();
    const isSeller = user?.role === 'seller';

    useEffect(() => {
        initSocket();
        fetchThreads();
        fetchAiHistory();
        return () => { destroySocket(); };
    }, []);

    return (
        <div className="h-[calc(100vh-2rem)] max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex flex-wrap items-end justify-between gap-2"
            >
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter">
                        {isSeller ? 'Buyer Inbox' : 'Smart Inbox'}
                    </h1>
                    <p className="font-medium opacity-70 mt-1">
                        {isSeller
                            ? 'Respond to buyer inquiries and consult BidMind for seller advice.'
                            : 'Chat with sellers, receive system alerts, and consult BidMind AI.'}
                    </p>
                </div>
                {isSeller && (
                    <div className="flex items-center gap-2 rounded-xl border-[3px] border-[var(--ink)] bg-[var(--acid)] px-4 py-2 font-display text-xs font-black uppercase shadow-[3px_3px_0_0_var(--ink)]">
                        <MessageCircle className="h-4 w-4" strokeWidth={3} />
                        Seller Mode
                    </div>
                )}
            </motion.div>

            {/* Chat Panel */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 w-full bg-white rounded-3xl border-[4px] border-[var(--ink)] shadow-[8px_8px_0_0_var(--ink)] overflow-hidden flex min-h-0"
            >
                {/* Left: thread list */}
                <InboxSidebar />

                {/* Right: content area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
                    {!activeConversationId ? (
                        <div className="flex-1 flex flex-col items-center justify-center bg-[var(--background)] p-8 text-center">
                            <div className="w-24 h-24 mb-6 grayscale opacity-20">
                                <svg viewBox="0 0 100 100" fill="currentColor">
                                    <path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" />
                                </svg>
                            </div>
                            <h2 className="font-display text-2xl font-black uppercase tracking-widest text-[var(--ink)] mb-2">
                                {isSeller ? 'Select a buyer thread' : 'Select a conversation'}
                            </h2>
                            <p className="font-medium opacity-50 max-w-sm">
                                {isSeller
                                    ? 'Choose a buyer inquiry from the sidebar, or consult BidMind AI for seller advice.'
                                    : 'Choose a thread from the sidebar to start messaging, or consult BidMind AI for auction intelligence.'}
                            </p>
                        </div>
                    ) : activeConversationId === 'ai' ? (
                        <AiChatPanel />
                    ) : (
                        <MessageThread />
                    )}
                </div>
            </motion.div>
        </div>
    );
}
