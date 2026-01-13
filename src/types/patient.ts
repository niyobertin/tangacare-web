import type { User } from './auth';

export interface Patient {
    id: number;
    user_id: number;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other';
    blood_type?: string;
    allergies?: string[];
    chronic_conditions?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    insurance_provider?: string;
    insurance_policy_number?: string;
    user?: User; // Joined user data
    created_at: string;
    updated_at: string;
}

export interface PatientListResponse {
    success: boolean;
    message: string;
    data: {
        patients: Patient[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
