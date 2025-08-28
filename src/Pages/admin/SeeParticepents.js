import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { link } from '../../constant';

const SeeParticepents = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const division_id = queryParams.get('division_id') || '';
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [divisionName, setDivisionName] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error('Access token not found. API request not made.');
      setError({ message: 'Authentication required. Please log in.' });
      setLoading(false);
      return;
    }
    
    axios.get(`${link}/participants/user`, {
      headers: {
        accessToken: accessToken,
      },
      params: { division_id: division_id },
    })
    .then(response => {
      setData(response.data);
      setLoading(false);
    })
    .catch(error => {
      setError(error);
      setLoading(false);
    });

    // Also fetch division name if division_id is provided
    if (division_id) {
      axios.get(`${link}/divisions/${division_id}`)
        .then(response => {
          setDivisionName(response.data.division_name || 'Division');
        })
        .catch(() => {
          setDivisionName('Division');
        });
    }
  }, [division_id]);

  if (loading) {
    return (
      <Container fluid className="fade-in">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading participants...</p>
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
              Error: {error.message}
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
          {divisionName ? `${divisionName} Participants` : 'My Participants'}
        </h1>
        <p className="page-subtitle-modern">
          {data.length} participant{data.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      <Row className="justify-content-center">
        <Col xs={12} lg={8}>
          {data.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-users fa-4x text-muted mb-4"></i>
              <h5 className="text-muted mb-3">No participants found</h5>
              <p className="text-muted">
                {divisionName ? `No one has registered for ${divisionName} yet.` : 'You have not registered for any divisions yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Summary Card - Moved to top */}
              <Card className="card-modern mb-4">
                <Card.Header className="card-modern-header">
                  <h5 className="mb-0">
                    <i className="fas fa-chart-pie me-2"></i>
                    My Registration Summary
                  </h5>
                </Card.Header>
                <Card.Body className="card-modern-body">
                  <Row className="text-center g-3">
                    <Col xs={6} md={6}>
                      <div className="stat-item">
                        <h3 className="stat-number text-success mb-1">{data.length}</h3>
                        <p className="stat-label text-muted mb-0">
                          Active Registrations
                        </p>
                      </div>
                    </Col>
                    <Col xs={6} md={6}>
                      <div className="stat-item">
                        <h3 className="stat-number text-primary mb-1">
                          <i className="fas fa-trophy"></i>
                        </h3>
                        <p className="stat-label text-muted mb-0">
                          Tournament Ready
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Participants Grid - Now below summary */}
              <Row className="g-3">
                {data.map((participant, index) => (
                  <Col xs={12} sm={6} md={4} key={index}>
                    <Card className="card-modern h-100">
                      <Card.Body className="card-modern-body text-center">
                        <div className="participant-avatar mb-3">
                          <i className="fas fa-user-circle fa-3x text-muted"></i>
                        </div>
                        <h6 className="participant-name mb-2">{participant.name}</h6>
                        <Badge bg="success" className="participant-badge">
                          <i className="fas fa-check-circle me-1"></i>
                          Registered
                        </Badge>
                      </Card.Body>
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

export default SeeParticepents;