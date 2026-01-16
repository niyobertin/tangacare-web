import { api } from '@/lib/api';
import type { Prescription, CreatePrescriptionDTO } from '@/types/prescription';

export const prescriptionService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: Prescription[] }>('/prescriptions');
        return response.data.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: Prescription }>(`/prescriptions/${id}`);
        return response.data.data;
    },

    create: async (data: CreatePrescriptionDTO) => {
        const response = await api.post<{ success: boolean; data: Prescription }>('/prescriptions', data);
        return response.data.data;
    }
};
