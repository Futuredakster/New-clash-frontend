import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { link } from '../../constant';

const EditParticipantModal = ({ showModal, handleClose, participant, onParticipantUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date_of_birth: "",
    belt_color: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset and populate form when modal opens or participant changes
  useEffect(() => {
    if (showModal && participant && !isSuccess) {
      setFormData({
        name: participant.name || "",
        email: participant.email || "",
        date_of_birth: participant.date_of_birth || "",
        belt_color: participant.belt_color || ""
      });
      setErrorMessage("");
      setSuccessMessage("");
      setIsSuccess(false);
    }
  }, [showModal, participant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const participantToken = localStorage.getItem("participantAccessToken");

      if (!participantToken) {
        setErrorMessage("Authentication required. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      // Validate at least one field is different
      const nameChanged = formData.name.trim() !== (participant.name || "");
      const emailChanged = formData.email.trim() !== (participant.email || "");
      const dobChanged = formData.date_of_birth !== (participant.date_of_birth || "");
      const beltChanged = formData.belt_color !== (participant.belt_color || "");
      
      if (!nameChanged && !emailChanged && !dobChanged && !beltChanged) {
        setErrorMessage("Please make at least one change to update your details.");
        setIsSubmitting(false);
        return;
      }

      // Validate email format if provided
      if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
        setErrorMessage("Please enter a valid email address.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${link}/participants/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'participantAccessToken': participantToken
        },
        body: JSON.stringify({
          name: formData.name.trim() || undefined,
          email: formData.email.trim() || undefined,
          date_of_birth: formData.date_of_birth || undefined,
          belt_color: formData.belt_color || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update participant details');
      }

      const result = await response.json();
      setIsSubmitting(false);
      setIsSuccess(true);
      setSuccessMessage("Details updated successfully!");

      // Notify parent component of the updated data
      if (onParticipantUpdated && result.participant) {
        onParticipantUpdated(result.participant);
      }

      // Close modal after longer delay to show success message
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
      }, 3000);

    } catch (error) {
      console.error("Error updating participant details:", error);
      setErrorMessage(error.message || "An error occurred while updating details. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={isSuccess ? () => {} : handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-user-edit me-2"></i>
          Edit Personal Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        
        <Form onSubmit={handleSubmit} className="form-modern">
          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="name" className="form-label-modern">
              <i className="fas fa-user me-2"></i>
              Full Name
            </Form.Label>
            <Form.Control
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control-modern"
              placeholder="Enter your full name"
            />
            <small className="text-muted">Leave unchanged if you don't want to update</small>
          </Form.Group>

          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="email" className="form-label-modern">
              <i className="fas fa-envelope me-2"></i>
              Email Address
            </Form.Label>
            <Form.Control
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control-modern"
              placeholder="Enter your email address"
            />
            <small className="text-muted">Leave unchanged if you don't want to update</small>
          </Form.Group>

          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="date_of_birth" className="form-label-modern">
              <i className="fas fa-calendar-alt me-2"></i>
              Date of Birth
            </Form.Label>
            <Form.Control
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="form-control-modern"
            />
            <small className="text-muted">Leave unchanged if you don't want to update</small>
          </Form.Group>

          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="belt_color" className="form-label-modern">
              <i className="fas fa-medal me-2"></i>
              Belt Color
            </Form.Label>
            <Form.Select
              id="belt_color"
              name="belt_color"
              value={formData.belt_color}
              onChange={handleInputChange}
              className="form-control-modern"
            >
              <option value="">Select belt color</option>
              <option value="White">White</option>
              <option value="Yellow">Yellow</option>
              <option value="Orange">Orange</option>
              <option value="Green">Green</option>
              <option value="Blue">Blue</option>
              <option value="Purple">Purple</option>
              <option value="Brown">Brown</option>
              <option value="Black">Black</option>
            </Form.Select>
            <small className="text-muted">Leave unchanged if you don't want to update</small>
          </Form.Group>

          <div className="d-grid gap-2 mt-4">
            <Button 
              type="submit" 
              className="btn btn-modern"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating Details...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Update Details
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleClose} 
          disabled={isSubmitting || isSuccess}
        >
          <i className="fas fa-times me-2"></i>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditParticipantModal;