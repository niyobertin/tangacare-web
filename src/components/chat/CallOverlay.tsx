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
        activeCallType,
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

    const isVideoCall = activeCallType === 'video';

    return (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden">
                {/* Remote Video (Full Screen) - Always render for audio playback */}
                {remoteStream && (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover ${!isVideoCall ? 'hidden' : ''}`}
                    />
                )}

                {/* Placeholder for Audio Calls or Loading */}
                {(!isVideoCall || !remoteStream) && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <div className="text-white text-center">
                            <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                {isVideoCall ? (
                                    <span className="text-4xl font-bold">?</span>
                                ) : (
                                    <Mic className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">
                                {callStatus === 'outgoing' ? 'Calling...' : 'Connected'}
                            </h2>
                            <p className="text-gray-400">
                                {isVideoCall ? 'Waiting for video...' : 'Audio Call'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Local Video (PIP) - Only show if video call */}
                {isVideoCall && localStream && (
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
            <div className="h-24 bg-gray-900/90 backdrop-blur border-t border-gray-800 flex items-center justify-center space-x-8 px-4">
                <button
                    onClick={toggleAudio}
                    className={`p-5 rounded-full transition-all ${isAudioEnabled
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                        }`}
                >
                    {isAudioEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
                </button>

                <button
                    onClick={endCall}
                    className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-110 shadow-lg shadow-red-600/40"
                >
                    <PhoneOff className="w-8 h-8" />
                </button>

                {/* Only show video toggle if it's a video call */}
                {isVideoCall && (
                    <button
                        onClick={toggleVideo}
                        className={`p-5 rounded-full transition-all ${isVideoEnabled
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                            }`}
                    >
                        {isVideoEnabled ? <Video className="w-8 h-8" /> : <VideoOff className="w-8 h-8" />}
                    </button>
                )}
            </div>
        </div>
    );
};
