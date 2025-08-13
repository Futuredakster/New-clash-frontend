import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { link } from '../constant';

export default function CreateStream() {
  const [bracket_id, setBracket_id] = useState('');
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate hook

  // useEffect to extract bracket_id from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get('bracket_id');
    if (idFromUrl) {
      setBracket_id(idFromUrl);
    }
  }, [location.search]);

  const handleGenerate = async () => {
    if (!bracket_id) {
      setError('Bracket ID is missing from the URL.');
      return;
    }
    try {
      console.log('Sending bracket_id:', bracket_id);

      const res = await axios.post(`${link}/api/stream/tokens`, { bracket_id });
      setTokens(res.data);
      setError('');

      // *** New: Navigate to the host link immediately after successful token generation ***
      if (res.data && res.data.hostToken) {
        navigate(`/watch?t=${res.data.hostToken}`);
      }

    } catch (err) {
      setError('Failed to generate tokens. Is your backend running?');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            <Card className="card-modern shadow-lg border-0">
              <Card.Header className="card-modern-header text-center">
                <h2 className="mb-0 fw-bold" style={{color: '#1a1a1a'}}>
                  <i className="fas fa-video me-3" style={{color: '#666666'}}></i>
                  Create Live Stream
                </h2>
              </Card.Header>
              
              <Card.Body className="card-modern-body p-4">
                {bracket_id ? (
                  <Alert variant="success" className="mb-4 border-0" style={{background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)'}}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-check-circle me-2" style={{color: '#155724'}}></i>
                      <span><strong>Ready to stream!</strong> Bracket ID: <code className="bg-light px-2 py-1 rounded">{bracket_id}</code></span>
                    </div>
                  </Alert>
                ) : (
                  <Alert variant="warning" className="mb-4 border-0" style={{background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)'}}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle me-2" style={{color: '#856404'}}></i>
                      <span>No Bracket ID found in the URL. Please add <code>?bracket_id=YOUR_ID</code></span>
                    </div>
                  </Alert>
                )}

                <div className="text-center mb-4">
                  <p className="text-muted mb-3">
                    Click the button below to generate streaming tokens and start your live broadcast.
                  </p>
                  
                  <Button 
                    className="btn-modern btn-lg px-5 py-3"
                    onClick={handleGenerate} 
                    disabled={!bracket_id}
                    style={{fontSize: '1.1rem', minWidth: '250px'}}
                  >
                    <i className="fas fa-play me-2"></i>
                    Start Live Streaming
                  </Button>
                </div>

                {error && (
                  <Alert variant="danger" className="mt-4 border-0" style={{background: 'linear-gradient(135deg, #f8d7da 0%, #f1aeb5 100%)'}}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-times-circle me-2" style={{color: '#721c24'}}></i>
                      <span>{error}</span>
                    </div>
                  </Alert>
                )}

                {/* The links below are now optional, as the user will be redirected */}
                {tokens && (
                  <Card className="mt-4 border-0" style={{background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'}}>
                    <Card.Header className="bg-transparent border-0 pb-0">
                      <h5 className="mb-0 fw-bold" style={{color: '#1a1a1a'}}>
                        <i className="fas fa-key me-2" style={{color: '#1976d2'}}></i>
                        Tokens Generated Successfully
                      </h5>
                    </Card.Header>
                    <Card.Body className="pt-2">
                      <div className="mb-3">
                        <label className="form-label-modern">Host Token (You've been redirected)</label>
                        <div className="p-2 bg-light rounded border">
                          <code style={{fontSize: '0.85rem', wordBreak: 'break-all'}}>{tokens.hostToken}</code>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label-modern">Viewer Token (Share with others)</label>
                        <div className="p-2 bg-light rounded border">
                          <code style={{fontSize: '0.85rem', wordBreak: 'break-all'}}>{tokens.viewerToken}</code>
                        </div>
                      </div>
                      
                      <Alert variant="info" className="mb-0 border-0" style={{background: 'rgba(25, 118, 210, 0.1)'}}>
                        <i className="fas fa-info-circle me-2"></i>
                        You have been automatically navigated to the host link. Share the Viewer Token with others to let them watch your stream!
                      </Alert>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}