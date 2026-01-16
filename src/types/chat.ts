export interface User {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
    is_online?: boolean;
    last_seen?: string;
}

export interface Conversation {
    id: number;
    patient_id: number;
    doctor_id: number;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
    other_user: User;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    sender_type: 'patient' | 'doctor';
    content: string;
    message_type: 'text' | 'image' | 'file';
    created_at: string;
}

export interface MessageResponse {
    messages: Message[];
    total: number;
    page: number;
    totalPages: number;
}
