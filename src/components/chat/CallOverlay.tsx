import React, { useEffect, useRef } from 'react';
import { useCall } from '@/context/CallContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

export const CallOverlay: React.FC = () => {
    const {
        callStatus,
        localStream,
        remoteStream,
        endCall,
        toggleAudio,
        toggleVideo,
        isAudioEnabled,
        isVideoEnabled,
        incomingCall, // Access to see if it's audio only call or we can infer from stream tracks
    } = useCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (callStatus !== 'active' && callStatus !== 'outgoing') return null;

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Remote Video (Full Screen) */}
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-white text-center">
                            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <span className="text-3xl font-bold">
                                    {/* Ideally show remote user's initial or avatar */}
                                    ?
                                </span>
                            </div>
                            <p className="text-xl font-medium">
                                {callStatus === 'outgoing' ? 'Calling...' : 'Connecting...'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Local Video (PIP) */}
                {localStream && (
                    <div className="absolute top-4 right-4 w-32 h-48 bg-gray-900 rounded-lg shadow-lg overflow-hidden border-2 border-gray-800">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                        />
                        {!isVideoEnabled && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                                <VideoOff className="w-8 h-8 opacity-50" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="h-20 bg-gray-900/90 backdrop-blur border-t border-gray-800 flex items-center justify-center space-x-6 px-4">
                <button
                    onClick={toggleAudio}
                    className={`p-4 rounded-full transition-colors ${isAudioEnabled
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                >
                    {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>

                <button
                    onClick={endCall}
                    className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                >
                    <PhoneOff className="w-6 h-6" />
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-colors ${isVideoEnabled
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                >
                    {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>
            </div>
        </div>
    );
};
