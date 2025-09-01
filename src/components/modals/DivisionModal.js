import React, { useState, useEffect } from 'react';
import { Button, Modal, Alert, Form } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { link } from './constant';

const DivisionModal = ({ division_id, showModal, handleClose }) => {
  const [formData, setFormData] = useState({
    division_id: division_id,
    age_group: "",
    proficiency_level: "",
    gender: "",  // Add gender to formData state
    category: "" // Add category to formData state
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch existing division data when modal opens
  useEffect(() => {
    if (showModal && division_id) {
      setLoading(true);
      setErrorMessage("");
      fetchDivisionData();
    }
  }, [showModal, division_id]);

  // Reset form when modal closes
  useEffect(() => {
    if (!showModal) {
      setFormData({
        division_id: division_id,
        age_group: "",
        proficiency_level: "",
        gender: "",
        category: ""
      });
      setLoading(true);
      setErrorMessage("");
    }
  }, [showModal, division_id]);

  const fetchDivisionData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(`${link}/divisions/default`, {
        headers: { accessToken: accessToken },
        params: { division_id: division_id }
      });
      
      if (response.data) {
        // Normalize case-sensitive data to match dropdown options
        const normalizeGender = (gender) => {
          if (!gender) return "";
          const lowerGender = gender.toLowerCase();
          if (lowerGender === 'male') return 'Male';
          if (lowerGender === 'female') return 'Female';
          return gender; // Return original if no match
        };

        const normalizeCategory = (category) => {
          if (!category) return "";
          const lowerCategory = category.toLowerCase();
          if (lowerCategory === 'kumite') return 'Kumite';
          if (lowerCategory === 'kata') return 'Kata';
          return category; // Return original if no match
        };

        const normalizeProficiency = (proficiency) => {
          if (!proficiency) return "";
          const lowerProficiency = proficiency.toLowerCase();
          if (lowerProficiency === 'beginner') return 'Beginner';
          if (lowerProficiency === 'intermediate') return 'Intermediate';
          if (lowerProficiency === 'advanced') return 'Advanced';
          return proficiency; // Return original if no match
        };

        setFormData({
          division_id: division_id,
          age_group: response.data.age_group || "",
          proficiency_level: normalizeProficiency(response.data.proficiency_level),
          gender: normalizeGender(response.data.gender),
          category: normalizeCategory(response.data.category)
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching division data:', error);
      setErrorMessage('Error loading division data');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    // No validation errors needed as all fields are optional
    return {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    setErrorMessage(""); // Clear any previous errors
    const accessToken = localStorage.getItem("accessToken");

    try {
      await axios.patch(`${link}/divisions`, formData, {
        headers: {
          accessToken: accessToken,
          'Content-Type': 'application/json'
        }
      });
      console.log('Division updated successfully');
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating division:', error);
      
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        
        // Check for duplicate key/constraint violation errors
        if (errorMsg.includes("duplicate") || 
            errorMsg.includes("already exists") || 
            errorMsg.includes("Duplicate entry") ||
            errorMsg.includes("UNIQUE constraint") ||
            errorMsg.includes("unique constraint")) {
          setErrorMessage("A division with these exact details already exists for this tournament. Please modify the age group, proficiency level, gender, or category to make it unique.");
        } else {
          setErrorMessage(errorMsg);
        }
      } else if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An unexpected error occurred while updating the division. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Division</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading division data...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label htmlFor="age_group">Age Group:</Form.Label>
            <Form.Control
              as="select"
              id="age_group"
              name="age_group"
              value={formData.age_group}
              onChange={handleInputChange}
              isInvalid={!!errors.age_group}
            >
              <option value="">Select age group</option>
              <option value="6-7">6-7 years</option>
              <option value="8-9">8-9 years</option>
              <option value="10-11">10-11 years</option>
              <option value="12-13">12-13 years</option>
              <option value="14-15">14-15 years</option>
              <option value="16-17">16-17 years</option>
              <option value="18-21">18-21 years</option>
              <option value="22-35">22-35 years</option>
              <option value="36-49">36-49 years</option>
              <option value="50+">50+ years</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.age_group}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="proficiency_level">Proficiency Level:</Form.Label>
            <Form.Control
              as="select"
              id="proficiency_level"
              name="proficiency_level"
              value={formData.proficiency_level}
              onChange={handleInputChange}
              isInvalid={!!errors.proficiency_level}
            >
              <option value="">Select proficiency level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.proficiency_level}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="gender">Gender:</Form.Label>
            <Form.Control
              as="select"
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              isInvalid={!!errors.gender}
            >
              <option value="" label="Select gender" />
              <option value="Male" label="Male" />
              <option value="Female" label="Female" />
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.gender}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="category">Category:</Form.Label>
            <Form.Control
              as="select"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              isInvalid={!!errors.category}
            >
              <option value="" label="Select category" />
              <option value="Kumite" label="Kumite" />
              <option value="Kata" label="Kata" />
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.category}
            </Form.Control.Feedback>
          </Form.Group>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DivisionModal;


