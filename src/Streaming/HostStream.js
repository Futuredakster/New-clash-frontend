import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { link } from '../constant';
import axios from 'axios';

const SOCKET_SERVER_URL = link;

export default function HostStream({ token }) {
    const localVideoRef = useRef(null);
    const socketRef = useRef();
    const peersRef = useRef({}); // viewerId -> RTCPeerConnection
    const localStreamRef = useRef(null); // Initialize with null for clarity
    const mediaRecorderRef = useRef(null); // For recording functionality
    const recordedChunksRef = useRef([]); // Store recorded video chunks
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isFetchingBracketId, setIsFetchingBracketId] = useState(false);
    const recordingIntervalRef = useRef(null);
    const bracketIdRef = useRef(''); // Add ref to store current bracket_id
    const navigate = useNavigate();
    const location = useLocation();
    const [bracketId, setBracketId] = useState('');

    // Debug: Log token changes
    useEffect(() => {
        console.log('=== TOKEN DEBUG ===');
        console.log('Token prop received:', token);
        console.log('Token type:', typeof token);
        console.log('Token length:', token?.length);
        console.log('==================');
    }, [token]);

    // Extract bracket_id from URL parameters OR fetch from token
    useEffect(() => {
        console.log('=== BRACKET ID DETECTION START ===');
        const params = new URLSearchParams(location.search);
        const idFromUrl = params.get('bracket_id');
        
        // First check sessionStorage for persisted bracket_id
        const storedBracketId = sessionStorage.getItem('current_bracket_id');
        
        console.log('URL bracket_id:', idFromUrl);
        console.log('SessionStorage bracket_id:', storedBracketId);
        console.log('Token available:', !!token);
        console.log('Current location.search:', location.search);
        
        if (idFromUrl) {
            setBracketId(idFromUrl);
            bracketIdRef.current = idFromUrl; // Also update the ref
            sessionStorage.setItem('current_bracket_id', idFromUrl); // Persist to sessionStorage
            console.log('✅ Using bracket_id from URL:', idFromUrl);
        } else if (storedBracketId) {
            setBracketId(storedBracketId);
            bracketIdRef.current = storedBracketId;
            console.log('✅ Restored bracket_id from sessionStorage:', storedBracketId);
        } else if (token) {
            // If no bracket_id in URL or storage, fetch it from the token via backend
            console.log('🔄 No bracket_id found, fetching from token...');
            fetchBracketIdFromToken();
        } else {
            // Try to get token from other sources if not passed as prop
            const urlToken = params.get('token');
            const sessionToken = sessionStorage.getItem('streamToken');
            const localToken = localStorage.getItem('streamToken');
            
            console.log('Trying alternative token sources:');
            console.log('- URL token:', urlToken);
            console.log('- Session token:', sessionToken);
            console.log('- Local token:', localToken);
            
            const fallbackToken = urlToken || sessionToken || localToken;
            if (fallbackToken) {
                console.log('🔄 Using fallback token to fetch bracket_id...');
                fetchBracketIdFromToken(fallbackToken);
            } else {
                console.warn('❌ No bracket_id found in URL parameters, sessionStorage, and no token available');
            }
        }
        console.log('=== BRACKET ID DETECTION END ===');
    }, [location.search, token]);

    const fetchBracketIdFromToken = async (tokenToUse = null) => {
        try {
            setIsFetchingBracketId(true);
            const activeToken = tokenToUse || token;
            console.log('Fetching bracket_id from token:', activeToken);
            const response = await axios.get(`${link}/api/stream/tokens/bracket-id`, {
                params: { token: activeToken }
            });
            
            if (response.data && response.data.bracket_id) {
                setBracketId(response.data.bracket_id);
                bracketIdRef.current = response.data.bracket_id; // Also update the ref
                sessionStorage.setItem('current_bracket_id', response.data.bracket_id); // Persist to sessionStorage
                console.log('Fetched bracket_id from token:', response.data.bracket_id);
            } else {
                console.error('No bracket_id returned from token lookup');
            }
        } catch (error) {
            console.error('Error fetching bracket_id from token:', error);
        } finally {
            setIsFetchingBracketId(false);
        }
    };

    // Recording functions
    const startRecording = (stream) => {
        try {
            // Check if MediaRecorder is supported
            if (!MediaRecorder.isTypeSupported('video/webm')) {
                console.warn('WebM format not supported, trying MP4...');
                if (!MediaRecorder.isTypeSupported('video/mp4')) {
                    console.error('Neither WebM nor MP4 recording is supported in this browser');
                    alert('Video recording is not supported in your browser');
                    return;
                }
            }

            // Clear any previous recorded chunks
            recordedChunksRef.current = [];

            // Create MediaRecorder with the stream
            const mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
                audioBitsPerSecond: 128000   // 128 kbps for audio
            });

            // Handle data available event
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                    console.log('Recording: Data chunk received, size:', event.data.size);
                }
            };

            // Handle recording stop event
            mediaRecorderRef.current.onstop = () => {
                console.log('Recording stopped, processing video...');
                console.log('Current bracketId in onstop:', bracketId);
                console.log('Current bracketIdRef.current in onstop:', bracketIdRef.current);
                console.log('Current token in onstop:', token);
                saveRecording();
            };

            // Handle recording error
            mediaRecorderRef.current.onerror = (event) => {
                console.error('Recording error:', event.error);
                alert('An error occurred during recording: ' + event.error);
                setIsRecording(false);
            };

            // Start recording
            mediaRecorderRef.current.start(1000); // Record in 1-second chunks
            setIsRecording(true);
            console.log('Recording started automatically with stream');

            // Start duration timer
            setRecordingDuration(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Failed to start recording: ' + error.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            // Clear duration timer
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
            
            console.log('Recording manually stopped');
        }
    };

    // Function to properly end the stream and ensure recording is saved
    const endStream = async () => {
        if (isUploading) {
            alert('Please wait for the recording upload to complete before ending the stream.');
            return;
        }

        if (isRecording) {
            const confirmEnd = window.confirm('Recording is still active. Ending the stream will stop and upload the recording. Continue?');
            if (!confirmEnd) return;
            
            // Stop the recording and wait for it to be saved
            console.log('Ending stream: Stopping recording...');
            stopRecording();
            
            // Give a moment for the recording to process and upload
            // The onstop event handler will automatically call saveRecording()
            console.log('Stream ended, recording will be processed automatically');
        }

        // Clear the stored bracket_id when ending stream
        sessionStorage.removeItem('current_bracket_id');
        
        // Navigate to home
        navigate('/home');
    };

    const saveRecording = async () => {
        if (recordedChunksRef.current.length === 0) {
            console.warn('No recorded data to save');
            return;
        }

        if (!bracketIdRef.current) {
            console.error('No bracket_id available for recording upload');
            console.log('Current bracketId state:', bracketId);
            console.log('Current bracketIdRef.current:', bracketIdRef.current);
            console.log('Current token:', token);
            console.log('Is fetching bracket ID:', isFetchingBracketId);
            alert('Unable to save recording: Bracket ID not found. Please check console for details.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // Create blob from recorded chunks
            const mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
            const blob = new Blob(recordedChunksRef.current, { type: mimeType });
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
            const filename = `stream-recording-${timestamp}.${extension}`;
            
            // Create FormData for multipart upload
            const formData = new FormData();
            formData.append('video', blob, filename);
            formData.append('bracket_id', bracketIdRef.current); // Use ref instead of state
            formData.append('duration', recordingDuration);
            formData.append('file_size', blob.size);
            
            console.log('Uploading recording to backend...', {
                filename,
                bracket_id: bracketIdRef.current, // Use ref instead of state
                duration: recordingDuration,
                file_size: blob.size
            });

            // Get auth token from localStorage (assuming you store it there)
            const authToken = localStorage.getItem('accessToken');
            
            // Upload to backend
            const response = await axios.post(`${link}/recordings`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'accessToken': authToken // Add auth header if required
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
            });

            console.log('Recording uploaded successfully:', response.data);
            
            // Clean up recorded chunks
            recordedChunksRef.current = [];
            
            // Also download locally as backup
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert(`Recording uploaded successfully to cloud storage and saved locally as backup!`);
            
        } catch (error) {
            console.error('Error uploading recording:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error headers:', error.response?.headers);
            
            // If upload fails, still provide local download
            try {
                const mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
                a.download = `stream-recording-${timestamp}.${extension}`;
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                recordedChunksRef.current = [];
                
                alert('Upload failed, but recording has been saved locally to your downloads folder.');
            } catch (downloadError) {
                console.error('Error with local download fallback:', downloadError);
                alert('Failed to upload recording and create local backup. Please try again.');
            }
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

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
                
                // Start recording automatically when stream is obtained
                startRecording(stream);
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
            
            // Stop recording if active and try to save it
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                console.log('Host: Stopping recording during cleanup and attempting to save...');
                mediaRecorderRef.current.stop();
                // Note: The onstop event handler will automatically call saveRecording()
            }
            
            // Clear recording timer
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
            
            // Note: If upload is in progress, let it complete in background
            // The user will be notified if they refresh/return to the page
            
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
        <>
            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .pulse-animation {
                        animation: pulse 1.5s ease-in-out infinite alternate;
                    }
                    @keyframes pulse {
                        from { opacity: 1; }
                        to { opacity: 0.5; }
                    }
                `}
            </style>
            <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
            <Container fluid className="py-4">
                <Row className="justify-content-center">
                    <Col xl={10}>
                        <Card className="card-modern shadow-lg border-0">
                            <Card.Header className="card-modern-header">
                                <Row className="align-items-center">
                                    <Col>
                                        <h2 className="mb-0 fw-bold" style={{color: '#1a1a1a'}}>
                                            <i className="fas fa-broadcast-tower me-3" style={{color: '#dc3545'}}></i>
                                            Live Stream - Host View
                                        </h2>
                                        <small className="text-muted mt-1 d-block">
                                            <i className="fas fa-circle text-danger me-2 pulse-animation"></i>
                                            You are currently broadcasting live
                                        </small>
                                    </Col>
                                    <Col xs="auto">
                                        <Button
                                            variant="danger"
                                            className="btn-modern-outline"
                                            onClick={endStream}
                                            disabled={isUploading}
                                            style={{borderColor: '#dc3545', color: '#dc3545'}}
                                        >
                                            <i className={`fas ${isUploading ? 'fa-spinner fa-spin' : 'fa-stop'} me-2`}></i>
                                            {isUploading ? 'Uploading...' : 'End Stream'}
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
                                                    ref={localVideoRef}
                                                    autoPlay
                                                    muted
                                                    playsInline
                                                    className="w-100 h-100"
                                                    style={{objectFit: 'cover'}}
                                                />
                                            </div>
                                            
                                            {/* Live indicator overlay */}
                                            <div 
                                                className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill text-white fw-bold"
                                                style={{
                                                    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                    fontSize: '0.85rem',
                                                    boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
                                                }}
                                            >
                                                <i className="fas fa-circle me-2 pulse-animation"></i>
                                                LIVE
                                            </div>
                                            
                                            {/* Recording indicator overlay */}
                                            {isRecording && (
                                                <div 
                                                    className="position-absolute top-0 end-0 m-3 px-3 py-1 rounded-pill text-white fw-bold"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        fontSize: '0.85rem',
                                                        boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)'
                                                    }}
                                                >
                                                    <i className="fas fa-record-vinyl me-2" style={{animation: 'spin 2s linear infinite'}}></i>
                                                    REC {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    
                                    <Col lg={4}>
                                        <Card className="border-0 h-100" style={{background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'}}>
                                            <Card.Header className="bg-transparent border-0 pb-2">
                                                <h5 className="mb-0 fw-bold" style={{color: '#1a1a1a'}}>
                                                    <i className="fas fa-info-circle me-2" style={{color: '#17a2b8'}}></i>
                                                    Stream Information
                                                </h5>
                                            </Card.Header>
                                            <Card.Body className="pt-0">
                                                <div className="mb-3">
                                                    <label className="form-label-modern">Stream Information</label>
                                                    <div className="d-flex align-items-center">
                                                        {isFetchingBracketId ? (
                                                            <>
                                                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                                <span className="text-muted">Fetching bracket info...</span>
                                                            </>
                                                        ) : bracketId ? (
                                                            <>
                                                                <i className="fas fa-check-circle text-success me-2"></i>
                                                                <span className="text-success">Bracket ID: {bracketId}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                                                <span className="text-warning">No bracket ID found</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label-modern">Recording Status</label>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="d-flex align-items-center">
                                                            <div 
                                                                className={`rounded-circle me-2 ${isRecording ? 'bg-danger' : isUploading ? 'bg-warning' : 'bg-secondary'}`} 
                                                                style={{width: '8px', height: '8px'}}
                                                            ></div>
                                                            <span className={`fw-semibold ${isRecording ? 'text-danger' : isUploading ? 'text-warning' : 'text-secondary'}`}>
                                                                {isRecording ? 'Recording' : isUploading ? 'Uploading...' : 'Not Recording'}
                                                            </span>
                                                        </div>
                                                        {isRecording && !isUploading && (
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={stopRecording}
                                                                className="px-3"
                                                            >
                                                                <i className="fas fa-stop me-1"></i>
                                                                Stop
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {isRecording && (
                                                        <div className="mt-2">
                                                            <small className="text-muted">
                                                                Duration: {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                                                            </small>
                                                        </div>
                                                    )}
                                                    {isUploading && (
                                                        <div className="mt-2">
                                                            <div className="progress mb-2" style={{height: '6px'}}>
                                                                <div 
                                                                    className="progress-bar bg-success" 
                                                                    role="progressbar" 
                                                                    style={{width: `${uploadProgress}%`}}
                                                                    aria-valuenow={uploadProgress}
                                                                    aria-valuemin="0"
                                                                    aria-valuemax="100"
                                                                ></div>
                                                            </div>
                                                            <small className="text-muted">
                                                                Uploading to cloud storage: {uploadProgress}%
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <label className="form-label-modern">Stream Quality</label>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-success rounded-circle me-2" style={{width: '8px', height: '8px'}}></div>
                                                        <span className="text-success fw-semibold">HD Quality</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <label className="form-label-modern">Viewers</label>
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-eye me-2 text-primary"></i>
                                                        <span className="fw-semibold">Connected viewers will appear here</span>
                                                    </div>
                                                </div>
                                                
                                                <Alert variant="info" className="mb-3 border-0" style={{background: 'rgba(23, 162, 184, 0.1)'}}>
                                                    <div className="small">
                                                        <i className="fas fa-share-alt me-2"></i>
                                                        Share your viewer token with others to let them watch your stream!
                                                    </div>
                                                </Alert>

                                                {isRecording && (
                                                    <Alert variant="success" className="mb-3 border-0" style={{background: 'rgba(40, 167, 69, 0.1)'}}>
                                                        <div className="small">
                                                            <i className="fas fa-video me-2"></i>
                                                            Recording in progress! Will be automatically uploaded to cloud storage when finished.
                                                        </div>
                                                    </Alert>
                                                )}

                                                {isUploading && (
                                                    <Alert variant="info" className="mb-3 border-0" style={{background: 'rgba(23, 162, 184, 0.1)'}}>
                                                        <div className="small">
                                                            <i className="fas fa-cloud-upload-alt me-2"></i>
                                                            Uploading recording to cloud storage... Please don't close the browser.
                                                        </div>
                                                    </Alert>
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
        </>
    );
}