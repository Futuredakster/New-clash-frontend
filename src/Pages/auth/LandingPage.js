import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col, Modal, Alert, Spinner } from 'react-bootstrap';
import imageone from '../../assets/images/imageone.jpg';
import karate from '../../assets/images/karate.jpg';
import kick from '../../assets/images/kick.jpg';
import Carousel from 'react-bootstrap/Carousel';
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

  // Simplified button group with better visibility
  const renderButtons = () => (
    <div className="mt-4">
      {/* Content wrapper with semi-transparent background for better readability */}
      <div 
        className="p-4 rounded-3 mx-auto" 
        style={{
          background: 'rgba(0, 0, 0, 0.6)', 
          backdropFilter: 'blur(5px)',
          maxWidth: '600px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Primary CTA */}
        <div className="text-center mb-4">
          <h4 className="text-white mb-3 fw-bold">Get Started Today</h4>
          
          {/* Demo Button - Most Prominent */}
          <Button
            className="btn btn-warning btn-lg px-4 py-3 mb-3 d-flex align-items-center justify-content-center mx-auto"
            onClick={handleCreateDemo}
            disabled={isCreatingDemo}
            style={{ 
              fontSize: '1.1rem', 
              fontWeight: '700',
              color: '#000',
              boxShadow: '0 6px 20px rgba(255, 193, 7, 0.4)',
              paddingTop: '1.2rem',
              paddingBottom: '1.2rem',
              background: 'linear-gradient(45deg, #ffc107, #ffcd39)',
              border: 'none',
              maxWidth: '320px'
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
                <span>TRY DEMO</span>
              </>
            )}
          </Button>
          <div className="text-white-50 mb-4" style={{fontSize: '0.9rem'}}>
            Explore with pre-loaded tournaments, participants, and competitions
          </div>
          
          {/* Error Display */}
          {demoError && (
            <Alert variant="danger" className="mx-auto" style={{maxWidth: '400px', fontSize: '0.9rem'}}>
              {demoError}
            </Alert>
          )}
          
          {/* Create Account Button - Secondary */}
          <Button
            className="btn btn-outline-light btn-lg px-4 py-2 d-flex align-items-center justify-content-center mx-auto"
            onClick={() => navigate('/AccountUser')}
            style={{ 
              fontSize: '1rem', 
              fontWeight: '600',
              borderColor: 'rgba(255, 255, 255, 0.7)',
              maxWidth: '320px'
            }}
          >
            <i className="fas fa-trophy me-2"></i>
            <span>CREATE ACCOUNT</span>
          </Button>
          <div className="text-white-50" style={{fontSize: '0.85rem'}}>
            Set up your organizer account and start managing competitions
          </div>
        </div>

        {/* Simplified secondary options */}
        <div className="row g-2 mt-4">
          <div className="col-md-4">
            <Button
              className="btn btn-outline-light btn-sm w-100"
              onClick={() => navigate('/RegistrationTypeSelector')}
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem'
              }}
            >
              <i className="fas fa-users me-1 d-none d-sm-inline"></i>
              <span>Register</span>
            </Button>
          </div>
          <div className="col-md-4">
            <Button
              className="btn btn-outline-light btn-sm w-100"
              onClick={() => navigate('/LoginTypeSelector')}
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem'
              }}
            >
              <i className="fas fa-list-check me-1 d-none d-sm-inline"></i>
              <span>My Registrations</span>
            </Button>
          </div>
          <div className="col-md-4">
            <Button
              className="btn btn-outline-light btn-sm w-100"
              onClick={() => navigate('/ViewerTour')}
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem'
              }}
            >
              <i className="fas fa-tv me-1 d-none d-sm-inline"></i>
              <span>Watch Live</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="position-relative" style={{ minHeight: '100vh', height: '100vh', overflow: 'hidden' }}>
      <Carousel fade style={{ minHeight: '100vh', height: '100vh', width: '100vw' }}>
        <Carousel.Item interval={4000}>
          <div className="position-relative">
            <img
              className="d-block"
              src={imageone}
              alt="Karate Tournament Management"
              style={{ 
                objectFit: 'cover', 
                width: '100vw', 
                height: '100vh', 
                minHeight: '100vh', 
                filter: 'brightness(0.7)'
              }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
              <Container>
                <Row className="justify-content-center">
                  <Col lg={10} className="text-center text-white fade-in">
                    <div 
                      className="p-4 rounded-3 mb-4" 
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)', 
                        backdropFilter: 'blur(3px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <h1 className="display-3 fw-bold mb-4">
                        Unleash the Thrill with <span style={{color: '#ffd700'}}>Clash</span>
                      </h1>
                      <p className="lead mb-0" style={{fontSize: '1.25rem'}}>
                        Your ultimate platform for seamlessly organizing and managing karate tournaments. 
                        Whether you're a martial artist, karate competitor, or dojo looking to host competitions.
                      </p>
                    </div>
                    {renderButtons()}
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </Carousel.Item>

        <Carousel.Item interval={4000}>
          <div className="position-relative">
            <img
              className="d-block"
              src={karate}
              alt="Competition Excellence"
              style={{ 
                objectFit: 'cover', 
                width: '100vw', 
                height: '100vh', 
                minHeight: '100vh', 
                filter: 'brightness(0.7)'
              }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
              <Container>
                <Row className="justify-content-center">
                  <Col lg={10} className="text-center text-white slide-up">
                    <div 
                      className="p-4 rounded-3 mb-4" 
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)', 
                        backdropFilter: 'blur(3px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <h2 className="display-4 fw-bold mb-4">
                        Effortless Karate Competition Management
                      </h2>
                      <p className="lead mb-0" style={{fontSize: '1.25rem'}}>
                        Create comprehensive brackets, manage participants, and experience real-time updates 
                        with our intuitive karate tournament management system.
                      </p>
                    </div>
                    {renderButtons()}
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </Carousel.Item>

        <Carousel.Item interval={4000}>
          <div className="position-relative">
            <img
              className="d-block"
              src={kick}
              alt="Dynamic Competition"
              style={{ 
                objectFit: 'cover', 
                width: '100vw', 
                height: '100vh', 
                minHeight: '100vh', 
                filter: 'brightness(0.7)'
              }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
              <Container>
                <Row className="justify-content-center">
                  <Col lg={10} className="text-center text-white fade-in">
                    <div 
                      className="p-4 rounded-3 mb-4" 
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)', 
                        backdropFilter: 'blur(3px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <h2 className="display-4 fw-bold mb-4">
                        Live Tournament Experience
                      </h2>
                      <p className="lead mb-0" style={{fontSize: '1.25rem'}}>
                        Watch your events come to life with live scores, winner updates, and dynamic matchups. 
                        Stay connected to the action from start to finish.
                      </p>
                    </div>
                    {renderButtons()}
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
        </Carousel.Item>
      </Carousel>
      
      {/* Navigation Dots */}
      <div className="position-absolute start-50 translate-middle-x" style={{ bottom: '20px' }}>
        <div className="d-flex gap-2">
          <div className="bg-white rounded-circle" style={{width: '12px', height: '12px', opacity: '0.5'}}></div>
          <div className="bg-white rounded-circle" style={{width: '12px', height: '12px', opacity: '0.5'}}></div>
          <div className="bg-white rounded-circle" style={{width: '12px', height: '12px', opacity: '0.5'}}></div>
        </div>
      </div>

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