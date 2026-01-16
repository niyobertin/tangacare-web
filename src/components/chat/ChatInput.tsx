import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
    onSend: (content: string) => void;
    onTyping?: (isTyping: boolean) => void;
    disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onTyping, disabled }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message);
            setMessage('');
            if (onTyping) onTyping(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        if (onTyping) onTyping(e.target.value.length > 0);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={handleChange}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={disabled}
                />
                <button
                    type="submit"
                    disabled={!message.trim() || disabled}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={20} />
                </button>
            </div>
        </form>
    );
};
