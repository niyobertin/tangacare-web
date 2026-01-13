import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { Doctor } from '@/types/doctor';
import { format } from 'date-fns';

interface DoctorDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
}

export function DoctorDetailsModal({ isOpen, onClose, doctor }: DoctorDetailsModalProps) {
    if (!doctor) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Doctor Details"
            description={`Full profile for Dr. ${doctor.user.first_name} ${doctor.user.last_name}`}
        >
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-2xl">
                        {doctor.user.first_name[0]}{doctor.user.last_name[0]}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Dr. {doctor.user.first_name} {doctor.user.last_name}</h3>
                        <p className="text-slate-500">{doctor.specialization}</p>
                        <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doctor.is_available
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-800'
                            }`}>
                            {doctor.is_available ? 'Available' : 'Unavailable'}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">License Number</label>
                        <p className="text-slate-900 font-medium">{doctor.license_number}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Years of Experience</label>
                        <p className="text-slate-900 font-medium">{doctor.years_of_experience} years</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Consultation Fee</label>
                        <p className="text-slate-900 font-medium">{parseInt(doctor.consultation_fee).toLocaleString()} RWF</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</label>
                        <p className="text-slate-900 font-medium">{doctor.rating || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Consultations</label>
                        <p className="text-slate-900 font-medium">{doctor.total_consultations}</p>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined On</label>
                        <p className="text-slate-900 font-medium">
                            {doctor.created_at ? format(new Date(doctor.created_at), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Bio */}
                <div className="border-t border-slate-100 pt-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Biography</label>
                    <p className="text-slate-700 mt-1 text-sm leading-relaxed">
                        {doctor.bio || 'No biography details provided.'}
                    </p>
                </div>

                {/* User Account Info */}
                <div className="border-t border-slate-100 pt-4 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Linked User Account</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500">Email:</span> <span className="text-slate-900">{doctor.user.email}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Phone:</span> <span className="text-slate-900">{doctor.user.phone_number || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
}
