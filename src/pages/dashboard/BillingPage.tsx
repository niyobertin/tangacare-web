import React, { useState, useEffect } from 'react';
import { CreditCard, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import type { Payment } from '@/types/payment';
import { format } from 'date-fns';

const BillingPage = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const data = await paymentService.getAll();
            setPayments(data);
        } catch (error) {
            console.error('Failed to load payments', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="text-green-500" size={16} />;
            case 'pending': return <Clock className="text-orange-500" size={16} />;
            case 'failed': return <XCircle className="text-red-500" size={16} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">RWF 150,000</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Pending Payments</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">RWF 10,000</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Next Due Date</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">Jan 20, 2026</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">Transaction History</h2>
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                        <Download size={16} />
                        Export Statement
                    </button>
                </div>
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Loading...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {format(new Date(payment.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        Consultation - {payment.appointment?.consultation_type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                        {payment.payment_method.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        RWF {payment.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(payment.status)}
                                            <span className="text-sm capitalize">{payment.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No transaction history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default BillingPage;
