import React from 'react';
import type { Message } from '@/types/chat';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const { user } = useAuth();
    const isOwn = message.sender_id === user?.id; // Assuming user.id exists and matches sender_id logic. sender_type might be safer if we knew our type.

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[70%] p-3 rounded-lg ${isOwn
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
            >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <span className={`text-xs block text-right mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                    {format(new Date(message.created_at), 'HH:mm')}
                </span>
            </div>
        </div>
    );
};
