export type PaymentStatus = 'pending' | 'success' | 'failed';
export type PaymentMethod = 'mobile_money' | 'card' | 'insurance';

export interface Payment {
    id: number;
    appointment_id: number;
    amount: number;
    payment_method: PaymentMethod;
    payment_gateway: string;
    transaction_id?: string;
    status: PaymentStatus;
    created_at: string;
    updated_at: string;
    appointment?: {
        appointment_date: string;
        consultation_type: string;
    };
}

export interface InitiatePaymentDTO {
    appointment_id: number;
    amount: number;
    payment_method: PaymentMethod;
    payment_gateway: string;
}
