import React, { useEffect, useRef, useState } from 'react'; // Import useState
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { link } from '../constant';

const SOCKET_SERVER_URL = link;

export default function ViewerStream({ token }) {
    const remoteVideoRef = useRef(null);
    const socketRef = useRef();
    const peerConnectionRef = useRef();
    const hostIdRef = useRef(null);
    const [showPlayButton, setShowPlayButton] = useState(false); // New state
    const [remoteStreamReady, setRemoteStreamReady] = useState(false); // To track if stream arrived
     const navigate = useNavigate();

    const handlePlayClick = () => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.play().then(() => {
                setShowPlayButton(false); // Hide button once played
                console.log('Viewer: Video playback started by user interaction.');
            }).catch(e => {
                console.error("Viewer: Error manually playing video:", e);
                alert("Could not play video. Please ensure browser permissions and try again.");
            });
        }
    };

    useEffect(() => {
        console.log('ViewerStream: Component mounted. Initializing...');

        socketRef.current = io(SOCKET_SERVER_URL, { auth: { token } });

        socketRef.current.on('connect', () => {
            console.log(`Viewer: Socket connected with ID: ${socketRef.current.id}`);
            if (token) {
                console.log(`Viewer: Emitting 'request-to-view' for host ID: ${token}`);
                socketRef.current.emit('request-to-view', { hostIdToView: token });
            } else {
                console.warn("Viewer: No host ID provided via token. Cannot request stream.");
            }
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Viewer: Socket connection error:', err.message, err.data);
        });

        socketRef.current.on('offer', async ({ sdp, hostId }) => {
            console.log(`Viewer: Received offer from host: ${hostId}`);
            hostIdRef.current = hostId;

            if (peerConnectionRef.current && peerConnectionRef.current.connectionState !== 'closed') {
                console.log('Viewer: Closing existing peer connection before new offer.');
                peerConnectionRef.current.close();
            }

            const peerConnection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            peerConnectionRef.current = peerConnection;

            peerConnection.oniceconnectionstatechange = () => {
                console.log('Viewer PC ICE state:', peerConnection.iceConnectionState);
                if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'disconnected') {
                    console.error('Viewer PC: ICE connection failed or disconnected!');
                }
            };
            peerConnection.onconnectionstatechange = () => {
                console.log('Viewer PC connection state:', peerConnection.connectionState);
            };
            peerConnection.onsignalingstatechange = () => {
                console.log('Viewer PC signaling state:', peerConnection.signalingState);
            };

            peerConnection.ontrack = event => {
                console.log('Viewer: Received remote track!', event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setRemoteStreamReady(true); // Indicate stream is ready
                    setShowPlayButton(true); // Show play button when stream is ready
                    // Try to play here, but be ready for NotAllowedError
                    remoteVideoRef.current.play().catch(e => {
                        console.error("Viewer: Error automatically playing remote video:", e);
                        // The user will need to click the button
                    });
                } else {
                    console.warn('Viewer: remoteVideoRef.current is null when ontrack fired.');
                }
            };

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socketRef.current.emit('ice-candidate', {
                        targetId: hostIdRef.current,
                        candidate: event.candidate,
                    });
                    console.log('Viewer: Sent ICE candidate to host.');
                }
            };

            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
                console.log('Viewer: Set remote description (offer) successfully.');

                const answer = await peerConnection.createAnswer();
                console.log('Viewer: Created answer.');

                await peerConnection.setLocalDescription(answer);
                console.log('Viewer: Set local description (answer) successfully.');

                socketRef.current.emit('answer', { hostId, sdp: peerConnection.localDescription });
                console.log(`Viewer: Sent answer to host: ${hostId}`);

            } catch (error) {
                console.error('Viewer: Error during SDP processing (offer/answer):', error);
            }
        });

        socketRef.current.on('ice-candidate', ({ candidate, senderId }) => {
            console.log(`Viewer: Received ICE candidate from sender: ${senderId || 'unknown'}.`);
            const peerConnection = peerConnectionRef.current;
            if (peerConnection) {
                peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                    .then(() => console.log('Viewer: Added remote ICE candidate successfully.'))
                    .catch(e => console.error('Viewer: Error adding remote ICE candidate:', e));
            } else {
                console.warn('Viewer: No peer connection available to add ICE candidate.');
            }
        });

        return () => {
            console.log('ViewerStream: Component unmounting. Performing cleanup...');
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log('Viewer: Socket disconnected.');
            }
            if (peerConnectionRef.current) {
                if (peerConnectionRef.current.connectionState !== 'closed') {
                    peerConnectionRef.current.close();
                    console.log('Viewer: Peer connection closed.');
                }
            }
        };
    }, [token]);

    return (
        <div>
            <h2>Viewer Stream</h2>
            <div style={{ position: 'relative', width: '600px', height: '450px', backgroundColor: 'lightgray', border: '2px solid black' }}>
                <video
                    ref={remoteVideoRef}
                    autoPlay={false} // Change to false, we'll manually play
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                {showPlayButton && ( // Conditionally render the button
                    <button
                        onClick={handlePlayClick}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            padding: '10px 20px',
                            fontSize: '1.2em',
                            cursor: 'pointer',
                            zIndex: 10,
                        }}
                    >
                        Play Stream
                    </button>
                )}
                {!remoteStreamReady && !showPlayButton && (
                    <p style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'gray' }}>
                        Waiting for host stream...
                    </p>
                )}
            </div>
            <button
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}
                onClick={() => navigate('/TournamentView')}
            >
                Exist Stream
            </button>
        </div>
    );
}