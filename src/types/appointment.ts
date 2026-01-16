export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'pending';
export type ConsultationType = 'video' | 'audio' | 'chat' | 'in-person';

export interface Appointment {
    id: number;
    doctor_id: number;
    patient_id: number;
    appointment_date: string; // ISO Date string
    duration_minutes: number;
    consultation_type: ConsultationType;
    status: AppointmentStatus;
    notes?: string;
    video_link?: string;
    created_at: string;
    updated_at: string;
    doctor?: {
        first_name: string;
        last_name: string;
        specialization: string;
    };
    patient?: {
        first_name: string;
        last_name: string;
    };
}

export interface CreateAppointmentDTO {
    doctor_id: number;
    appointment_date: string;
    duration_minutes: number;
    consultation_type: ConsultationType;
    notes?: string;
}

export interface UpdateAppointmentDTO {
    status?: AppointmentStatus;
    notes?: string;
}
