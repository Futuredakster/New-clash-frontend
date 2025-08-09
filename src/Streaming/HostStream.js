import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { link } from '../constant';

const SOCKET_SERVER_URL = link;

export default function HostStream({ token }) {
    const localVideoRef = useRef(null);
    const socketRef = useRef();
    const peersRef = useRef({}); // viewerId -> RTCPeerConnection
    const localStreamRef = useRef(null); // Initialize with null for clarity
     const navigate = useNavigate();
    useEffect(() => {
        console.log('HostStream: Component mounted. Initializing...');

        socketRef.current = io(SOCKET_SERVER_URL, {
            auth: { token },
        });

        socketRef.current.on('connect', () => {
            console.log(`Host: Socket connected with ID: ${socketRef.current.id}`);
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Host: Socket connection error:', err.message, err.data);
        });

        // 1. Get camera and mic stream FIRST
        const getLocalMediaStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                localStreamRef.current = stream;
                console.log('Host: Successfully obtained local media stream.');
            } catch (err) {
                console.error('Host: Error accessing media devices. Viewer will not see stream.', err);
                // Inform user if permissions are denied or devices are unavailable
                alert('Please allow camera and microphone access to stream.');
            }
        };

        // Call the function to get the local stream
        getLocalMediaStream();

        // 2. Set up Socket.IO listeners (these can be defined immediately, but their actions depend on localStreamRef)
        socketRef.current.on('viewer-joined', viewerId => {
            console.log(`Host: Viewer ${viewerId} joined. Preparing PeerConnection.`);

            // Ensure local stream is available before proceeding
            if (!localStreamRef.current) {
                console.warn('Host: Local stream not yet available when viewer joined. Waiting for stream.');
                // You might want to queue viewers or retry after stream is ready
                return;
            }

            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            // Add local media tracks to peer connection
            // This is now safe because localStreamRef.current is guaranteed to exist by this point if we proceed
            localStreamRef.current.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStreamRef.current);
                console.log(`Host PC for ${viewerId}: Added local track: ${track.kind}`);
            });

            // Set up ICE candidate handler for this specific peer connection
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socketRef.current.emit('ice-candidate', {
                        targetId: viewerId,
                        candidate: event.candidate,
                    });
                    console.log(`Host PC for ${viewerId}: Sent ICE candidate.`);
                }
            };
            
            // Log Peer Connection state changes for debugging
            peerConnection.oniceconnectionstatechange = () => {
                console.log(`Host PC for ${viewerId} ICE state:`, peerConnection.iceConnectionState);
                if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
                    console.error(`Host PC for ${viewerId}: ICE connection failed or disconnected!`);
                }
            };
            peerConnection.onconnectionstatechange = () => {
                console.log(`Host PC for ${viewerId} connection state:`, peerConnection.connectionState);
            };
            peerConnection.onsignalingstatechange = () => {
                console.log(`Host PC for ${viewerId} signaling state:`, peerConnection.signalingState);
            };

            // Create and send offer SDP
            peerConnection.createOffer()
                .then(offer => {
                    console.log(`Host PC for ${viewerId}: Created offer.`);
                    return peerConnection.setLocalDescription(offer);
                })
                .then(() => {
                    console.log(`Host PC for ${viewerId}: Set local description (offer).`);
                    socketRef.current.emit('offer', {
                        viewerId,
                        sdp: peerConnection.localDescription,
                    });
                    console.log(`Host: Sent offer to viewer ${viewerId}.`);
                })
                .catch(err => console.error(`Host PC for ${viewerId}: Error creating/sending offer:`, err));

            // Store the peer connection
            peersRef.current[viewerId] = peerConnection;
        });

        // Receive answer SDP from viewer
        socketRef.current.on('answer', ({ sdp, viewerId }) => {
            console.log(`Host: Received answer from viewer ${viewerId}.`);
            const peerConnection = peersRef.current[viewerId];
            if (peerConnection) {
                peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
                    .then(() => console.log(`Host PC for ${viewerId}: Set remote description (answer).`))
                    .catch(err => console.error(`Host PC for ${viewerId}: Error setting remote answer description:`, err));
            } else {
                console.warn(`Host: No peer connection found for viewer ${viewerId} when receiving answer.`);
            }
        });

        // Receive ICE candidates from viewers
        socketRef.current.on('ice-candidate', ({ candidate, fromId }) => {
            console.log(`Host: Received ICE candidate from viewer ${fromId}.`);
            const peerConnection = peersRef.current[fromId];
            if (peerConnection) {
                peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                    .then(() => console.log(`Host PC for ${fromId}: Added remote ICE candidate.`))
                    .catch(err => console.error(`Host PC for ${fromId}: Error adding remote ICE candidate:`, err));
            } else {
                console.warn(`Host: No peer connection found for viewer ${fromId} when receiving ICE candidate.`);
            }
        });

        // Cleanup on component unmount
        return () => {
            console.log('HostStream: Component unmounting. Performing cleanup...');
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log('Host: Socket disconnected.');
            }
            if (peersRef.current) {
                Object.values(peersRef.current).forEach(pc => {
                    if (pc && pc.connectionState !== 'closed') { // Check if PC exists and is not already closed
                        pc.close();
                        console.log('Host: Closed a peer connection.');
                    }
                });
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                console.log('Host: Stopped local media tracks.');
            }
        };
    }, [token]); // Dependency array: Re-run effect if token changes

    return (
        <div>
            <h2>Host Stream</h2>
            <video
                ref={localVideoRef}
                autoPlay
                 // Mute local preview for the host
                playsInline // Good practice for mobile Safari
                style={{ width: '600px', border: '2px solid black', backgroundColor: 'lightgray' }}
            />
           <button
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}
                onClick={() => navigate('/home')}
            >
                End Stream
            </button>
        </div>
    );
}