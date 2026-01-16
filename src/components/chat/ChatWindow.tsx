import React, { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useCall } from '@/context/CallContext';
import { chatService } from '@/services/chat.service';
import type { Conversation, Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Video, Phone, MoreVertical } from 'lucide-react';

interface ChatWindowProps {
    conversation: Conversation;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
    const { socket } = useSocket();
    const { initiateCall } = useCall();
    // user is not used currently
    // const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        loadMessages();
        joinConversation();

        return () => {
            leaveConversation();
        };
    }, [conversation.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            console.log('New message received:', message);
            if (Number(message.conversation_id) === Number(conversation.id)) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, conversation.id]);

    const loadMessages = async () => {
        setIsLoading(true);
        console.log('Loading messages for conversation:', conversation.id);
        try {
            const data = await chatService.getMessages(conversation.id);
            console.log('Fetched messages:', data);
            if (data && data.messages) {
                const sortedMessages = data.messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                setMessages(sortedMessages);
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Failed to load messages', error);
        } finally {
            setIsLoading(false);
        }
    };

    const joinConversation = () => {
        socket?.emit('join_conversation', { conversationId: conversation.id });
    };

    const leaveConversation = () => {
        socket?.emit('leave_conversation', { conversationId: conversation.id });
    };

    const handleSend = async (content: string) => {
        try {
            const newMessage = await chatService.sendMessage(conversation.id, content);
            setMessages((prev) => [...prev, newMessage]);
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleTyping = (isTyping: boolean) => {
        socket?.emit('typing', { conversationId: conversation.id, isTyping });
    };

    const handleVideoCall = () => {
        if (conversation.other_user) {
            initiateCall(conversation.id, conversation.other_user.id, 'video');
        } else {
            console.error('No other user found in conversation');
        }
    };

    if (isLoading) {
        return <div className="flex-1 flex items-center justify-center">Loading messages...</div>;
    }

    const otherUserName = conversation.other_user
        ? `${conversation.other_user.first_name} ${conversation.other_user.last_name}`.trim()
        : 'Unknown User';

    const otherUserInitial = conversation.other_user?.first_name?.charAt(0) || '?';

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {otherUserInitial}
                        </div>
                        {/* Status indicator could go here */}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
                        <p className="text-xs text-gray-500">Online</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => {
                            if (conversation.other_user) {
                                initiateCall(conversation.id, conversation.other_user.id, 'audio');
                            }
                        }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                        title="Audio Call"
                    >
                        <Phone className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleVideoCall}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                        title="Video Call"
                    >
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSend} onTyping={handleTyping} />
        </div>
    );
};

