export interface Prescription {
    id: number;
    appointment_id: number;
    doctor_id: number;
    patient_id: number;
    prescription_text: string;
    diagnosis: string;
    created_at: string;
    updated_at: string;
    doctor?: {
        first_name: string;
        last_name: string;
    };
    patient?: {
        first_name: string;
        last_name: string;
    };
}

export interface CreatePrescriptionDTO {
    appointment_id: number;
    doctor_id: number;
    patient_id: number;
    prescription_text: string;
    diagnosis: string;
}
