import { api } from '@/lib/api';
import type { Doctor, DoctorListResponse } from '@/types/doctor';

interface GetDoctorsParams {
    page?: number;
    limit?: number;
    search?: string;
    specialization?: string;
    is_available?: boolean;
}

export const doctorService = {
    getDoctors: async (params?: GetDoctorsParams): Promise<DoctorListResponse> => {
        const response = await api.get<DoctorListResponse>('/doctors', { params });
        return response.data;
    },

    getSpecializations: async (): Promise<string[]> => {
        try {
            const response = await api.get<{ data: string[] }>('/doctors/specializations');
            return response.data.data;
        } catch (e) {
            return [];
        }
    },

    getDoctor: async (id: number): Promise<Doctor> => {
        const response = await api.get<{ data: Doctor }>(`/doctors/${id}`);
        return response.data.data;
    },

    createDoctor: async (data: Partial<Doctor>): Promise<Doctor> => {
        const response = await api.post<{ data: Doctor }>('/doctors', data);
        return response.data.data;
    },

    updateDoctor: async (id: number, data: Partial<Doctor>): Promise<Doctor> => {
        const response = await api.patch<{ data: Doctor }>(`/doctors/${id}`, data);
        return response.data.data;
    },

    deleteDoctor: async (id: number): Promise<void> => {
        await api.delete(`/doctors/${id}`);
    }
};
