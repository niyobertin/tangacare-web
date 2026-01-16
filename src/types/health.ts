export type HealthRecordType = 'allergy' | 'medication' | 'history' | 'lab_result' | 'other';

export interface HealthRecord {
    id: number;
    patient_id: number;
    record_type: HealthRecordType;
    name: string;
    description: string;
    severity?: 'low' | 'medium' | 'high';
    date_recorded?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateHealthRecordDTO {
    record_type: HealthRecordType;
    name: string;
    description: string;
    severity?: string;
}

export interface HealthTip {
    id: number;
    title: string;
    content: string;
    category: string;
    language: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateHealthTipDTO {
    title: string;
    content: string;
    category: string;
    language: string;
    is_published: boolean;
}
