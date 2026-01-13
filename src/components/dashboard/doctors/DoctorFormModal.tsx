import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { doctorService } from '@/services/doctor.service';
import type { Doctor } from '@/types/doctor';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DoctorFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor?: Doctor | null; // If provided, we are in Edit mode
    specializations?: string[];
}

export function DoctorFormModal({ isOpen, onClose, doctor, specializations = [] }: DoctorFormModalProps) {
    const queryClient = useQueryClient();

    // Form State
    const [formData, setFormData] = useState({
        license_number: '',
        specialization: '',
        years_of_experience: 0,
        consultation_fee: '',
        bio: '',
        is_available: true,
        user_id: 0, // In a real app, you might select a user to "promote" to doctor, or create a user. Assuming promoting for now or manual ID entry if backend requires it.
        // NOTE: The Postman "Create Doctor" example doesn't show `user_id` being sent, 
        // implies the logged-in user becomes a doctor OR there's a different flow. 
        // Checking Postman again... Postman "Create Doctor Profile" body has license, spec, etc. 
        // It likely creates a doctor profile for the *current authenticated user*.
        // BUT, an Admin might want to create a doctor. 
        // For this task, I will stick to the fields in the Postman body: 
        // license, spec, years, fee, available, bio.
    });

    useEffect(() => {
        if (doctor) {
            setFormData({
                license_number: doctor.license_number,
                specialization: doctor.specialization,
                years_of_experience: doctor.years_of_experience,
                consultation_fee: doctor.consultation_fee,
                bio: doctor.bio || '',
                is_available: doctor.is_available,
                user_id: doctor.user_id,
            });
        } else {
            // Reset for Create mode
            setFormData({
                license_number: '',
                specialization: '',
                years_of_experience: 0,
                consultation_fee: '',
                bio: '',
                is_available: true,
                user_id: 0,
            });
        }
    }, [doctor, isOpen]);

    const createMutation = useMutation({
        mutationFn: doctorService.createDoctor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => doctorService.updateDoctor(doctor!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            onClose();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            consultation_fee: String(formData.consultation_fee), // Ensure string if needed or num
        };

        if (doctor) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={doctor ? 'Edit Doctor Profile' : 'Create Doctor Profile'}
            description={doctor ? 'Update the doctor\'s details below.' : 'Fill in the details to create a new doctor profile.'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-slate-700">License Number</label>
                    <Input
                        value={formData.license_number}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                        placeholder="e.g. RMDC-001/2023"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Specialization</label>
                        <Input
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                            placeholder="e.g. Cardiology"
                            list="modal-specializations"
                            required
                        />
                        <datalist id="modal-specializations">
                            {specializations.map((spec) => (
                                <option key={spec} value={spec} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700">Years of Exp.</label>
                        <Input
                            type="number"
                            value={formData.years_of_experience}
                            onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                            required
                            min={0}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700">Consultation Fee (RWF)</label>
                    <Input
                        type="number"
                        value={formData.consultation_fee}
                        onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                        placeholder="e.g. 5000"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-700">Bio</label>
                    <textarea
                        className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Short biography..."
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="is_available"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        checked={formData.is_available}
                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    />
                    <label htmlFor="is_available" className="text-sm font-medium text-slate-700">
                        Available for Consultations
                    </label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : doctor ? 'Update Doctor' : 'Create Doctor'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
