import React, { useEffect, useRef, useState } from 'react'; // Import useState
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { link } from './constant';

const SOCKET_SERVER_URL = link;

export default function ViewerStream({ token }) {
    const remoteVideoRef = useRef(null);
    const socketRef = useRef();
    const peerConnectionRef = useRef();
    const hostIdRef = useRef(null);
    const [showPlayButton, setShowPlayButton] = useState(false); // New state
    const [remoteStreamReady, setRemoteStreamReady] = useState(false); // To track if stream arrived
    const [isFullscreen, setIsFullscreen] = useState(false); // Track fullscreen state
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

    // Test fullscreen API availability
    const testFullscreenSupport = () => {
        const elem = remoteVideoRef.current;
        if (!elem) return false;
        
        const hasFullscreen = !!(elem.requestFullscreen || 
                               elem.webkitRequestFullscreen || 
                               elem.mozRequestFullScreen || 
                               elem.msRequestFullscreen);
        
        console.log('Fullscreen API support:', {
            standard: !!elem.requestFullscreen,
            webkit: !!elem.webkitRequestFullscreen,
            moz: !!elem.mozRequestFullScreen,
            ms: !!elem.msRequestFullscreen,
            overall: hasFullscreen
        });
        
        return hasFullscreen;
    };

    const handleFullscreenToggle = () => {
        const videoElement = remoteVideoRef.current;
        if (!videoElement) {
            console.error('Video element not found');
            return;
        }

        // Test fullscreen support first
        if (!testFullscreenSupport()) {
            alert('Fullscreen mode is not supported in your browser');
            return;
        }

        if (!document.fullscreenElement) {
            // Try different fullscreen methods for browser compatibility
            const requestFullscreen = videoElement.requestFullscreen || 
                                    videoElement.webkitRequestFullscreen || 
                                    videoElement.mozRequestFullScreen || 
                                    videoElement.msRequestFullscreen;
            
            if (requestFullscreen) {
                requestFullscreen.call(videoElement).then(() => {
                    setIsFullscreen(true);
                    console.log('Entered fullscreen mode');
                }).catch(err => {
                    console.error('Error attempting to enable fullscreen:', err);
                    alert('Fullscreen mode is not supported or blocked by your browser');
                });
            } else {
                console.error('Fullscreen API not supported');
                alert('Fullscreen mode is not supported in your browser');
            }
        } else {
            // Try different exit fullscreen methods for browser compatibility
            const exitFullscreen = document.exitFullscreen || 
                                  document.webkitExitFullscreen || 
                                  document.mozCancelFullScreen || 
                                  document.msExitFullscreen;
            
            if (exitFullscreen) {
                exitFullscreen.call(document).then(() => {
                    setIsFullscreen(false);
                    console.log('Exited fullscreen mode');
                }).catch(err => {
                    console.error('Error attempting to exit fullscreen:', err);
                });
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            // Check different fullscreen properties for browser compatibility
            const isCurrentlyFullscreen = !!(document.fullscreenElement || 
                                           document.webkitFullscreenElement || 
                                           document.mozFullScreenElement || 
                                           document.msFullscreenElement);
            setIsFullscreen(isCurrentlyFullscreen);
        };

        // Add event listeners for different browsers
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        console.log('ViewerStream: Component mounted. Initializing...');

        // Add keyboard event listener for fullscreen toggle (F key or F11)
        const handleKeyPress = (event) => {
            if (event.key === 'f' || event.key === 'F') {
                event.preventDefault();
                handleFullscreenToggle();
            }
        };

        document.addEventListener('keydown', handleKeyPress);

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
            
            // Remove keyboard event listener
            document.removeEventListener('keydown', handleKeyPress);
            
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
        <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
            <Container fluid className="py-4">
                <Row className="justify-content-center">
                    <Col xl={10}>
                        <Card className="card-modern shadow-lg border-0">
                            <Card.Header className="card-modern-header">
                                <Row className="align-items-center">
                                    <Col>
                                        <h2 className="mb-0 fw-bold" style={{color: '#1a1a1a'}}>
                                            <i className="fas fa-tv me-3" style={{color: '#28a745'}}></i>
                                            Live Stream - Viewer
                                        </h2>
                                        <small className="text-muted mt-1 d-block">
                                            <i className="fas fa-eye me-2" style={{color: '#28a745'}}></i>
                                            Watching live broadcast
                                        </small>
                                    </Col>
                                    <Col xs="auto">
                                        <Button
                                            variant="outline-secondary"
                                            className="btn-modern-outline"
                                            onClick={() => navigate('/TournamentView')}
                                        >
                                            <i className="fas fa-times me-2"></i>
                                            Exit Stream
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Header>
                            
                            <Card.Body className="card-modern-body p-4">
                                <Row>
                                    <Col lg={8}>
                                        <div className="position-relative mb-4">
                                            <div 
                                                className="ratio ratio-16x9 rounded overflow-hidden shadow-lg"
                                                style={{backgroundColor: '#000000', border: '3px solid #1a1a1a'}}
                                            >
                                                <video
                                                    ref={remoteVideoRef}
                                                    autoPlay={false}
                                                    playsInline
                                                    className="w-100 h-100"
                                                    style={{
                                                        objectFit: 'contain',
                                                        backgroundColor: '#000000'
                                                    }}
                                                    onDoubleClick={handleFullscreenToggle}
                                                    title="Double-click or press 'F' for fullscreen"
                                                />
                                                
                                                {/* Add fullscreen styles */}
                                                <style>
                                                    {`
                                                        video:fullscreen {
                                                            width: 100vw !important;
                                                            height: 100vh !important;
                                                            object-fit: contain;
                                                            background-color: #000000;
                                                        }
                                                        video:-webkit-full-screen {
                                                            width: 100vw !important;
                                                            height: 100vh !important;
                                                            object-fit: contain;
                                                            background-color: #000000;
                                                        }
                                                        video:-moz-full-screen {
                                                            width: 100vw !important;
                                                            height: 100vh !important;
                                                            object-fit: contain;
                                                            background-color: #000000;
                                                        }
                                                        video:-ms-fullscreen {
                                                            width: 100vw !important;
                                                            height: 100vh !important;
                                                            object-fit: contain;
                                                            background-color: #000000;
                                                        }
                                                    `}
                                                </style>
                                                
                                                {/* Play button overlay */}
                                                {showPlayButton && (
                                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                                        <Button
                                                            onClick={handlePlayClick}
                                                            className="btn-modern btn-lg"
                                                            style={{
                                                                borderRadius: '50%',
                                                                width: '80px',
                                                                height: '80px',
                                                                fontSize: '2rem',
                                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                                                zIndex: 10
                                                            }}
                                                        >
                                                            <i className="fas fa-play"></i>
                                                        </Button>
                                                    </div>
                                                )}
                                                
                                                {/* Loading state */}
                                                {!remoteStreamReady && !showPlayButton && (
                                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center flex-column text-white">
                                                        <Spinner animation="border" variant="light" className="mb-3" />
                                                        <p className="mb-0 fw-semibold">Connecting to stream...</p>
                                                        <small className="text-light opacity-75">Please wait while we establish connection</small>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Live indicator (only show when stream is active) */}
                                            {remoteStreamReady && (
                                                <div 
                                                    className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill text-white fw-bold"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                                        fontSize: '0.85rem',
                                                        boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
                                                    }}
                                                >
                                                    <i className="fas fa-circle me-2 pulse-animation"></i>
                                                    LIVE
                                                </div>
                                            )}

                                            {/* Fullscreen button overlay */}
                                            {remoteStreamReady && (
                                                <div className="position-absolute top-0 end-0 m-3">
                                                    <Button
                                                        onClick={handleFullscreenToggle}
                                                        variant="dark"
                                                        size="sm"
                                                        className="opacity-75"
                                                        style={{
                                                            borderRadius: '8px',
                                                            fontSize: '0.9rem',
                                                            padding: '8px 12px',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                                            transition: 'opacity 0.3s ease'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                                                        onMouseLeave={(e) => e.target.style.opacity = '0.75'}
                                                        title={isFullscreen ? 'Exit fullscreen (F key or double-click)' : 'Enter fullscreen (F key or double-click)'}
                                                    >
                                                        <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'} me-1`}></i>
                                                        {isFullscreen ? 'Exit' : 'Full'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    
                                    <Col lg={4}>
                                        <Card className="border-0 h-100" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'}}>
                                            <Card.Header className="bg-transparent border-0 pb-2">
                                                <h5 className="mb-0 fw-bold" style={{color: '#1a1a1a'}}>
                                                    <i className="fas fa-info-circle me-2" style={{color: '#17a2b8'}}></i>
                                                    Stream Status
                                                </h5>
                                            </Card.Header>
                                            <Card.Body className="pt-0">
                                                <div className="mb-3">
                                                    <label className="form-label-modern">Connection Status</label>
                                                    <div className="d-flex align-items-center">
                                                        {remoteStreamReady ? (
                                                            <>
                                                                <div className="bg-success rounded-circle me-2" style={{width: '8px', height: '8px'}}></div>
                                                                <span className="text-success fw-semibold">Connected</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="bg-warning rounded-circle me-2" style={{width: '8px', height: '8px'}}></div>
                                                                <span className="text-warning fw-semibold">Connecting...</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <label className="form-label-modern">Stream Quality</label>
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-video me-2 text-primary"></i>
                                                        <span className="fw-semibold">
                                                            {remoteStreamReady ? 'HD Quality' : 'Waiting for stream...'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {!remoteStreamReady && (
                                                    <Alert variant="warning" className="mb-3 border-0" style={{background: 'rgba(255, 193, 7, 0.1)'}}>
                                                        <div className="small">
                                                            <i className="fas fa-clock me-2"></i>
                                                            Waiting for the host to start streaming...
                                                        </div>
                                                    </Alert>
                                                )}
                                                
                                                {remoteStreamReady && (
                                                    <Alert variant="success" className="mb-3 border-0" style={{background: 'rgba(40, 167, 69, 0.1)'}}>
                                                        <div className="small">
                                                            <i className="fas fa-check-circle me-2"></i>
                                                            Stream is live and ready to watch!
                                                        </div>
                                                    </Alert>
                                                )}
                                                
                                                {remoteStreamReady && (
                                                    <div className="mb-3 p-2 rounded" style={{background: 'rgba(23, 162, 184, 0.1)'}}>
                                                        <h6 className="mb-2 fw-bold" style={{color: '#17a2b8', fontSize: '0.85rem'}}>
                                                            <i className="fas fa-keyboard me-2"></i>
                                                            Controls
                                                        </h6>
                                                        <div className="small text-muted">
                                                            <div className="mb-1">
                                                                <i className="fas fa-mouse-pointer me-2 text-primary"></i>
                                                                Double-click video for fullscreen
                                                            </div>
                                                            <div className="mb-1">
                                                                <i className="fas fa-keyboard me-2 text-primary"></i>
                                                                Press <kbd className="px-1 py-0 bg-light border rounded">F</kbd> key for fullscreen
                                                            </div>
                                                            <div>
                                                                <i className="fas fa-expand me-2 text-primary"></i>
                                                                Click fullscreen button
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                

                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}