import React from 'react';

interface ChatLayoutProps {
    sidebar: React.ReactNode;
    chat: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ sidebar, chat }) => {
    return (
        <div className="flex h-[calc(100vh-6rem)] gap-4">
            <div className="w-1/3 min-w-[300px] border-r border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                {sidebar}
            </div>
            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                {chat}
            </div>
        </div>
    );
};
