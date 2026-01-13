import { api } from '@/lib/api';
import type { User, AuthResponse, MeResponse } from '@/types/auth';

export const authService = {
    login: async (identifier: string, password: string): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', { identifier, password });
        return response.data;
    },

    register: async (data: any): Promise<any> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get<MeResponse>('/auth/me');
        return response.data.data;
    },

    verifyOtp: async (phoneNumber: string, otp: string): Promise<any> => { // Adjust return type
        const response = await api.post('/auth/verify-otp', { phone_number: phoneNumber, otp });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};
