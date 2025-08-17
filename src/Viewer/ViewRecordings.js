import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { link } from '../constant';
import axios from 'axios';

const ViewRecordings = () => {
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [divisionName, setDivisionName] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    // Get division_id from URL parameters
    const params = new URLSearchParams(location.search);
    const divisionId = params.get('division_id');
    
    // Get division name from location state if passed from ViewerDivisions
    useEffect(() => {
        if (location.state?.divisionName) {
            setDivisionName(location.state.divisionName);
        }
    }, [location.state]);

    // Fetch recordings for this division
    useEffect(() => {
        if (!divisionId) {
            setError('No division ID provided');
            setLoading(false);
            return;
        }

        fetchRecordings();
    }, [divisionId]);

    const fetchRecordings = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await axios.get(`${link}/recordings/division`, {
                params: { division_id: divisionId }
            });

            setRecordings(response.data);
            console.log('Fetched recordings:', response.data);
        } catch (error) {
            console.error('Error fetching recordings:', error);
            setError(error.response?.data?.error || 'Failed to fetch recordings');
        } finally {
            setLoading(false);
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    };

    // Format duration
    const formatDuration = (seconds) => {
        if (!seconds) return 'Unknown';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        return new Date(dateString).toLocaleString();
    };

    // Get match description
    const getMatchDescription = (bracket) => {
        if (!bracket) return 'Unknown Match';
        const user1 = bracket.user1 || 'Player 1';
        const user2 = bracket.user2 || 'Player 2';
        const round = bracket.round ? `Round ${bracket.round}` : 'Match';
        return `${round}: ${user1} vs ${user2}`;
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading recordings...</p>
            </Container>
        );
    }

    return (
        <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
            <Container fluid className="py-4">
                <Row className="justify-content-center">
                    <Col xl={10}>
                        <Card className="shadow-lg border-0">
                            <Card.Header className="bg-primary text-white">
                                <Row className="align-items-center flex-column flex-sm-row text-center text-sm-start">
                                    <Col xs={12} sm>
                                        <h2 className="mb-0 fw-bold">
                                            <i className="fas fa-video me-3"></i>
                                            Division Recordings
                                        </h2>
                                        {divisionName && (
                                            <small className="mt-1 d-block opacity-75">
                                                {divisionName}
                                            </small>
                                        )}
                                    </Col>
                                    <Col xs={12} sm="auto" className="mt-3 mt-sm-0 text-center text-sm-end">
                                        <Button
                                            variant="light"
                                            onClick={() => navigate(-1)}
                                        >
                                            <i className="fas fa-arrow-left me-2"></i>
                                            Back
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Header>
                            
                            <Card.Body className="p-4">
                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {error}
                                    </Alert>
                                )}

                                {recordings.length === 0 && !error ? (
                                    <div className="text-center py-5">
                                        <i className="fas fa-video text-muted" style={{fontSize: '4rem'}}></i>
                                        <h4 className="text-muted mt-3">No recordings found</h4>
                                        <p className="text-muted">
                                            No recordings have been uploaded for this division yet.
                                        </p>
                                    </div>
                                ) : (
                                    <Row>
                                        {recordings.map((recording) => (
                                            <Col lg={6} xl={4} key={recording.recording_id} className="mb-4">
                                                <Card className="h-100 shadow-sm border-0">
                                                    <div className="position-relative">
                                                        <video
                                                            src={recording.cloudinary_url}
                                                            controls
                                                            className="w-100"
                                                            style={{
                                                                height: '200px',
                                                                objectFit: 'cover',
                                                                backgroundColor: '#000'
                                                            }}
                                                            poster=""
                                                        />
                                                        <Badge 
                                                            bg="dark" 
                                                            className="position-absolute top-0 end-0 m-2"
                                                        >
                                                            {formatDuration(recording.duration)}
                                                        </Badge>
                                                    </div>
                                                    
                                                    <Card.Body>
                                                        <h6 className="card-title fw-bold mb-2">
                                                            {getMatchDescription(recording.bracket)}
                                                        </h6>
                                                        
                                                        <div className="small text-muted mb-3">
                                                            <div className="d-flex justify-content-between mb-1">
                                                                <span>
                                                                    <i className="fas fa-calendar me-1"></i>
                                                                    Recorded
                                                                </span>
                                                                <span>{formatDate(recording.started_at)}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-1">
                                                                <span>
                                                                    <i className="fas fa-file me-1"></i>
                                                                    Size
                                                                </span>
                                                                <span>{formatFileSize(recording.file_size)}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span>
                                                                    <i className="fas fa-clock me-1"></i>
                                                                    Duration
                                                                </span>
                                                                <span>{formatDuration(recording.duration)}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="d-grid gap-2">
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                href={recording.cloudinary_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <i className="fas fa-external-link-alt me-2"></i>
                                                                Open in New Tab
                                                            </Button>
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                href={recording.cloudinary_url}
                                                                download={recording.original_filename}
                                                            >
                                                                <i className="fas fa-download me-2"></i>
                                                                Download
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))}
                                    </Row>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default ViewRecordings