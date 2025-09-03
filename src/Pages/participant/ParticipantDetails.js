import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../../context/AuthContext';
import { link } from '../../constant';
import EditParticipantModal from '../../components/modals/EditParticipantModal';

const ParticipantDetails = () => {
  const { partState } = useContext(AuthContext);
  const [participantData, setParticipantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchParticipantDetails = async () => {
      try {
        const participantToken = localStorage.getItem("participantAccessToken");
        if (!participantToken) {
          setError("Please log in to view your details.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${link}/participants/details`, {
          headers: {
            'participantAccessToken': participantToken
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Response not ok:', response.status, response.statusText, errorData);
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Participant data received:', data);
        setParticipantData(data);
      } catch (error) {
        console.error('Error fetching participant details:', error);
        setError(error.message || 'Failed to load participant details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipantDetails();
  }, []);

  const handleEditDetails = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleParticipantUpdated = (updatedParticipant) => {
    // Update the participant data with the updated information
    setParticipantData(prevData => ({
      ...prevData,
      ...updatedParticipant
    }));
  };

  if (loading) {
    return (
      <div className="container-modern fade-in">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading participant details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-modern fade-in">
        <Alert variant="danger" className="mt-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-modern fade-in">
      <div className="page-header-modern mb-4">
        <h2 className="page-title-modern">
          <i className="fas fa-user me-2"></i>
          Personal Details
        </h2>
        <p className="page-subtitle-modern">View and manage your karate competitor information</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <Card className="card-modern shadow-lg border-0" style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
            borderRadius: "16px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.08)"
          }}>
            <Card.Body className="p-3">
              <div className="text-center mb-3">
                <div className="participant-avatar mb-2" style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "#e3e7ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
                }}>
                  <i className="fas fa-user-circle fa-3x text-primary"></i>
                </div>
                <h4 className="mb-0 fw-bold" style={{ color: "#222" }}>
                  {participantData?.name}
                </h4>
                <span className="text-muted">Karate Competitor</span>
              </div>

              <div className="participant-details">
                <div className="detail-row mb-2 p-2" style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <label className="text-muted mb-1 d-block" style={{ fontSize: "0.9rem" }}>
                        <i className="fas fa-user me-2"></i>
                        Full Name
                      </label>
                      <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                        {participantData?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-row mb-2 p-2" style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <label className="text-muted mb-1 d-block" style={{ fontSize: "0.9rem" }}>
                        <i className="fas fa-envelope me-2"></i>
                        Email Address
                      </label>
                      <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                        {participantData?.email || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-row mb-2 p-2" style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <label className="text-muted mb-1 d-block" style={{ fontSize: "0.9rem" }}>
                        <i className="fas fa-calendar-alt me-2"></i>
                        Date of Birth
                      </label>
                      <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                        {participantData?.date_of_birth || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-row mb-2 p-2" style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <label className="text-muted mb-1 d-block" style={{ fontSize: "0.9rem" }}>
                        <i className="fas fa-medal me-2"></i>
                        Belt Color
                      </label>
                      <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                        {participantData?.belt_color || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-row mb-3 p-2" style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <label className="text-muted mb-1 d-block" style={{ fontSize: "0.9rem" }}>
                        <i className="fas fa-id-badge me-2"></i>
                        Participant ID
                      </label>
                      <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                        {participantData?.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="d-grid">
                  <Button 
                    className="btn btn-modern"
                    style={{ fontWeight: 600 }}
                    onClick={handleEditDetails}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Details
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Edit Participant Modal */}
      <EditParticipantModal
        showModal={showEditModal}
        handleClose={handleCloseEditModal}
        participant={participantData}
        onParticipantUpdated={handleParticipantUpdated}
      />
    </div>
  );
};

export default ParticipantDetails;