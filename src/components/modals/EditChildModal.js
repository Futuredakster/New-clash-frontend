import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { link } from './constant';

const EditChildModal = ({ showModal, handleClose, child, onChildUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    belt_color: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Populate form when modal opens or child changes
  useEffect(() => {
    if (showModal && child) {
      setFormData({
        name: child.name || "",
        date_of_birth: child.date_of_birth || "",
        belt_color: child.belt_color || ""
      });
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [showModal, child]);

  // Reset form when modal closes
  useEffect(() => {
    if (!showModal) {
      setFormData({
        name: "",
        date_of_birth: "",
        belt_color: ""
      });
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [showModal]);

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
        setErrorMessage("Parent token not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      const response = await axios.put(`${link}/parents/participants/${child.participant_id}`, formData, {
        headers: {
          parentAccessToken: parentToken,
          "Content-Type": "application/json",
        },
      });

      setSuccessMessage("Child information updated successfully!");
      
      // Notify parent component of the update
      if (onChildUpdated) {
        onChildUpdated(response.data.participant);
      }

      // Close modal after short delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error("Error updating child:", error);
      setErrorMessage(error.response?.data?.error || "An error occurred while updating child information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!child) {
    return null;
  }

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-edit me-2"></i>
          Edit Child Information
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        
        <Form onSubmit={handleSubmit} className="form-modern">
          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="name" className="form-label-modern">
              <i className="fas fa-user me-2"></i>
              Child Name *
            </Form.Label>
            <Form.Control
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control-modern"
              placeholder="Enter child's full name"
              required
            />
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
          </Form.Group>

          <div className="d-grid gap-2 mt-4">
            <Button 
              type="submit" 
              className="btn btn-modern"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Save Changes
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
          disabled={isSubmitting}
        >
          <i className="fas fa-times me-2"></i>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditChildModal;