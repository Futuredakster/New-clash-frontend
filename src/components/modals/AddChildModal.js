import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthContext } from '../../context/AuthContext';
import { link } from './constant';

const AddChildModal = ({ showModal, handleClose, onChildAdded }) => {
  const { parentState } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    date_of_birth: "",
    belt_color: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (showModal) {
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
      const parentId = parentState.id;

      if (!parentToken || !parentId) {
        setErrorMessage("Parent account not found. Please log in again.");
        setIsSubmitting(false);
        return;
      }

      // Validate required fields
      if (!formData.name.trim()) {
        setErrorMessage("Child name is required.");
        setIsSubmitting(false);
        return;
      }

      if (!formData.belt_color) {
        setErrorMessage("Belt color is required.");
        setIsSubmitting(false);
        return;
      }

      // Use the same API endpoint as ParentRegistrationForm but with single child
      const response = await fetch(`${link}/parents/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'parentAccessToken': parentToken
        },
        body: JSON.stringify({
          parent_id: parentId,
          children: [{
            name: formData.name.trim(),
            date_of_birth: formData.date_of_birth || null,
            belt_color: formData.belt_color || null
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add child');
      }

      const result = await response.json();
      setSuccessMessage("Child added successfully!");

      // Notify parent component of the new child
      if (onChildAdded && result.participants && result.participants.length > 0) {
        onChildAdded(result.participants[0]);
      }

      // Close modal after short delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1500);

    } catch (error) {
      console.error("Error adding child:", error);
      setErrorMessage(error.message || "An error occurred while adding child. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-user-plus me-2"></i>
          Add New Child
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
            <small className="text-muted">Optional - can be added later</small>
          </Form.Group>

          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="belt_color" className="form-label-modern">
              <i className="fas fa-medal me-2"></i>
              Belt Color *
            </Form.Label>
            <Form.Select
              id="belt_color"
              name="belt_color"
              value={formData.belt_color}
              onChange={handleInputChange}
              className="form-control-modern"
              required
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
                  Adding Child...
                </>
              ) : (
                <>
                  <i className="fas fa-plus me-2"></i>
                  Add Child
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

export default AddChildModal;