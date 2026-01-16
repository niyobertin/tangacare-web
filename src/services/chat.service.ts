import { api } from '@/lib/api';
import type { Conversation, Message, MessageResponse } from '@/types/chat';

export const chatService = {
    getConversations: async (): Promise<Conversation[]> => {
        const response = await api.get<{ success: boolean; data: Conversation[] }>('/chat/conversations');
        return response.data.data;
    },

    createConversation: async (doctorId: number): Promise<Conversation> => {
        const response = await api.post<{ success: boolean; data: Conversation }>('/chat/conversations', { doctorId });
        return response.data.data;
    },

    getMessages: async (conversationId: number, page = 1, limit = 50): Promise<MessageResponse> => {
        const response = await api.get<{ success: boolean; data: MessageResponse }>(
            `/chat/conversations/${conversationId}/messages`,
            { params: { page, limit } }
        );
        return response.data.data;
    },

    sendMessage: async (conversationId: number, content: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<Message> => {
        // Backend guide says it returns the message object but verifying payload structure
        const response = await api.post<{ success: boolean; data: Message }>(
            `/chat/conversations/${conversationId}/messages`,
            { content, message_type: messageType }
        );
        return response.data.data;
    },

    markAsRead: async (conversationId: number): Promise<void> => {
        await api.put(`/chat/conversations/${conversationId}/mark-read`);
    },

    getUnreadCounts: async (): Promise<Record<string, number>> => {
        const response = await api.get<{ success: boolean; data: Record<string, number> }>('/chat/unread-count');
        return response.data.data;
    }
};
