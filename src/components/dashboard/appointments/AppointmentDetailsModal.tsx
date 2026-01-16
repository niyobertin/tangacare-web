import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import type { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { Calendar, Clock, User, FileText, MapPin, Video, Activity } from 'lucide-react';

interface AppointmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    onEdit: (appointment: Appointment) => void;
    onCancel: (appointment: Appointment) => void;
}

export function AppointmentDetailsModal({ isOpen, onClose, appointment, onEdit, onCancel }: AppointmentDetailsModalProps) {
    if (!appointment) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'text-blue-600 bg-blue-100';
            case 'completed': return 'text-green-600 bg-green-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Appointment Details"
            maxWidth="lg"
        >
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                    </span>
                </div>

                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Date & Time</label>
                        <div className="flex items-center gap-2 text-gray-900">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="font-medium">{format(new Date(appointment.appointment_date), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-900 pl-6">
                            <span className="text-sm">{format(new Date(appointment.appointment_date), 'p')} ({appointment.duration_minutes} min)</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Consultation Type</label>
                        <div className="flex items-center gap-2 text-gray-900">
                            {appointment.consultation_type === 'video' ? <Video size={16} className="text-purple-500" /> : <MapPin size={16} className="text-orange-500" />}
                            <span className="capitalize font-medium">{appointment.consultation_type}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Patient</label>
                        <div className="flex items-center gap-2 text-gray-900">
                            <User size={16} className="text-gray-500" />
                            <span>{appointment.patient?.first_name} {appointment.patient?.last_name}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">Doctor</label>
                        <div className="flex items-center gap-2 text-gray-900">
                            <User size={16} className="text-gray-500" />
                            <span>Dr. {appointment.doctor?.last_name}</span>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                        <FileText size={16} />
                        <span>Notes</span>
                    </div>
                    <p className="text-sm text-gray-600">{appointment.notes || "No notes provided."}</p>
                </div>

                {/* Activity Timeline (Mocked for now as per requirements) */}
                <div>
                    <div className="flex items-center gap-2 mb-3 text-gray-700 font-medium border-b pb-2">
                        <Activity size={16} />
                        <span>Activity Log</span>
                    </div>
                    <div className="space-y-3 pl-2 border-l-2 border-gray-100 ml-2">
                        <div className="relative pl-4">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                            <p className="text-sm text-gray-900">Status updated to <span className="font-medium text-blue-600">{appointment.status}</span></p>
                            <p className="text-xs text-gray-500">{format(new Date(appointment.updated_at), 'MMM d, h:mm a')}</p>
                        </div>
                        <div className="relative pl-4">
                            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-gray-300 rounded-full border-2 border-white"></div>
                            <p className="text-sm text-gray-900">Appointment created</p>
                            <p className="text-xs text-gray-500">{format(new Date(appointment.created_at), 'MMM d, h:mm a')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100 sm:gap-0">
                {appointment.status === 'scheduled' && (
                    <>
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 mr-2" onClick={() => onCancel(appointment)}>
                            Cancel Appointment
                        </Button>
                        <Button variant="outline" className="mr-2" onClick={() => onEdit(appointment)}>
                            Edit Details
                        </Button>
                    </>
                )}
                <Button onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
}

