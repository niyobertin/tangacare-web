import { api } from '@/lib/api';
import type { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO } from '@/types/appointment';

export const appointmentService = {
    getAll: async (params?: any) => {
        const response = await api.get<{ success: boolean; data: Appointment[] }>('/appointments', { params });
        return response.data.data;
    },

    getById: async (id: number) => {
        const response = await api.get<{ success: boolean; data: Appointment }>(`/appointments/${id}`);
        return response.data.data;
    },

    create: async (data: CreateAppointmentDTO) => {
        const response = await api.post<{ success: boolean; data: Appointment }>('/appointments', data);
        return response.data.data;
    },

    update: async (id: number, data: UpdateAppointmentDTO) => {
        const response = await api.put<{ success: boolean; data: Appointment }>(`/appointments/${id}`, data);
        return response.data.data;
    },

    cancel: async (id: number) => {
        const response = await api.delete(`/appointments/${id}`);
        return response.data;
    },

    checkAvailability: async (doctorId: number, date: string) => {
        const response = await api.get('/appointments/availability', {
            params: { doctor_id: doctorId, date }
        });
        return response.data;
    }
};
