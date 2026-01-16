import React, { useState, useEffect } from 'react';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { chatService } from '@/services/chat.service';
import { useSocket } from '@/context/SocketContext';
import type { Conversation, Message } from '@/types/chat';

const ChatPage = () => {
    const { socket } = useSocket();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            setConversations((prev) => {
                const updated = [...prev];
                const index = updated.findIndex((c) => c.id === message.conversation_id);

                if (index !== -1) {
                    const conv = updated[index];
                    updated.splice(index, 1);
                    updated.unshift({
                        ...conv,
                        last_message: message.content,
                        last_message_at: message.created_at,
                        unread_count: selectedConversationId === conv.id ? conv.unread_count : conv.unread_count + 1
                    });
                } else {
                    // New conversation started? Or just reload list if we don't have it.
                    // Ideally we fetch it. For now, we only update existing.
                }
                return updated;
            });
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, selectedConversationId]);

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectConversation = (id: number) => {
        setSelectedConversationId(id);
        setConversations(prev => prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c));
        // Also call API to mark as read
        chatService.markAsRead(id);
    };

    return (
        <div className="p-4 h-full">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <ChatLayout
                sidebar={
                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedConversationId}
                        onSelect={handleSelectConversation}
                        isLoading={isLoading}
                    />
                }
                chat={
                    selectedConversationId ? (
                        <ChatWindow conversation={conversations.find(c => c.id === selectedConversationId)!} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a conversation to start chatting
                        </div>
                    )
                }
            />
        </div>
    );
};

export default ChatPage;
