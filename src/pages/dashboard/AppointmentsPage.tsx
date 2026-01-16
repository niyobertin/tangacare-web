import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { Calendar, Clock, Video, MapPin, User, Grid, List, ChevronLeft, ChevronRight, MoreVertical, Search, Plus } from 'lucide-react';
import { appointmentService } from '@/services/appointment.service';
import type { Appointment } from '@/types/appointment';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppointmentDetailsModal } from '@/components/dashboard/appointments/AppointmentDetailsModal';
import { AppointmentFormModal } from '@/components/dashboard/appointments/AppointmentFormModal';
import { Skeleton } from '@/components/ui/skeleton';

const AppointmentsPage = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        loadAppointments();
    }, [currentPage]); // Reload when page changes

    const loadAppointments = async () => {
        setIsLoading(true);
        try {
            // Passing pagination params to mock service (or real API if supported)
            const data = await appointmentService.getAll({ page: currentPage, limit: ITEMS_PER_PAGE });
            setAppointments(data);
        } catch (error) {
            console.error('Failed to load appointments', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUpdate = async (data: any) => {
        setIsLoading(true);
        try {
            const payload = {
                ...data,
                // Combine date and time
                appointment_date: `${data.appointment_date}T${data.appointment_time}:00Z`,
            };

            if (editingAppointment) {
                await appointmentService.update(editingAppointment.id, payload);
            } else {
                await appointmentService.create(payload);
            }

            setIsFormOpen(false);
            setEditingAppointment(null);
            loadAppointments(); // Refresh list
        } catch (error) {
            console.error('Failed to save appointment', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (appointment: Appointment) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            try {
                await appointmentService.cancel(appointment.id);
                setIsDetailsOpen(false);
                loadAppointments();
            } catch (error) {
                console.error('Failed to cancel appointment', error);
            }
        }
    };

    const openDetails = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setIsDetailsOpen(true);
    };

    const openEdit = (apt: Appointment) => {
        setEditingAppointment(apt);
        setIsDetailsOpen(false); // Close details if open
        setIsFormOpen(true);
    };

    const filteredAppointments = appointments.filter(apt =>
        (apt.doctor?.last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.patient?.first_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Render Grid Item
    const AppointmentCard = ({ apt }: { apt: Appointment }) => (
        <div onClick={() => openDetails(apt)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group relative">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">
                            {format(new Date(apt.appointment_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock size={14} />
                            {format(new Date(apt.appointment_date), 'h:mm a')}
                        </p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                    {apt.status}
                </span>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={16} />
                    <span>{user?.role === 'patient' ? `Dr. ${apt.doctor?.last_name}` : apt.patient?.first_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    {apt.consultation_type === 'video' ? <Video size={16} /> : <MapPin size={16} />}
                    <span className="capitalize">{apt.consultation_type} Consultation</span>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                <span>View Details</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );

    // Render List Item
    const AppointmentListItem = ({ apt }: { apt: Appointment }) => (
        <tr onClick={() => openDetails(apt)} className="hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                        <Calendar size={16} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{format(new Date(apt.appointment_date), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-gray-500">{format(new Date(apt.appointment_date), 'h:mm a')}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{user?.role === 'patient' ? `Dr. ${apt.doctor?.last_name}` : apt.patient?.first_name}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {apt.consultation_type === 'video' ? <Video size={16} className="text-purple-500" /> : <MapPin size={16} className="text-orange-500" />}
                    <span className="text-sm text-gray-600 capitalize">{apt.consultation_type}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                    {apt.status}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <Button variant="ghost" size="sm"><MoreVertical size={16} /></Button>
            </td>
        </tr>
    );

    // Skeleton Component
    const AppointmentSkeleton = () => (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="space-y-3 mb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-500 text-sm">Manage your scheduled consultations</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            placeholder="Search..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <Button onClick={() => { setEditingAppointment(null); setIsFormOpen(true); }} className="gap-2">
                        <Plus size={18} /> New
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <AppointmentSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAppointments.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Participant</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAppointments.map(apt => <AppointmentListItem key={apt.id} apt={apt} />)}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredAppointments.length === 0 && (
                        <div className="py-12 text-center text-gray-500">No appointments found.</div>
                    )}

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-500">Page {currentPage}</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => p + 1)}
                                // Disable if less than items per page (simplified logic)
                                disabled={filteredAppointments.length < ITEMS_PER_PAGE && filteredAppointments.length > 0}
                            >
                                Next <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Modals */}
            <AppointmentDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                appointment={selectedAppointment}
                onEdit={openEdit}
                onCancel={handleCancel}
            />

            <AppointmentFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleCreateUpdate}
                initialData={editingAppointment}
                isLoading={isLoading}
            />
        </div>
    );
};

export default AppointmentsPage;
