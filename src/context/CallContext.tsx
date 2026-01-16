import React, { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { useSocket } from './SocketContext';
// import { useAuth } from './AuthContext'; // Unused

// Define types locally or import from types file if preferred
interface CallData {
    callId: number;
    conversationId: number;
    callerId: number;
    callerName: string;
    callType: 'audio' | 'video';
}

type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'active' | 'ended' | 'rejected';

interface CallContextType {
    callStatus: CallStatus;
    incomingCall: CallData | null;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    activeCallId: number | null;
    initiateCall: (conversationId: number, calleeId: number, type: 'audio' | 'video') => void;
    acceptCall: () => void;
    rejectCall: () => void;
    endCall: () => void;
    resetCall: () => void; // New function
    toggleAudio: () => void;
    toggleVideo: () => void;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    activeCallType: 'audio' | 'video' | null;
    lastCallParams: { conversationId: number; calleeId: number; type: 'audio' | 'video' } | null; // New prop
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    // const { user } = useAuth(); // Unused

    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
    const [activeCallId, setActiveCallId] = useState<number | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const isCallInitiator = useRef<boolean>(false);
    const lastCallParamsRef = useRef<{ conversationId: number; calleeId: number; type: 'audio' | 'video' } | null>(null);

    // Web Audio API refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorsRef = useRef<OscillatorNode[]>([]);
    const gainNodeRef = useRef<GainNode | null>(null);

    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    };

    const stopSounds = useCallback(() => {
        oscillatorsRef.current.forEach(osc => {
            try {
                osc.stop();
                osc.disconnect();
            } catch (e) { /* ignore */ }
        });
        oscillatorsRef.current = [];
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
            gainNodeRef.current = null;
        }
    }, []);

    // const playTone ... (Unused function removed or commented out to satisfy linter)

    // Better Ringtone Implementation with Interval
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (incomingCall) {
            // Incoming Ringtone: "Double Ring" style (Ring-Ring... Silence)
            // distinct from outgoing beep
            // Incoming Ringtone: "Digital Melody"
            const playRing = () => {
                const ctx = initAudioContext();
                const t = ctx.currentTime;

                // Simple Arpeggio: C4 - E4 - G4 (Major Triad)
                const playNote = (freq: number, start: number, duration: number) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.type = 'sine';
                    osc.frequency.value = freq;

                    gain.gain.setValueAtTime(0.1, start);
                    gain.gain.linearRampToValueAtTime(0, start + duration);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(start);
                    osc.stop(start + duration);
                };

                // Play sequence
                playNote(523.25, t, 0.2);       // C5
                playNote(659.25, t + 0.2, 0.2); // E5
                playNote(783.99, t + 0.4, 0.4); // G5 

                // Pause then repeat slightly changed
                playNote(523.25, t + 1.0, 0.2); // C5
                playNote(659.25, t + 1.2, 0.2); // E5
                playNote(783.99, t + 1.4, 0.4); // G5
            };

            playRing(); // Start immediately
            interval = setInterval(playRing, 3000); // Repeat cycle every 3s

        } else if (callStatus === 'outgoing') {
            // Outgoing Ringback: User requested 3s beep
            stopSounds();

            const playBeep = () => {
                const ctx = initAudioContext();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                // 400Hz (slightly lower pitch for distinction)
                osc.frequency.value = 400;
                gain.gain.value = 0.1;

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 3); // Beep for 3 seconds
            };

            playBeep(); // Start immediately
            interval = setInterval(playBeep, 4000); // Repeat every 4s (3s beep + 1s silence)
        } else {
            stopSounds();
        }

        return () => {
            clearInterval(interval);
            stopSounds();
        };
    }, [incomingCall, callStatus, stopSounds]);

    // WebRTC Configuration
    const rtcConfig: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    const cleanupCall = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        setCallStatus('idle');
        setIncomingCall(null);
        setActiveCallId(null);
        isCallInitiator.current = false; // Reset initiator status
    }, []);

    const createPeerConnection = useCallback((callId: number) => {
        if (!socket) return null;

        const pc = new RTCPeerConnection(rtcConfig);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('webrtc_ice_candidate', {
                    callId,
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log('Received remote track', event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        peerConnection.current = pc;
        return pc;
    }, [socket]);

    const getLocalStream = async (type: 'audio' | 'video') => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video',
            });
            setLocalStream(stream);
            localStreamRef.current = stream;
            return stream;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            // Handle error (e.g., permission denied)
            return null;
        }
    };

    const initiateCall = async (conversationId: number, calleeId: number, type: 'audio' | 'video') => {
        if (!socket) return;
        isCallInitiator.current = true; // We are the caller
        lastCallParamsRef.current = { conversationId, calleeId, type }; // Save params for recall

        const stream = await getLocalStream(type);
        if (!stream) return; // TODO: handle error

        socket.emit('call_initiate', { conversationId, calleeId, callType: type });
        setCallStatus('outgoing');
        setActiveCallType(type);
        // We don't have callId yet, backend should send 'call_initiated' or similar, 
        // but looking at events, 'call_initiated' event gives us the callId.
    };

    const acceptCall = async () => {
        console.log('[AG-DEBUG] acceptCall started', incomingCall);
        if (!socket || !incomingCall) {
            console.log('[AG-DEBUG] acceptCall aborted: no socket or incomingCall');
            return;
        }

        const stream = await getLocalStream(incomingCall.callType);
        if (!stream) {
            console.log('[AG-DEBUG] acceptCall aborted: failed to get stream');
            return;
        }

        console.log('[AG-DEBUG] Emitting call_accept', { callId: incomingCall.callId });
        socket.emit('call_accept', { callId: incomingCall.callId });
        setActiveCallId(incomingCall.callId);
        setActiveCallType(incomingCall.callType);
        setCallStatus('active'); // Sets UI to active immediately

        // Setup WebRTC after accepting? 
        // Usually, the caller creates the offer upon receiving 'call_accepted'.
        // So as callee, we just wait for the offer.
        setIncomingCall(null); // Clear modal
    };

    const rejectCall = () => {
        if (!socket || !incomingCall) return;
        socket.emit('call_reject', { callId: incomingCall.callId });
        setIncomingCall(null);
        setCallStatus('idle');
        isCallInitiator.current = false; // Reset initiator status
    };

    const endCall = () => {
        if (!socket || !activeCallId) return;
        socket.emit('call_end', { callId: activeCallId });
        cleanupCall();
    };

    const resetCall = useCallback(() => {
        cleanupCall();
    }, [cleanupCall]);

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    // Socket Event Listeners
    useEffect(() => {
        if (!socket) {
            console.log('[CallContext] Socket not available yet');
            return;
        }

        console.log('[CallContext] Attaching socket event listeners');

        const handleIncomingCall = (data: CallData) => {
            console.log('[AG-DEBUG] Incoming call:', data);
            isCallInitiator.current = false; // We are the callee
            setIncomingCall(data);
            setCallStatus('incoming');
        };

        const handleCallInitiated = (data: { callId: number }) => {
            console.log('[AG-DEBUG] Call initiated, ID:', data.callId);
            setActiveCallId(data.callId);
        };

        const handleCallAccepted = async (data: { callId: number }) => {
            console.log('[AG-DEBUG] Call accepted:', data);
            setCallStatus('active');

            if (isCallInitiator.current) {
                // Caller: Create Offer
                console.log('[AG-DEBUG] I am the Caller. Creating PeerConnection');
                const pc = createPeerConnection(data.callId);
                if (pc) {
                    console.log('[AG-DEBUG] Creating Offer');
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    console.log('[AG-DEBUG] Sending Offer');
                    socket.emit('webrtc_offer', { callId: data.callId, sdp: offer });
                }
            } else {
                console.log('[AG-DEBUG] I am the Callee. Waiting for Offer.');
            }
        };

        const handleCallRejected = (_data: { callId: number }) => {
            console.log('[AG-DEBUG] Call rejected');
            // Clean up streams but keep context for "Recall"
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
            setLocalStream(null);
            stopSounds();
            setCallStatus('rejected');
        };

        const handleCallEnded = (_data: { callId: number }) => {
            console.log('[AG-DEBUG] Call ended by remote');
            cleanupCall();
        };

        const handleWebRTCOffer = async (data: { callId: number; sdp: RTCSessionDescriptionInit }) => {
            console.log('[AG-DEBUG] Received Offer', data);
            // Callee receives offer
            if (!peerConnection.current) {
                console.log('[AG-DEBUG] Creating PeerConnection (Callee)');
                createPeerConnection(data.callId);
            }
            const pc = peerConnection.current;
            if (pc) {
                console.log('[AG-DEBUG] Setting Remote Description (Offer)');
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                console.log('[AG-DEBUG] Creating Answer');
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                console.log('[AG-DEBUG] Sending Answer');
                socket.emit('webrtc_answer', { callId: data.callId, sdp: answer });
            }
        };

        const handleWebRTCAnswer = async (data: { callId: number; sdp: RTCSessionDescriptionInit }) => {
            console.log('[AG-DEBUG] Received Answer');
            // Caller receives answer
            const pc = peerConnection.current;
            if (pc) {
                console.log('[AG-DEBUG] Setting Remote Description (Answer)');
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
        };

        const handleWebRTCIceCandidate = async (data: { callId: number; candidate: RTCIceCandidateInit }) => {
            console.log('[AG-DEBUG] Received ICE Candidate');
            const pc = peerConnection.current;
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        };

        socket.on('incoming_call', handleIncomingCall);
        socket.on('call_initiated', handleCallInitiated);
        socket.on('call_accepted', handleCallAccepted);
        socket.on('call_rejected', handleCallRejected);
        socket.on('call_ended', handleCallEnded);
        socket.on('webrtc_offer', handleWebRTCOffer);
        socket.on('webrtc_answer', handleWebRTCAnswer);
        socket.on('webrtc_ice_candidate', handleWebRTCIceCandidate);

        return () => {
            socket.off('incoming_call', handleIncomingCall);
            socket.off('call_initiated', handleCallInitiated);
            socket.off('call_accepted', handleCallAccepted);
            socket.off('call_rejected', handleCallRejected);
            socket.off('call_ended', handleCallEnded);
            socket.off('webrtc_offer', handleWebRTCOffer);
            socket.off('webrtc_answer', handleWebRTCAnswer);
            socket.off('webrtc_ice_candidate', handleWebRTCIceCandidate);
        };
    }, [socket, createPeerConnection, cleanupCall]);

    return (
        <CallContext.Provider
            value={{
                callStatus,
                incomingCall,
                localStream,
                remoteStream,
                activeCallId,
                initiateCall,
                acceptCall,
                rejectCall,
                endCall,
                resetCall,
                toggleAudio,
                toggleVideo,
                isAudioEnabled,
                isVideoEnabled,
                activeCallType,
                lastCallParams: lastCallParamsRef.current,
            }}
        >
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (context === undefined) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
};
