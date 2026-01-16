import { api } from '@/lib/api';
import type { HealthRecord, CreateHealthRecordDTO } from '@/types/health';

export const healthRecordService = {
    getAll: async () => {
        const response = await api.get<{ success: boolean; data: HealthRecord[] }>('/health-records');
        return response.data.data;
    },

    create: async (data: CreateHealthRecordDTO) => {
        const response = await api.post<{ success: boolean; data: HealthRecord }>('/health-records', data);
        return response.data.data;
    }
};
