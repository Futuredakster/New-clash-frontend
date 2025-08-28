import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';
import imageone from '../Images/imageone.jpg';
import karate from '../Images/karate.jpg';
import kick from '../Images/kick.jpg';
import Carousel from 'react-bootstrap/Carousel';

function LandingPage() {
  const navigate = useNavigate();

  // Reusable button group with modern styling
  const renderButtons = () => (
    <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
      <Button
        className="btn btn-modern"
        onClick={() => navigate('/AccountUser')}
      >
        <i className="fas fa-trophy me-2"></i>
        <span>CREATE TOURNAMENTS</span>
      </Button>
      <Button
        className="btn btn-modern-outline"
        onClick={() => navigate('/RegistrationTypeSelector')}
      >
        <i className="fas fa-users me-2"></i>
        <span>JOIN TOURNAMENT</span>
      </Button>
      <Button
        className="btn btn-modern-outline"
        onClick={() => navigate('/LoginTypeSelector')}
      >
        <i className="fas fa-list-check me-2"></i>
        <span>SEE YOUR TOURNAMENTS</span>
      </Button>
       <Button
        className="btn btn-modern-outline"
        onClick={() => navigate('/ViewerTour')}
      >
        <i className="fas fa-tv me-2"></i>
        <span>SEE MATCHES AND TOURNAMENTS</span>
      </Button>
    </div>
  );

  return (
    <div className="position-relative">
      <Carousel fade className="vh-100">
        <Carousel.Item interval={4000}>
          <div className="position-relative">
            <img
              className="d-block w-100"
              src={imageone}
              alt="Tournament Management"
              style={{ objectFit: 'cover', height: '100vh', filter: 'brightness(0.7)' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
              <Container>
                <Row className="justify-content-center">
                  <Col lg={8} className="text-center text-white fade-in">
                    <h1 className="display-3 fw-bold mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                      Unleash the Thrill with <span style={{color: '#ffffff'}}>Clash</span>
                    </h1>
                    <p className="lead mb-4" style={{fontSize: '1.25rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                      Your ultimate platform for seamlessly organizing and managing tournaments. 
                      Whether you're a sports enthusiast, passionate gamer, or organization looking to foster team spirit.
                    </p>
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
              style={{ objectFit: 'cover', height: '100vh', filter: 'brightness(0.7)' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
              <Container>
                <Row className="justify-content-center">
                  <Col lg={8} className="text-center text-white slide-up">
                    <h2 className="display-4 fw-bold mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                      Effortless Tournament Creation
                    </h2>
                    <p className="lead mb-4" style={{fontSize: '1.25rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                      Create comprehensive brackets, manage participants, and experience real-time updates 
                      with our intuitive tournament management system.
                    </p>
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
              style={{ objectFit: 'cover', height: '100vh', filter: 'brightness(0.7)' }}
            />
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
              <Container>
                <Row className="justify-content-center">
                  <Col lg={8} className="text-center text-white fade-in">
                    <h2 className="display-4 fw-bold mb-4" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                      Live Tournament Experience
                    </h2>
                    <p className="lead mb-4" style={{fontSize: '1.25rem', textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>
                      Watch your events come to life with live scores, winner updates, and dynamic matchups. 
                      Stay connected to the action from start to finish.
                    </p>
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