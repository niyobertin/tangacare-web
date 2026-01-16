import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, Pill, Activity, Plus } from 'lucide-react';
import { healthRecordService } from '@/services/health-record.service';
import type { HealthRecord } from '@/types/health';
import { format } from 'date-fns';

const MedicalRecordsPage = () => {
    const [records, setRecords] = useState<HealthRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRecords();
    }, []);

    const loadRecords = async () => {
        try {
            const data = await healthRecordService.getAll();
            setRecords(data);
        } catch (error) {
            console.error('Failed to load records', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'allergy': return <AlertTriangle className="text-red-500" />;
            case 'medication': return <Pill className="text-blue-500" />;
            default: return <Activity className="text-green-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus size={18} />
                    Add Record
                </button>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name/Description</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Severity</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date Recorded</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {records.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                {getIcon(record.record_type)}
                                            </div>
                                            <span className="capitalize font-medium text-gray-900">{record.record_type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{record.name}</p>
                                            <p className="text-sm text-gray-500">{record.description}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.severity && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.severity === 'high' ? 'bg-red-100 text-red-700' :
                                                    record.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {record.severity}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {record.date_recorded ? format(new Date(record.date_recorded), 'MMM d, yyyy') : '-'}
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No medical records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MedicalRecordsPage;
