import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '@/services/patient.service';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Assuming Input exists from previous context or standard UI lib
import type { Patient, PatientListResponse } from '@/types/patient';

export default function PatientsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    // Fetch patients using React Query
    const { data, isLoading, isError, error } = useQuery<PatientListResponse>({
        queryKey: ['patients', page, search],
        queryFn: () => patientService.getPatients({ page, limit: 10, search }),
        keepPreviousData: true, // Keep data while fetching new page
    } as any); // Type assertion if needed for older RQ versions or specific types

    const responseData = data?.data;
    const patients = responseData?.patients || [];
    const totalPages = responseData?.totalPages || 1;

    // Loading Skeleton for Table Rows
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
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[60px] rounded-full" /></TableCell>
                </TableRow>
            ))}
        </>
    );

    if (isError) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    Error loading patients: {(error as Error).message}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patients</h1>
                    <p className="text-slate-500">Manage and view your patient records.</p>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search patients..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Last Visit</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableSkeleton />
                        ) : patients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No patients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            patients.map((patient: Patient, index: number) => (
                                <TableRow key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-medium text-slate-500">
                                        {(page - 1) * 10 + index + 1}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                                                {patient.user?.first_name?.[0]}{patient.user?.last_name?.[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">
                                                    {patient.user?.first_name} {patient.user?.last_name}
                                                </span>
                                                <span className="text-xs text-slate-500">{patient.user?.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            patient.gender === 'male' ? "bg-blue-50 text-blue-700" :
                                                patient.gender === 'female' ? "bg-pink-50 text-pink-700" :
                                                    "bg-slate-100 text-slate-700"
                                        )}>
                                            {patient.gender}
                                        </span>
                                    </TableCell>
                                    <TableCell>{patient.user?.phone_number}</TableCell>
                                    <TableCell className="text-slate-500">
                                        {new Date(patient.updated_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                            View Details
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls (Simple) */}
            {!isLoading && patients.length > 0 && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-slate-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

// Utility to conditional class names (make sure it's imported or defined if not available globally)
import { cn } from '@/lib/utils';
