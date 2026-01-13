import { api } from '@/lib/api';
import type { PatientListResponse, Patient } from '@/types/patient';

interface GetPatientsParams {
    page?: number;
    limit?: number;
    search?: string;
}

export const patientService = {
    getPatients: async (params?: GetPatientsParams): Promise<PatientListResponse> => {
        const response = await api.get<PatientListResponse>('/patients', { params });
        return response.data;
    },

    getPatient: async (id: number): Promise<{ success: boolean; data: Patient }> => {
        const response = await api.get<{ success: boolean; data: Patient }>(`/patients/${id}`);
        return response.data;
    },

    // Add other methods as needed (create, update, delete)
};
