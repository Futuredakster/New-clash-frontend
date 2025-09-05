import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';
import imageone from '../../assets/images/imageone.jpg';
import karate from '../../assets/images/karate.jpg';
import kick from '../../assets/images/kick.jpg';
import Carousel from 'react-bootstrap/Carousel';

function LandingPage() {
  const navigate = useNavigate();

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
          <Button
            className="btn btn-light btn-lg px-4 py-3 mb-3 d-flex align-items-center justify-content-center mx-auto"
            onClick={() => navigate('/AccountUser')}
            style={{ 
              fontSize: '1.05rem', 
              fontWeight: '600',
              color: '#0d6efd',
              boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
              paddingTop: '1rem',
              paddingBottom: '1rem'
            }}
          >
            <i className="fas fa-trophy me-2"></i>
            <span>CREATE TOURNAMENTS</span>
          </Button>
          <div className="text-white-50" style={{fontSize: '0.9rem'}}>
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
    <div className="position-relative overflow-hidden">
      <Carousel fade style={{ minHeight: '100vh', height: '100vh' }}>
        <Carousel.Item interval={4000}>
          <div className="position-relative">
            <img
              className="d-block w-100"
              src={imageone}
              alt="Karate Tournament Management"
              style={{ objectFit: 'cover', height: '100vh', minHeight: '100vh', filter: 'brightness(0.7)' }}
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
              className="d-block w-100"
              src={karate}
              alt="Competition Excellence"
              style={{ objectFit: 'cover', height: '100vh', minHeight: '100vh', filter: 'brightness(0.7)' }}
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
              className="d-block w-100"
              src={kick}
              alt="Dynamic Competition"
              style={{ objectFit: 'cover', height: '100vh', minHeight: '100vh', filter: 'brightness(0.7)' }}
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
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4">
        <div className="d-flex gap-2">
          <div className="bg-white rounded-circle" style={{width: '12px', height: '12px', opacity: '0.5'}}></div>
          <div className="bg-white rounded-circle" style={{width: '12px', height: '12px', opacity: '0.5'}}></div>
          <div className="bg-white rounded-circle" style={{width: '12px', height: '12px', opacity: '0.5'}}></div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;