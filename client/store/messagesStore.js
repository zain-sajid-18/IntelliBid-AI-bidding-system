import { create } from 'zustand';
import { api } from '@/lib/api';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socketClient';

export const useMessagesStore = create((set, get) => ({
    threads: [],
    activeConversationId: null,
    messages: {},   // { [conversationId]: [...messages] }
    loading: false,
    
    // AI state
    aiHistory: [],
    aiLoading: false,
    
    // Notification badge
    totalUnread: 0,

    initSocket: () => {
        const socket = connectSocket();

        socket.on('message:new', (message) => {
            const convId = message.conversationId;
            set(state => ({
                messages: {
                    ...state.messages,
                    [convId]: [...(state.messages[convId] || []), message],
                },
                // Update thread's last message in sidebar
                threads: state.threads.map(t =>
                    t._id === convId
                        ? { ...t, lastMessage: { content: message.content, sentAt: message.createdAt } }
                        : t
                )
            }));
        });

        socket.on('notification:new', (notif) => {
            // Show a toast — we'll add an optional toast store later
            console.info('[Notification]', notif.title);
            // Re-fetch threads to update unread counts
            get().fetchThreads();
        });
    },

    destroySocket: () => disconnectSocket(),

    joinConversation: (conversationId) => {
        const s = getSocket();
        if (s.connected) s.emit('join:conversation', conversationId);
    },

    setActiveConversation: (id) => {
        const prev = get().activeConversationId;
        if (prev && prev !== 'ai') {
            const s = getSocket();
            if (s.connected) s.emit('leave:conversation', prev);
        }
        set({ activeConversationId: id });
        if (id && id !== 'ai') {
            get().joinConversation(id);
            get().fetchMessages(id);
            api(`/api/messages/${id}/read`, { method: 'PATCH' }).catch(() => {});
        }
    },

    fetchThreads: async () => {
        try {
            const data = await api('/api/messages/threads');
            const total = (data.threads || []).reduce((sum, t) => sum + (t.unread || 0), 0);
            set({ threads: data.threads || [], totalUnread: total });
        } catch (err) {
            console.error('[MessagesStore] fetchThreads error:', err);
        }
    },

    fetchMessages: async (conversationId) => {
        if (get().messages[conversationId]) return; // Already loaded
        set({ loading: true });
        try {
            const data = await api(`/api/messages/${conversationId}`);
            set(state => ({
                messages: { ...state.messages, [conversationId]: data.messages || [] }
            }));
        } catch (err) {
            console.error('[MessagesStore] fetchMessages error:', err);
        } finally {
            set({ loading: false });
        }
    },

    sendMessage: async (conversationId, content, messageType = 'text', payload = null) => {
        await api('/api/messages/send', {
            method: 'POST',
            body: JSON.stringify({ conversationId, content, messageType, payload })
        });
    },

    startConversation: async (sellerId, auctionId = null) => {
        const data = await api('/api/messages/conversations/start', {
            method: 'POST',
            body: JSON.stringify({ sellerId, auctionId })
        });
        await get().fetchThreads();
        get().setActiveConversation(data.conversation._id);
        return data.conversation;
    },

    // AI actions
    sendAiMessage: async (message) => {
        set(state => ({
            aiHistory: [...state.aiHistory, { role: 'user', parts: [{ text: message }] }],
            aiLoading: true,
        }));

        try {
            const data = await api('/api/messages/ai/chat', {
                method: 'POST',
                body: JSON.stringify({ message })
            });
            set(state => ({
                aiHistory: [...state.aiHistory, { role: 'model', parts: [{ text: data.reply }] }],
            }));
        } catch (err) {
            set(state => ({
                aiHistory: [...state.aiHistory, { role: 'model', parts: [{ text: `Sorry, I encountered an error: ${err.message}` }] }],
            }));
        } finally {
            set({ aiLoading: false });
        }
    },

    fetchAiHistory: async () => {
        try {
            const data = await api('/api/messages/ai/history');
            set({ aiHistory: data.history || [] });
        } catch (err) {
            console.error('[MessagesStore] AI history error:', err);
        }
    },

    clearAiHistory: async () => {
        await api('/api/messages/ai/history', { method: 'DELETE' });
        set({ aiHistory: [] });
    },
}));
