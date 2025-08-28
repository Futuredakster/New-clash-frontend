import React, { useState } from "react";
// ...existing code...
import axios from "axios";
import VerificationModal from "../../components/modals/VerificationModal";
import { link } from './constant';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// ...existing code...

const PartEmailVer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [participantId, setParticipantId] = useState(null);

  const handleVerify = async () => {
    try {
      console.log("Email being sent to backend:", email); // Log the email

      const response = await axios.post(`${link}/participants/auth`, { email });

      console.log("Backend response:", response.data); // Log the response data
      setParticipantId(response.data.participant_id); // Set the participant ID

      if (response.data.participant_id) {
        console.log("Participant ID set:", response.data.participant_id);
      } else {
        console.log("No participant ID received.");
      }

      setMessage("Email successfully sent");
      setShowModal(true);
    } catch (error) {
      console.error("Error during verification:", error); // Log any errors

      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'}}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <div className="fade-in">
            <Card className="card-modern shadow">
              <Card.Header className="text-center bg-white border-0 pt-4 pb-2">
                <h3 className="mb-0 fw-bold" style={{color: 'var(--dark-grey)'}}>Email Verification</h3>
                <p className="text-muted mb-0">Enter your email to verify and view your registered tournaments</p>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                <div className="form-group-modern">
                  <label className="form-label-modern">Email Address</label>
                  <input
                    type="email"
                    className="form-control-modern"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="d-grid gap-2 mb-3">
                  <Button 
                    className="btn btn-modern"
                    onClick={handleVerify}
                  >
                    <i className="fas fa-envelope-open-text me-2"></i>
                    Verify Email
                  </Button>
                </div>
                {message && (
                  <div className={`alert mt-3 ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                  </div>
                )}
                <div className="text-center mt-3">
                  <small className="text-muted">
                    Haven't signed up yet?{' '}
                    <Link to="/ParticipantLogin" className="text-dark fw-bold">Sign up here</Link>
                  </small>
                </div>
              </Card.Body>
            </Card>
            <VerificationModal
              showModal={showModal}
              handleClose={handleCloseModal}
              participantId={participantId}
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PartEmailVer;
