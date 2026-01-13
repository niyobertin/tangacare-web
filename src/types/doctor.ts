import type { User } from './auth';

export interface Doctor {
    id: number;
    user_id: number;
    license_number: string;
    specialization: string;
    years_of_experience: number;
    consultation_fee: string; // API returns string "5000.00"
    is_available: boolean;
    rating: string;
    total_consultations: number;
    bio: string | null;
    created_at: string;
    updated_at: string;
    user: User;
}

export interface DoctorListResponse {
    success: boolean;
    message: string;
    data: Doctor[];
    timestamp?: string;
    // Adding optional pagination fields just in case the API evolves or I misunderstood, 
    // but primarily typing based on the provided array example.
    meta?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }
}
