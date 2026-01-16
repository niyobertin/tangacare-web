import { api } from '@/lib/api';
import type { HealthTip, CreateHealthTipDTO } from '@/types/health';

export const healthTipService = {
    getAll: async (params?: any) => {
        const response = await api.get<{ success: boolean; data: HealthTip[] }>('/health-tips', { params });
        return response.data.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: HealthTip }>(`/health-tips/${id}`);
        return response.data.data;
    },

    create: async (data: CreateHealthTipDTO) => {
        const response = await api.post<{ success: boolean; data: HealthTip }>('/health-tips', data);
        return response.data.data;
    }
};
