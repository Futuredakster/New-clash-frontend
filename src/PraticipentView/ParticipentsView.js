import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { link } from '../constant';

const ParticipantsView = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('participantAccessToken');
    if (!token) {
      setError({ message: 'No access token found.' });
      setLoading(false);
      return;
    }

    axios.get(`${link}/participants/All`, {
      headers: {
        participantAccessToken: token,
      },
    })
    .then(response => {
      setData(response.data);
      setLoading(false);
    })
    .catch(err => {
      setError(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Container fluid className="fade-in">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading all participants...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="fade-in">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Alert variant="danger" className="text-center">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Error: {error.message || 'Unknown error'}
            </Alert>
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
          <i className="fas fa-users me-3"></i>
          All Participants
        </h1>
        <p className="page-subtitle-modern">
          {data.length} total participant{data.length !== 1 ? 's' : ''} across all divisions
        </p>
      </div>

      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          {data.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users fa-4x text-muted mb-4"></i>
              <h5 className="text-muted mb-3">No participants found</h5>
              <p className="text-muted">
                No participants have registered for any divisions yet.
              </p>
            </div>
          ) : (
            <>
              {/* Participants Grid */}
              <Row className="g-3">
                {data.map((participant, index) => (
                  <Col xs={12} sm={6} md={4} lg={3} key={index}>
                    <Card className="card-modern h-100">
                      <Card.Body className="card-modern-body text-center">
                        <div className="participant-avatar mb-3">
                          <i className="fas fa-user-circle fa-3x text-muted"></i>
                        </div>
                        <h6 className="participant-name mb-2">{participant.name}</h6>
                        <Badge bg="info" className="participant-badge">
                          <i className="fas fa-id-badge me-1"></i>
                          ID: {participant.id || index + 1}
                        </Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Summary Card */}
              <Card className="card-modern mt-4">
                <Card.Header className="card-modern-header">
                  <h5 className="mb-0">
                    <i className="fas fa-chart-bar me-2"></i>
                    Participants Overview
                  </h5>
                </Card.Header>
                <Card.Body className="card-modern-body">
                  <Row className="text-center g-3">
                    <Col xs={6} md={3}>
                      <div className="stat-item">
                        <h3 className="stat-number text-primary mb-1">{data.length}</h3>
                        <p className="stat-label text-muted mb-0">
                          Total Participants
                        </p>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div className="stat-item">
                        <h3 className="stat-number text-success mb-1">
                          {Math.ceil(data.length / 4)}
                        </h3>
                        <p className="stat-label text-muted mb-0">
                          Estimated Groups
                        </p>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div className="stat-item">
                        <h3 className="stat-number text-info mb-1">
                          {Math.ceil(data.length / 2)}
                        </h3>
                        <p className="stat-label text-muted mb-0">
                          Potential Matches
                        </p>
                      </div>
                    </Col>
                    <Col xs={6} md={3}>
                      <div className="stat-item">
                        <h3 className="stat-number text-warning mb-1">
                          {data.length > 0 ? Math.ceil(Math.log2(data.length)) : 0}
                        </h3>
                        <p className="stat-label text-muted mb-0">
                          Tournament Rounds
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ParticipantsView;
