import React from 'react';
import { useCall } from '@/context/CallContext';
import { PhoneOff, Video, Phone, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OutgoingCallModal: React.FC = () => {
    const { callStatus, endCall, resetCall, activeCallType, initiateCall, lastCallParams } = useCall();

    if (callStatus !== 'outgoing' && callStatus !== 'rejected') return null;

    const isVideoCall = activeCallType === 'video';
    const isRejected = callStatus === 'rejected';

    const handleRecall = () => {
        if (lastCallParams) {
            initiateCall(lastCallParams.conversationId, lastCallParams.calleeId, lastCallParams.type);
        } else {
            resetCall();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center space-y-4">

                    {isRejected ? (
                        <>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
                                <PhoneOff className="w-10 h-10 text-red-600" />
                            </div>
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-900">Call Rejected</h3>
                                <p className="text-sm text-gray-500">The user is busy or declined your call.</p>
                            </div>
                            <div className="flex gap-4 w-full">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={resetCall}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Close
                                </Button>
                                <Button
                                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                                    onClick={handleRecall}
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Call Again
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                                    {isVideoCall ? (
                                        <Video className="w-10 h-10 text-primary" />
                                    ) : (
                                        <Phone className="w-10 h-10 text-primary" />
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white" />
                            </div>

                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {isVideoCall ? 'Video Calling...' : 'Voice Calling...'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Waiting for answer...
                                </p>
                            </div>

                            <div className="flex items-center space-x-8 mt-4">
                                <button
                                    onClick={endCall}
                                    className="flex flex-col items-center space-y-2 group"
                                >
                                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                        <PhoneOff className="w-6 h-6 text-red-600" />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">End Call</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
