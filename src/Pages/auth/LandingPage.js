import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Modal, Alert, Spinner, Card } from 'react-bootstrap';
import imageone from '../../assets/images/imageone.jpg';
import karate from '../../assets/images/karate.jpg';
import kick from '../../assets/images/kick.jpg';
import axios from 'axios';
import { link } from '../../constant';

function LandingPage() {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [demoCredentials, setDemoCredentials] = useState(null);
  const [demoError, setDemoError] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState('host');

  const handleCreateDemo = async () => {
    setIsCreatingDemo(true);
    setDemoError(null);
    
    try {
      const response = await axios.post(`${link}/demo`, {});
      
      if (response.data.login_credentials) {
        setDemoCredentials(response.data.login_credentials);
        setShowDemoModal(true);
      } else {
        throw new Error('Demo created but no credentials received');
      }
    } catch (error) {
      console.error('Error creating demo:', error);
      setDemoError(error.response?.data?.error || 'Failed to create demo data');
    } finally {
      setIsCreatingDemo(false);
    }
  };

  const handleLoginWithDemo = () => {
    if (demoCredentials) {
      // Navigate to login with tournament host credentials pre-filled
      const hostCreds = demoCredentials.tournament_host || demoCredentials;
      navigate('/Login', { 
        state: { 
          demoCredentials: {
            username: hostCreds.username,
            email: hostCreds.email,
            password: hostCreds.password
          }
        }
      });
    }
  };


  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        className="position-relative d-flex align-items-center"
        style={{
          minHeight: '100vh',
          background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(${imageone})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="text-white">
              <h1 className="display-3 fw-bold mb-4">
                Unleash the Thrill with <span style={{color: '#ffd700'}}>Clash</span>
              </h1>
              <p className="lead mb-4" style={{fontSize: '1.25rem', lineHeight: '1.6'}}>
                The ultimate platform for seamlessly organizing and managing karate tournaments.
                From brackets to live scoring, streamline your competitions with professional-grade tools.
              </p>

              {/* Hero CTA Buttons */}
              <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
                <Button
                  size="lg"
                  className="px-4 py-3"
                  onClick={handleCreateDemo}
                  disabled={isCreatingDemo}
                  style={{
                    fontWeight: '700',
                    color: '#000',
                    backgroundColor: '#ffc107',
                    background: 'linear-gradient(45deg, #ffc107, #ffcd39)',
                    border: '2px solid #ffc107',
                    boxShadow: '0 8px 25px rgba(255, 193, 7, 0.3)',
                    whiteSpace: 'nowrap',
                    minWidth: '200px'
                  }}
                >
                  {isCreatingDemo ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Creating Demo...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play-circle me-2"></i>
                      <span>Try Live Demo</span>
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  className="px-4 py-3"
                  onClick={() => navigate('/AccountUser')}
                  style={{
                    fontWeight: '600',
                    backgroundColor: 'transparent',
                    borderColor: '#fff',
                    borderWidth: '2px',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    minWidth: '180px'
                  }}
                >
                  <i className="fas fa-trophy me-2"></i>
                  <span>Start Free</span>
                </Button>
              </div>

              {demoError && (
                <Alert variant="danger" className="mb-4" style={{maxWidth: '400px'}}>
                  {demoError}
                </Alert>
              )}

              {/* Quick Access Links */}
              <div className="d-flex flex-wrap gap-3">
                <Button
                  size="sm"
                  className="px-3 py-2"
                  onClick={() => navigate('/RegistrationTypeSelector')}
                  style={{
                    fontWeight: '500',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: '1px',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem'
                  }}
                >
                  <i className="fas fa-users me-1"></i>
                  <span>Register for Tournament</span>
                </Button>
                <Button
                  size="sm"
                  className="px-3 py-2"
                  onClick={() => navigate('/ViewerTour')}
                  style={{
                    fontWeight: '500',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: '1px',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem'
                  }}
                >
                  <i className="fas fa-tv me-1"></i>
                  <span>Watch Live</span>
                </Button>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <div className="text-center">
                <img
                  src={karate}
                  alt="Tournament Management"
                  className="img-fluid rounded-3 shadow-lg"
                  style={{ maxHeight: '500px', objectFit: 'cover' }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold mb-3">Everything You Need to Run Professional Tournaments</h2>
              <p className="lead text-muted">Comprehensive tools designed specifically for karate competitions</p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-sitemap fa-3x text-primary"></i>
                  </div>
                  <h4>Smart Bracket Generation</h4>
                  <p className="text-muted">
                    Automatically create tournament brackets with intelligent pairing.
                    Supports elimination and round-robin formats for any competition size.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-fist-raised fa-3x text-warning"></i>
                  </div>
                  <h4>Live Kumite Scoring</h4>
                  <p className="text-muted">
                    Real-time point tracking with penalty management, SENSHU system,
                    and WKF-compliant scoring for authentic karate competitions.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-meditation fa-3x text-success"></i>
                  </div>
                  <h4>Kata Judging</h4>
                  <p className="text-muted">
                    Simplified winner declaration for kata competitions.
                    Clean interface for judges to quickly advance competitors.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-eye fa-3x text-info"></i>
                  </div>
                  <h4>Spectator Views</h4>
                  <p className="text-muted">
                    Live scoreboards for audience engagement.
                    Perfect for streaming, family viewing, and venue displays.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-users fa-3x text-secondary"></i>
                  </div>
                  <h4>Participant Management</h4>
                  <p className="text-muted">
                    Complete registration system with parent accounts,
                    age verification, and division assignment automation.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-video fa-3x text-danger"></i>
                  </div>
                  <h4>Live Streaming</h4>
                  <p className="text-muted">
                    Integrated streaming capabilities for remote viewing.
                    Share your tournaments with a global karate community.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold mb-3">How It Works</h2>
              <p className="lead text-muted">Get your tournament running in three simple steps</p>
            </Col>
          </Row>
          <Row className="g-4 align-items-center">
            <Col md={4} className="text-center">
              <div className="mb-4">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '80px', height: '80px' }}
                >
                  <span className="fw-bold fs-3">1</span>
                </div>
                <h4>Setup Tournament</h4>
                <p className="text-muted">
                  Create your tournament, add divisions by age and skill level,
                  and configure competition rules.
                </p>
              </div>
            </Col>
            <Col md={4} className="text-center">
              <div className="mb-4">
                <div
                  className="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '80px', height: '80px' }}
                >
                  <span className="fw-bold fs-3">2</span>
                </div>
                <h4>Register Participants</h4>
                <p className="text-muted">
                  Athletes and parents register online, with automatic
                  division assignment based on age and experience.
                </p>
              </div>
            </Col>
            <Col md={4} className="text-center">
              <div className="mb-4">
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '80px', height: '80px' }}
                >
                  <span className="fw-bold fs-3">3</span>
                </div>
                <h4>Run Competition</h4>
                <p className="text-muted">
                  Generate brackets, score matches in real-time,
                  and crown champions with professional tournament flow.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section
        className="py-5 text-white text-center"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${kick})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <h2 className="display-4 fw-bold mb-4">Ready to Elevate Your Tournaments?</h2>
              <p className="lead mb-4">
                Join tournament organizers who trust Clash for professional karate competitions.
                Start with our demo or create your free account today.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <Button
                  size="lg"
                  className="px-5 py-3"
                  onClick={handleCreateDemo}
                  disabled={isCreatingDemo}
                  style={{
                    fontWeight: '700',
                    color: '#000',
                    backgroundColor: '#ffc107',
                    background: 'linear-gradient(45deg, #ffc107, #ffcd39)',
                    border: '2px solid #ffc107',
                    boxShadow: '0 8px 25px rgba(255, 193, 7, 0.3)',
                    whiteSpace: 'nowrap',
                    minWidth: '200px'
                  }}
                >
                  {isCreatingDemo ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      <span>Creating Demo...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-play-circle me-2"></i>
                      <span>Try Demo Now</span>
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  className="px-5 py-3"
                  onClick={() => navigate('/AccountUser')}
                  style={{
                    fontWeight: '600',
                    backgroundColor: 'transparent',
                    borderColor: '#fff',
                    borderWidth: '2px',
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    minWidth: '220px'
                  }}
                >
                  <i className="fas fa-trophy me-2"></i>
                  <span>Create Free Account</span>
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Demo Credentials Modal */}
      <Modal 
        show={showDemoModal} 
        onHide={() => setShowDemoModal(false)}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="bg-success text-white">
          <Modal.Title className="d-flex align-items-center">
            <i className="fas fa-check-circle me-2"></i>
            Demo Environment Created!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3" style={{maxHeight: '70vh', overflowY: 'auto'}}>
          <div className="text-center mb-3">
            <div className="bg-light rounded p-3 mb-3">
              <h5 className="text-success mb-3">
                <i className="fas fa-key me-2"></i>
                Demo Account Credentials
              </h5>
              <Alert variant="info" className="mb-3 py-2">
                <strong>IMPORTANT:</strong> Save these credentials! You can test different user types.
              </Alert>
              
              {demoCredentials && (
                <div className="accordion" id="credentialsAccordion" style={{width: '100%', maxWidth: '100%', overflow: 'hidden'}}>
                  {/* Tournament Host Account */}
                  <div className="accordion-item" style={{width: '100%', overflow: 'hidden'}}>
                    <h2 className="accordion-header">
                      <button 
                        className={`accordion-button d-flex align-items-center ${activeAccordion !== 'host' ? 'collapsed' : ''}`}
                        type="button" 
                        onClick={() => setActiveAccordion(activeAccordion === 'host' ? '' : 'host')}
                        style={{padding: '12px 16px', fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word'}}
                      >
                        <i className="fas fa-user-tie me-2 text-primary flex-shrink-0"></i>
                        <strong style={{whiteSpace: 'normal', lineHeight: '1.3'}}>Tournament Organizer</strong>
                      </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${activeAccordion === 'host' ? 'show' : ''}`}>
                      <div className="accordion-body p-3">
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label fw-bold small mb-1">Username:</label>
                            <div className="input-group input-group-sm">
                              <input 
                                type="text" 
                                className="form-control text-center fw-bold" 
                                value={demoCredentials.tournament_host?.username || demoCredentials.username} 
                                readOnly 
                                style={{fontSize: '14px'}}
                              />
                              <button 
                                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                onClick={() => navigator.clipboard.writeText(demoCredentials.tournament_host?.username || demoCredentials.username)}
                                style={{width: '40px'}}
                                title="Copy to clipboard"
                              >
                                <i className="fas fa-copy"></i>
                              </button>
                            </div>
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-bold small mb-1">Email:</label>
                            <div className="input-group input-group-sm">
                              <input 
                                type="text" 
                                className="form-control fw-bold" 
                                value={demoCredentials.tournament_host?.email || demoCredentials.email} 
                                readOnly 
                                style={{ textAlign: 'left', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                              />
                              <button 
                                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                onClick={() => navigator.clipboard.writeText(demoCredentials.tournament_host?.email || demoCredentials.email)}
                                style={{width: '40px'}}
                                title="Copy to clipboard"
                              >
                                <i className="fas fa-copy"></i>
                              </button>
                            </div>
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-bold small mb-1">Password:</label>
                            <div className="input-group input-group-sm">
                              <input 
                                type="text" 
                                className="form-control text-center fw-bold text-primary" 
                                value={demoCredentials.tournament_host?.password || demoCredentials.password} 
                                readOnly 
                                style={{ letterSpacing: '1px', fontSize: '14px' }}
                              />
                              <button 
                                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                onClick={() => navigator.clipboard.writeText(demoCredentials.tournament_host?.password || demoCredentials.password)}
                                style={{width: '40px'}}
                                title="Copy to clipboard"
                              >
                                <i className="fas fa-copy"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parent Account */}
                  <div className="accordion-item" style={{width: '100%', overflow: 'hidden'}}>
                    <h2 className="accordion-header">
                      <button 
                        className={`accordion-button d-flex align-items-center ${activeAccordion !== 'parent' ? 'collapsed' : ''}`}
                        type="button" 
                        onClick={() => setActiveAccordion(activeAccordion === 'parent' ? '' : 'parent')}
                        style={{padding: '12px 16px', fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word'}}
                      >
                        <i className="fas fa-users me-2 text-success flex-shrink-0"></i>
                        <strong style={{whiteSpace: 'normal', lineHeight: '1.3'}}>Parent Account</strong>
                      </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${activeAccordion === 'parent' ? 'show' : ''}`}>
                      <div className="accordion-body p-3">
                        {demoCredentials.sample_parent && (
                          <>
                            <div className="mb-3">
                              <div className="alert alert-info py-2">
                                <strong>{demoCredentials.sample_parent.name}</strong><br/>
                                <small>{demoCredentials.sample_parent.role}</small>
                              </div>
                            </div>
                            <div className="mb-2">
                              <label className="form-label fw-bold small mb-1">Email:</label>
                              <div className="input-group input-group-sm">
                                <input 
                                  type="text" 
                                  className="form-control fw-bold" 
                                  value={demoCredentials.sample_parent.email} 
                                  readOnly 
                                  style={{ textAlign: 'left', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                />
                                <button 
                                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                  onClick={() => navigator.clipboard.writeText(demoCredentials.sample_parent.email)}
                                  style={{width: '40px'}}
                                  title="Copy to clipboard"
                                >
                                  <i className="fas fa-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="alert alert-warning py-2 small">
                              <i className="fas fa-info-circle me-1"></i>
                              Parents login using email verification code sent to their email
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Participant Account */}
                  <div className="accordion-item" style={{width: '100%', overflow: 'hidden'}}>
                    <h2 className="accordion-header">
                      <button 
                        className={`accordion-button d-flex align-items-center ${activeAccordion !== 'participant' ? 'collapsed' : ''}`}
                        type="button" 
                        onClick={() => setActiveAccordion(activeAccordion === 'participant' ? '' : 'participant')}
                        style={{padding: '12px 16px', fontSize: '14px', wordWrap: 'break-word', overflowWrap: 'break-word'}}
                      >
                        <i className="fas fa-user-graduate me-2 text-warning flex-shrink-0"></i>
                        <strong style={{whiteSpace: 'normal', lineHeight: '1.3'}}>Participant Account</strong>
                      </button>
                    </h2>
                    <div className={`accordion-collapse collapse ${activeAccordion === 'participant' ? 'show' : ''}`}>
                      <div className="accordion-body p-3">
                        {demoCredentials.sample_participant && (
                          <>
                            <div className="mb-3">
                              <div className="alert alert-info py-2">
                                <strong>{demoCredentials.sample_participant.name}</strong><br/>
                                <small>{demoCredentials.sample_participant.role} • {demoCredentials.sample_participant.belt}</small>
                              </div>
                            </div>
                            <div className="mb-2">
                              <label className="form-label fw-bold small mb-1">Email:</label>
                              <div className="input-group input-group-sm">
                                <input 
                                  type="text" 
                                  className="form-control fw-bold" 
                                  value={demoCredentials.sample_participant.email} 
                                  readOnly 
                                  style={{ textAlign: 'left', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                />
                                <button 
                                  className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                                  onClick={() => navigator.clipboard.writeText(demoCredentials.sample_participant.email)}
                                  style={{width: '40px'}}
                                  title="Copy to clipboard"
                                >
                                  <i className="fas fa-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="alert alert-warning py-2 small">
                              <i className="fas fa-info-circle me-1"></i>
                              Participants login using email verification code sent to their email
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-light rounded p-3 mb-4">
              <h6 className="text-primary mb-2">
                <i className="fas fa-info-circle me-2"></i>
                What's Been Created:
              </h6>
              <div className="row text-start">
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0 small">
                    <li><i className="fas fa-trophy text-warning me-2"></i>2 Sample Tournaments</li>
                    <li><i className="fas fa-layer-group text-info me-2"></i>22 Competition Divisions</li>
                    <li><i className="fas fa-users text-success me-2"></i>5 Parent Accounts</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="list-unstyled mb-0 small">
                    <li><i className="fas fa-user-graduate text-primary me-2"></i>14 Participants</li>
                    <li><i className="fas fa-clipboard-list text-secondary me-2"></i>12 Division Registrations</li>
                    <li><i className="fas fa-building text-muted me-2"></i>1 Demo Organization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between align-items-center">
          <Button 
            variant="secondary" 
            onClick={() => setShowDemoModal(false)}
            className="d-flex align-items-center"
            style={{height: '40px', minWidth: '120px'}}
          >
            <i className="fas fa-bookmark me-2"></i>
            <span>Save for Later</span>
          </Button>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-success" 
              onClick={() => {
                setShowDemoModal(false);
                navigate('/LoginTypeSelector');
              }}
              className="d-flex align-items-center justify-content-center px-3"
              style={{height: '40px', minWidth: '180px', whiteSpace: 'nowrap'}}
            >
              <i className="fas fa-users me-2"></i>
              <span>Parent/Participant</span>
            </Button>
            <Button 
              variant="success" 
              onClick={handleLoginWithDemo}
              className="d-flex align-items-center justify-content-center px-4"
              style={{height: '40px', minWidth: '140px', whiteSpace: 'nowrap'}}
            >
              <i className="fas fa-user-tie me-2"></i>
              <span>Host Login</span>
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default LandingPage;