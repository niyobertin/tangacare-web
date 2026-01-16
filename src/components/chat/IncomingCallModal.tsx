import React from 'react';
import { useCall } from '@/context/CallContext';
import { Phone, PhoneOff, Video } from 'lucide-react';

export const IncomingCallModal: React.FC = () => {
    const { incomingCall, acceptCall, rejectCall } = useCall();

    if (!incomingCall) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                            {incomingCall.callType === 'video' ? (
                                <Video className="w-10 h-10 text-primary" />
                            ) : (
                                <Phone className="w-10 h-10 text-primary" />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {incomingCall.callerName}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Incoming {incomingCall.callType} call...
                        </p>
                    </div>

                    <div className="flex items-center space-x-8 mt-4">
                        <button
                            onClick={rejectCall}
                            className="flex flex-col items-center space-y-2 group"
                        >
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <PhoneOff className="w-6 h-6 text-red-600" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Decline</span>
                        </button>

                        <button
                            onClick={acceptCall}
                            className="flex flex-col items-center space-y-2 group"
                        >
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <Phone className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium">Accept</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
