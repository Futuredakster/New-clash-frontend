import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import HostStream from './HostStream';
import ViewerStream from './ViewerStream';

export default function WatchPage() {
  // Grab token from URL query, e.g., ?t=host-abc123 or ?t=view-xyz789
  const params = new URLSearchParams(window.location.search);
  const token = params.get('t');

  if (!token) {
    return (
      <div className="min-vh-100 d-flex align-items-center" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={6}>
              <Card className="card-modern shadow-lg border-0">
                <Card.Body className="card-modern-body text-center p-5">
                  <div className="mb-4">
                    <i className="fas fa-exclamation-triangle text-warning" style={{fontSize: '4rem'}}></i>
                  </div>
                  <h3 className="fw-bold mb-3" style={{color: '#1a1a1a'}}>No Token Provided</h3>
                  <Alert variant="warning" className="border-0" style={{background: 'rgba(255, 193, 7, 0.1)'}}>
                    <i className="fas fa-info-circle me-2"></i>
                    A valid stream token is required to access this page. Please check your URL and try again.
                  </Alert>
                  <p className="text-muted">
                    Make sure your URL includes a valid token parameter, for example:<br/>
                    <code className="bg-light px-2 py-1 rounded">?t=host-abc123</code> or <code className="bg-light px-2 py-1 rounded">?t=view-xyz789</code>
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  if (token.startsWith('host-')) {
    return <HostStream token={token} />;
  } else if (token.startsWith('view-')) {
    return <ViewerStream token={token} />;
  } else {
    return (
      <div className="min-vh-100 d-flex align-items-center" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={6}>
              <Card className="card-modern shadow-lg border-0">
                <Card.Body className="card-modern-body text-center p-5">
                  <div className="mb-4">
                    <i className="fas fa-times-circle text-danger" style={{fontSize: '4rem'}}></i>
                  </div>
                  <h3 className="fw-bold mb-3" style={{color: '#1a1a1a'}}>Invalid Token</h3>
                  <Alert variant="danger" className="border-0" style={{background: 'rgba(220, 53, 69, 0.1)'}}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    The provided token is not valid or has an incorrect format.
                  </Alert>
                  <p className="text-muted">
                    Valid tokens should start with:<br/>
                    • <code className="bg-light px-2 py-1 rounded">host-</code> for broadcasting<br/>
                    • <code className="bg-light px-2 py-1 rounded">view-</code> for viewing
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}