import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../../context/AuthContext';
import { link } from '../../constant';
import EditParentModal from '../../components/modals/EditParentModal';

const ParentDetails = () => {
  const { parentState } = useContext(AuthContext);
  const [parentData, setParentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchParentDetails = async () => {
      try {
        const parentToken = localStorage.getItem("parentToken");
        if (!parentToken) {
          setError("Please log in to view your details.");
          setLoading(false);
          return;
        }

        const response = await fetch(`${link}/parents/details`, {
          headers: {
            'parentAccessToken': parentToken
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch parent details');
        }

        const data = await response.json();
        setParentData(data);
      } catch (error) {
        console.error('Error fetching parent details:', error);
        setError('Failed to load parent details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchParentDetails();
  }, []);

  const handleEditDetails = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleParentUpdated = (updatedParent) => {
    // Update the parent data with the updated information
    setParentData(prevData => ({
      ...prevData,
      ...updatedParent
    }));
  };

  if (loading) {
    return (
      <div className="container-modern fade-in">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading parent details...</p>
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
        <p className="page-subtitle-modern">View and manage your account information</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <Card className="card-modern shadow-lg border-0" style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
            borderRadius: "16px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.08)"
          }}>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="parent-avatar mb-3" style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#e3e7ee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
                }}>
                  <i className="fas fa-user-circle fa-4x text-primary"></i>
                </div>
                <h4 className="mb-0 fw-bold" style={{ color: "#222" }}>
                  {parentData?.name}
                </h4>
                <span className="text-muted">Parent Account</span>
              </div>

              <div className="parent-details">
                <div className="detail-row mb-3 p-3" style={{
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
                        {parentData?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-row mb-3 p-3" style={{
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
                        {parentData?.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-row mb-4 p-3" style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <label className="text-muted mb-1 d-block" style={{ fontSize: "0.9rem" }}>
                        <i className="fas fa-id-badge me-2"></i>
                        Parent ID
                      </label>
                      <span className="fw-bold" style={{ fontSize: "1.1rem" }}>
                        {parentData?.id}
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

      {/* Edit Parent Modal */}
      <EditParentModal
        showModal={showEditModal}
        handleClose={handleCloseEditModal}
        parent={parentData}
        onParentUpdated={handleParentUpdated}
      />
    </div>
  );
};

export default ParentDetails;