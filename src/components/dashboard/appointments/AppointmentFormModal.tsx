import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Appointment } from '@/types/appointment';

const appointmentSchema = z.object({
    doctor_id: z.coerce.number().min(1, 'Doctor is required'),
    patient_id: z.coerce.number().optional(),
    appointment_date: z.string().min(1, 'Date is required'),
    appointment_time: z.string().min(1, 'Time is required'),
    duration_minutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
    consultation_type: z.enum(['video', 'audio', 'chat', 'in-person']),
    notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AppointmentFormValues) => void;
    initialData?: Appointment | null;
    isLoading?: boolean;
}

export function AppointmentFormModal({ isOpen, onClose, onSubmit, initialData, isLoading }: AppointmentFormModalProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentSchema) as any,
        defaultValues: {
            duration_minutes: 30,
            consultation_type: 'video',
            doctor_id: 1, // Defaulting for now
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const dateObj = new Date(initialData.appointment_date);
                reset({
                    doctor_id: initialData.doctor_id,
                    patient_id: initialData.patient_id,
                    appointment_date: dateObj.toISOString().split('T')[0],
                    appointment_time: dateObj.toTimeString().slice(0, 5),
                    duration_minutes: initialData.duration_minutes,
                    consultation_type: initialData.consultation_type,
                    notes: initialData.notes,
                });
            } else {
                reset({
                    duration_minutes: 30,
                    consultation_type: 'video',
                    doctor_id: 1,
                    appointment_date: '',
                    appointment_time: '',
                    notes: '',
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const handleFormSubmit = (data: AppointmentFormValues) => {
        onSubmit(data);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Appointment' : 'New Appointment'}
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input type="date" {...register('appointment_date')} />
                        {errors.appointment_date && <p className="text-xs text-red-500">{errors.appointment_date.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Time</label>
                        <Input type="time" {...register('appointment_time')} />
                        {errors.appointment_time && <p className="text-xs text-red-500">{errors.appointment_time.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (min)</label>
                        <Input type="number" {...register('duration_minutes')} />
                        {errors.duration_minutes && <p className="text-xs text-red-500">{errors.duration_minutes.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select
                            {...register('consultation_type')}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="video">Video Call</option>
                            <option value="audio">Audio Call</option>
                            <option value="chat">Chat</option>
                            <option value="in-person">In-Person</option>
                        </select>
                    </div>
                </div>

                {/* HIDDEN: In a real app we would have a dropdown to select patient if User is Doctor, or Doctor if User is Patient */}
                <input type="hidden" {...register('doctor_id')} />

                <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                        {...register('notes')}
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Add clinical notes or reasons for visit..."
                    />
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>
                        {initialData ? 'Update Appointment' : 'Schedule Appointment'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

