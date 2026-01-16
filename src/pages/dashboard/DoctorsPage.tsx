import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '@/services/doctor.service';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Stethoscope, Plus, MoreVertical, Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Doctor, DoctorListResponse } from '@/types/doctor';
import { DoctorFormModal } from '@/components/dashboard/doctors/DoctorFormModal';
import { DoctorDetailsModal } from '@/components/dashboard/doctors/DoctorDetailsModal';
import { Modal } from '@/components/ui/modal';

import { createPortal } from 'react-dom';

// Portal-based Smart Dropdown Component
function ActionMenu({
    onView,
    onEdit,
    onDelete
}: {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    // const [openUpwards, setOpenUpwards] = useState(false); // Unused
    // const menuRef = useRef<HTMLDivElement>(null); // Unused
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close on scroll or resize to prevent floating menu detachment
    useEffect(() => {
        const handleScroll = () => { if (isOpen) setIsOpen(false); };
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        }
    }, [isOpen]);

    const toggleOpen = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const MENU_HEIGHT = 130;
            const SPACE_BELOW = window.innerHeight - rect.bottom;

            const isUp = SPACE_BELOW < MENU_HEIGHT;
            // setOpenUpwards(isUp);

            setCoords({
                top: isUp ? (rect.top - MENU_HEIGHT - 4) : (rect.bottom + 4),
                left: rect.right - 192, // Right align, 192px width
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <Button
                ref={buttonRef}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={toggleOpen}
            >
                <MoreVertical className="h-4 w-4" />
            </Button>

            {isOpen && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[49] bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        style={{
                            top: coords.top,
                            left: coords.left,
                        }}
                        className="fixed z-[50] w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 border border-slate-100 animate-in fade-in zoom-in-95 duration-100"
                    >
                        <button
                            onClick={() => { onView(); setIsOpen(false); }}
                            className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Eye className="mr-3 h-4 w-4 text-slate-400" />
                            View Details
                        </button>
                        <button
                            onClick={() => { onEdit(); setIsOpen(false); }}
                            className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Pencil className="mr-3 h-4 w-4 text-slate-400" />
                            Edit Profile
                        </button>
                        <button
                            onClick={() => { onDelete(); setIsOpen(false); }}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete Doctor
                        </button>
                    </div>
                </>,
                document.body
            )}
        </>
    );
}

export default function DoctorsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [availability, setAvailability] = useState<string>('all');

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>(undefined);

    // Fetch doctors
    const { data, isLoading, isError, error } = useQuery<DoctorListResponse>({
        queryKey: ['doctors', search, specialization, availability],
        queryFn: () => doctorService.getDoctors({
            search,
            specialization: specialization || undefined,
            is_available: availability === 'all' ? undefined : availability === 'true'
        }),
    });

    const { data: specializationsData } = useQuery({
        queryKey: ['specializations'],
        queryFn: doctorService.getSpecializations,
    });

    const specializations = specializationsData || [];
    const doctors = data?.data || [];

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return doctorService.deleteDoctor(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            setIsDeleteModalOpen(false);
            setSelectedDoctor(undefined);
        },
    });

    const handleCreateDoctor = () => {
        setSelectedDoctor(undefined);
        setIsFormModalOpen(true);
    };

    const handleViewDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsDetailsModalOpen(true);
    };

    const handleEditDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsFormModalOpen(true);
    };

    const handleDeleteDoctor = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedDoctor) {
            deleteMutation.mutate(selectedDoctor.id);
        }
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsDetailsModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedDoctor(undefined);
    };

    // Loading Skeleton
    const TableSkeleton = () => (
        <>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell>
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-3 w-[100px]" />
                            </div>
                        </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[60px] rounded-full" /></TableCell>
                </TableRow>
            ))}
        </>
    );

    if (isError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    Error loading doctors: {(error as Error).message}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctors</h1>
                    <p className="text-slate-500">Manage medical staff and schedules.</p>
                </div>

                <Button onClick={handleCreateDoctor} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Doctor
                </Button>
            </div>

            {/* Actions / Filters */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search doctors..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Specialization Filter */}
                <div className="relative w-full sm:w-48">
                    <Stethoscope className="absolute left-2.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                    <select
                        className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer text-slate-700"
                        value={specialization}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSpecialization(e.target.value)}
                    >
                        <option value="">All Specializations</option>
                        {specializations.map((spec) => (
                            <option key={spec} value={spec}>
                                {spec}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-3">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Availability Filter */}
                <div className="relative w-full sm:w-40">
                    {/* Status Indicator Icon */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className={cn("h-2 w-2 rounded-full transition-colors",
                            availability === 'available' ? "bg-emerald-500" :
                                availability === 'unavailable' ? "bg-slate-400" : "bg-slate-300"
                        )} />
                    </div>
                    <select
                        className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-8 pr-8 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer text-slate-700"
                        value={availability}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAvailability(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-3">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Specialization</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Fee</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton />
                        ) : doctors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                    No doctors found matching filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            doctors.map((doctor: Doctor, index: number) => (
                                <TableRow key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-medium text-slate-500">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                                                {doctor.user.first_name[0]}{doctor.user.last_name[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">
                                                    Dr. {doctor.user.first_name} {doctor.user.last_name}
                                                </span>
                                                <span className="text-xs text-slate-500">{doctor.license_number}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-slate-700">{doctor.specialization}</span>
                                    </TableCell>
                                    <TableCell>
                                        {doctor.years_of_experience} years
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-slate-900">{parseInt(doctor.consultation_fee).toLocaleString()} RWF</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                                            doctor.is_available
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                        )}>
                                            <span className={cn(
                                                "mr-1.5 h-1.5 w-1.5 rounded-full",
                                                doctor.is_available ? "bg-emerald-500" : "bg-slate-400"
                                            )} />
                                            {doctor.is_available ? 'Available' : 'Offline'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ActionMenu
                                            onView={() => handleViewDoctor(doctor)}
                                            onEdit={() => handleEditDoctor(doctor)}
                                            onDelete={() => handleDeleteDoctor(doctor)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create / Edit Modal */}
            <DoctorFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseModals}
                doctor={selectedDoctor || undefined}
                specializations={specializations}
            />

            {/* Details Modal */}
            <DoctorDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleCloseModals}
                doctor={selectedDoctor || null}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                title="Delete Doctor Profile"
                description="Are you sure you want to delete this doctor profile? This action cannot be undone."
                maxWidth='sm'
            >
                <div className="flex flex-col space-y-4">
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">
                            Permanently delete <strong>Dr. {selectedDoctor?.user.first_name} {selectedDoctor?.user.last_name}</strong>?
                        </span>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="outline" onClick={handleCloseModals}>Cancel</Button>
                        <Button
                            variant="default"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete Doctor'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
