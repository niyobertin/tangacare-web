import React from 'react';
import type { Conversation } from '@/types/chat';
import { format } from 'date-fns';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    isLoading: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedId, onSelect, isLoading }) => {
    if (isLoading) {
        return <div className="p-4 text-center text-gray-500">Loading conversations...</div>;
    }

    if (!conversations || conversations.length === 0) {
        return <div className="p-4 text-center text-gray-500">No conversations yet.</div>;
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
                <div
                    key={conv.id}
                    onClick={() => onSelect(conv.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === conv.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={conv.other_user.profile_picture_url || `https://ui-avatars.com/api/?name=${conv.other_user.first_name}+${conv.other_user.last_name}`}
                                alt={`${conv.other_user.first_name} ${conv.other_user.last_name}`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            {conv.other_user.is_online && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                    {conv.other_user.first_name} {conv.other_user.last_name}
                                </h3>
                                {conv.last_message_at && (
                                    <span className="text-xs text-gray-400">
                                        {format(new Date(conv.last_message_at), 'MMM d, HH:mm')}
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                    {conv.last_message || 'Start a conversation'}
                                </p>
                                {conv.unread_count > 0 && (
                                    <span className="ml-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {conv.unread_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
