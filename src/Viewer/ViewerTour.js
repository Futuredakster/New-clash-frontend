import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Searchbar from '../Searchbar';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Container, Row, Col, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { link } from '../constant';

const ViewerTour = ({ setProps }) => {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleViewDetails = (tournament) => {
        setProps(tournament);
        const queryString = new URLSearchParams({
            tournament_id: tournament.tournament_id,
        }).toString();
        navigate(`/ViewerDivisions?${queryString}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${link}/tournaments/praticipent`, {
                    params: {
                        tournament_name: search,
                    },
                });
                
                if (response.data.error) {
                    setError(response.data.error);
                    setData([]);
                } else {
                    setData(response.data);
                    setError('');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('An error occurred while fetching tournaments.');
                setData([]);
            } finally {
                // Only clear loading after the first successful load
                if (loading) {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [search, loading]);

    // Loading state
    if (loading) {
        return (
            <Container fluid className="container-modern fade-in">
                <div className="page-header-modern">
                    <h1 className="page-title-modern">
                        <i className="fas fa-trophy me-3"></i>
                        Tournaments
                    </h1>
                    <p className="page-subtitle-modern">
                        Discover and watch competitive tournaments
                    </p>
                </div>
                <Row className="justify-content-center">
                    <Col xs={12} md={8} lg={6}>
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" className="mb-3" />
                            <p className="text-muted">Loading tournaments...</p>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container fluid className="container-modern fade-in">
            {/* Header Section */}
            <div className="page-header-modern">
                <h1 className="page-title-modern">
                    <i className="fas fa-trophy me-3"></i>
                   Tournaments
                </h1>
                <p className="page-subtitle-modern">
                    Discover and watch competitive tournaments • {data.length} tournament{data.length !== 1 ? 's' : ''} available
                </p>
            </div>

            {/* Search Section */}
            <Row className="justify-content-center mb-4">
                <Col xs={12} lg={8}>
                    <Searchbar
                        search={search}
                        setSearch={setSearch}
                    />
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Row className="justify-content-center mb-4">
                    <Col xs={12} lg={8}>
                        <Alert variant="danger" className="text-center">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Content Section */}
            <Row className="justify-content-center">
                <Col xs={12} lg={10}>
                    {data.length === 0 && !loading ? (
                        <div className="text-center py-5">
                            <i className="fas fa-trophy fa-4x text-muted mb-4"></i>
                            <h5 className="text-muted mb-3">No tournaments found</h5>
                            <p className="text-muted">
                                {search ? `No tournaments match "${search}". Try a different search term.` : 'No tournaments are currently available.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Tournaments Grid */}
                            <Row className="g-4">
                                {data.map((item, index) => (
                                    <Col xs={12} sm={6} lg={4} key={index}>
                                        <Card className="card-modern h-100">
                                            {/* Tournament Image */}
                                            {item.imageUrl ? (
                                                <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                                                    <img 
                                                        src={item.imageUrl} 
                                                        className="card-img-top w-100 h-100" 
                                                        alt={item.tournament_name}
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                    <div className="position-absolute top-0 end-0 m-3">
                                                        <Badge bg="dark" className="px-3 py-2">
                                                            <i className="fas fa-calendar me-1"></i>
                                                            Tournament
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center bg-light" style={{ height: '200px' }}>
                                                    <div className="text-center">
                                                        <i className="fas fa-trophy fa-3x text-muted mb-2"></i>
                                                        <p className="text-muted mb-0 small">Tournament Image</p>
                                                    </div>
                                                </div>
                                            )}

                                            <Card.Body className="card-modern-body">
                                                <h5 className="card-title mb-3">{item.tournament_name}</h5>
                                                
                                                <div className="tournament-details mb-4">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <i className="fas fa-calendar-start me-2 text-success"></i>
                                                        <small className="text-muted">
                                                            <strong>Start:</strong> {new Date(item.start_date + 'T00:00:00').toLocaleDateString()}
                                                        </small>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-calendar-end me-2 text-danger"></i>
                                                        <small className="text-muted">
                                                            <strong>End:</strong> {new Date(item.end_date + 'T00:00:00').toLocaleDateString()}
                                                        </small>
                                                    </div>
                                                </div>

                                                {/* Tournament Status */}
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    {(() => {
                                                        const now = new Date();
                                                        const startDate = new Date(item.start_date + 'T00:00:00');
                                                        const endDate = new Date(item.end_date + 'T23:59:59');
                                                        
                                                        let status, bgColor, icon;
                                                        
                                                        if (now < startDate) {
                                                            status = 'Upcoming';
                                                            bgColor = 'warning';
                                                            icon = 'fa-clock';
                                                        } else if (now >= startDate && now <= endDate) {
                                                            status = 'Active';
                                                            bgColor = 'success';
                                                            icon = 'fa-play';
                                                        } else {
                                                            status = 'Completed';
                                                            bgColor = 'secondary';
                                                            icon = 'fa-flag-checkered';
                                                        }
                                                        
                                                        return (
                                                            <Badge 
                                                                bg={bgColor} 
                                                                className="px-3 py-2"
                                                            >
                                                                <i className={`fas ${icon} me-1`}></i>
                                                                {status}
                                                            </Badge>
                                                        );
                                                    })()}
                                                </div>
                                            </Card.Body>

                                            <div className="card-modern-footer">
                                                <div className="d-grid">
                                                    <button 
                                                        className="btn btn-modern d-flex align-items-center justify-content-center"
                                                        onClick={() => handleViewDetails(item)}
                                                    >
                                                        <i className="fas fa-eye me-2"></i>
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

ViewerTour.propTypes = {
    setProps: PropTypes.func.isRequired,
};

export default ViewerTour;
