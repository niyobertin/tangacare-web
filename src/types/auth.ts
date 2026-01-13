export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient';

export interface User {
    id: number;
    phone_number: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    profile_picture_url?: string | null;
    is_verified?: boolean;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
        user: User;
    };
}

export interface MeResponse {
    success: boolean;
    message: string;
    data: User;
}
