import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

// Define types locally or import from types file if preferred
interface CallData {
    callId: number;
    conversationId: number;
    callerId: number;
    callerName: string;
    callType: 'audio' | 'video';
}

type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'active' | 'ended';

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
    toggleAudio: () => void;
    toggleVideo: () => void;
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const { user } = useAuth();

    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
    const [activeCallId, setActiveCallId] = useState<number | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

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

        const stream = await getLocalStream(type);
        if (!stream) return; // TODO: handle error

        socket.emit('call_initiate', { conversationId, calleeId, callType: type });
        setCallStatus('outgoing');
        // We don't have callId yet, backend should send 'call_initiated' or similar, 
        // but looking at events, 'call_initiated' event gives us the callId.
    };

    const acceptCall = async () => {
        if (!socket || !incomingCall) return;

        const stream = await getLocalStream(incomingCall.callType);
        if (!stream) return;

        socket.emit('call_accept', { callId: incomingCall.callId });
        setActiveCallId(incomingCall.callId);
        setCallStatus('active'); // Should probably wait for connection, but for now UI can show active

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
    };

    const endCall = () => {
        if (!socket || !activeCallId) return;
        socket.emit('call_end', { callId: activeCallId });
        cleanupCall();
    };

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
            console.log('Incoming call:', data);
            setIncomingCall(data);
            setCallStatus('incoming');
        };

        const handleCallInitiated = (data: { callId: number }) => {
            console.log('Call initiated, ID:', data.callId);
            setActiveCallId(data.callId);
        };

        const handleCallAccepted = async (data: { callId: number }) => {
            console.log('Call accepted:', data);
            setCallStatus('active');

            // Caller: Create Offer
            const pc = createPeerConnection(data.callId);
            if (pc) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('webrtc_offer', { callId: data.callId, sdp: offer });
            }
        };

        const handleCallRejected = (data: { callId: number }) => {
            console.log('Call rejected');
            cleanupCall();
            alert('Call was rejected');
        };

        const handleCallEnded = (data: { callId: number }) => {
            console.log('Call ended by remote');
            cleanupCall();
        };

        const handleWebRTCOffer = async (data: { callId: number; sdp: RTCSessionDescriptionInit }) => {
            console.log('Received Offer');
            // Callee receives offer
            if (!peerConnection.current) {
                createPeerConnection(data.callId);
            }
            const pc = peerConnection.current;
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', { callId: data.callId, sdp: answer });
            }
        };

        const handleWebRTCAnswer = async (data: { callId: number; sdp: RTCSessionDescriptionInit }) => {
            console.log('Received Answer');
            // Caller receives answer
            const pc = peerConnection.current;
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
        };

        const handleWebRTCIceCandidate = async (data: { callId: number; candidate: RTCIceCandidateInit }) => {
            console.log('Received ICE Candidate');
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
                toggleAudio,
                toggleVideo,
                isAudioEnabled,
                isVideoEnabled,
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
