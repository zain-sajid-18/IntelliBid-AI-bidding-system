"use client";

import { useMessagesStore } from '@/store/messagesStore';
import { Bot, MessageCircle, Info } from 'lucide-react';
// Removed date-fns to avoid installation overhead

export default function InboxSidebar() {
    const { threads, activeConversationId, setActiveConversation, totalUnread } = useMessagesStore();

    // Helper for relative time
    const getRelativeTime = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="w-full md:w-80 h-full bg-white border-[3px] border-[var(--ink)] flex flex-col shrink-0">
            {/* Header */}
            <div className="p-4 border-b-[3px] border-[var(--ink)] bg-[var(--background)] flex justify-between items-center">
                <h2 className="font-display text-xl font-black uppercase tracking-tight">Inbox</h2>
                {totalUnread > 0 && (
                    <span className="bg-[var(--hotpink)] text-white text-xs font-black px-2 py-1 rounded-full shadow-[2px_2px_0_0_var(--ink)] border-[2px] border-[var(--ink)]">
                        {totalUnread} NEW
                    </span>
                )}
            </div>

            {/* AI Assistant Pinned */}
            <div className="p-2 border-b-[3px] border-[var(--ink)] bg-[var(--electric)]">
                <button
                    onClick={() => setActiveConversation('ai')}
                    className={`w-full text-left p-3 rounded-xl border-[2px] border-[var(--ink)] flex items-center gap-3 transition-all ${activeConversationId === 'ai' ? 'bg-[var(--acid)] shadow-[4px_4px_0_0_var(--ink)] -translate-y-1' : 'bg-white hover:bg-gray-50'}`}
                >
                    <div className="w-10 h-10 rounded-full bg-[var(--electric)] flex items-center justify-center border-[2px] border-[var(--ink)] text-white">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-display font-black text-sm uppercase">BidMind AI</h3>
                        <p className="text-xs font-medium opacity-70">Your auction assistant</p>
                    </div>
                </button>
            </div>

            {/* Threads List */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                {threads.length === 0 ? (
                    <div className="text-center p-6 text-sm font-medium opacity-50 flex flex-col items-center">
                        <MessageCircle size={32} className="mb-2 opacity-30" />
                        No messages yet
                    </div>
                ) : (
                    threads.map(thread => (
                        <button
                            key={thread._id}
                            onClick={() => setActiveConversation(thread._id)}
                            className={`w-full text-left p-3 rounded-xl border-[2px] border-[var(--ink)] flex items-start gap-3 transition-all ${activeConversationId === thread._id ? 'bg-[var(--background)] shadow-[4px_4px_0_0_var(--ink)] -translate-y-1' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-[2px] border-[var(--ink)] ${thread.type === 'system' ? 'bg-[var(--sunset)] text-white' : 'bg-gray-100 overflow-hidden'}`}>
                                {thread.type === 'system' ? (
                                    <Info size={20} />
                                ) : (
                                    thread.otherParticipant?.avatar ? (
                                        <img src={thread.otherParticipant.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-[var(--ink)]">
                                            {thread.otherParticipant?.firstName?.charAt(0) || '?'}
                                        </span>
                                    )
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-sm truncate pr-2">
                                        {thread.type === 'system' ? 'IntelliBid System' : `${thread.otherParticipant?.firstName || 'User'}`}
                                    </h3>
                                    {thread.lastMessage?.sentAt && (
                                        <span className="text-[10px] opacity-50 shrink-0">
                                            {getRelativeTime(thread.lastMessage.sentAt)}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs truncate ${thread.unread > 0 ? 'font-black text-[var(--ink)]' : 'font-medium opacity-60'}`}>
                                    {thread.lastMessage?.content || 'Started a conversation'}
                                </p>
                            </div>

                            {thread.unread > 0 && (
                                <div className="w-5 h-5 shrink-0 rounded-full bg-[var(--electric)] text-white text-[10px] font-bold flex items-center justify-center border-[2px] border-[var(--ink)]">
                                    {thread.unread}
                                </div>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
