import { api } from '@/lib/api';
import type { Payment, InitiatePaymentDTO } from '@/types/payment';

export const paymentService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: Payment[] }>('/payments');
        return response.data.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: Payment }>(`/payments/${id}`);
        return response.data.data;
    },

    initiate: async (data: InitiatePaymentDTO) => {
        const response = await api.post<{ success: boolean; data: any }>('/payments/initiate', data);
        return response.data.data;
    }
};
