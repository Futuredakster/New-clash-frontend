import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { link } from '../../constant';

const EditParentModal = ({ showModal, handleClose, parent, onParentUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset and populate form when modal opens or parent changes
  useEffect(() => {
    if (showModal && parent && !isSuccess) {
      setFormData({
        name: parent.name || "",
        email: parent.email || ""
      });
      setErrorMessage("");
      setSuccessMessage("");
      setIsSuccess(false);
    }
  }, [showModal, parent]);

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
      const parentToken = localStorage.getItem("parentToken");

      if (!parentToken) {
        setErrorMessage("Authentication required. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      // Validate at least one field is provided and different
      const nameChanged = formData.name.trim() !== parent.name;
      const emailChanged = formData.email.trim() !== parent.email;
      
      if (!nameChanged && !emailChanged) {
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

      const response = await fetch(`${link}/parents/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'parentAccessToken': parentToken
        },
        body: JSON.stringify({
          name: formData.name.trim() || undefined,
          email: formData.email.trim() || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update parent details');
      }

      const result = await response.json();
      setIsSubmitting(false);
      setIsSuccess(true);
      setSuccessMessage("Details updated successfully!");

      // Notify parent component of the updated data
      if (onParentUpdated && result.parent) {
        onParentUpdated(result.parent);
      }

      // Close modal after longer delay to show success message
      setTimeout(() => {
        setIsSuccess(false);
        handleClose();
      }, 3000);

    } catch (error) {
      console.error("Error updating parent details:", error);
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

export default EditParentModal;