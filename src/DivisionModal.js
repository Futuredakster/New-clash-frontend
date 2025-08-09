import React, { useState } from 'react';
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
    const accessToken = localStorage.getItem("accessToken");

    try {
      await axios.patch(`${link}/divisions`, formData, {
        headers: {
          accessToken: accessToken,
          'Content-Type': 'application/json'
        }
      });
      console.log('Division data created successfully');
      handleClose();
      window.location.reload();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error creating division');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Create Division</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label htmlFor="age_group">Age Group:</Form.Label>
            <Form.Control
              type="text"
              id="age_group"
              name="age_group"
              value={formData.age_group}
              onChange={handleInputChange}
              isInvalid={!!errors.age_group}
            />
            <Form.Control.Feedback type="invalid">
              {errors.age_group}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="proficiency_level">Proficiency Level:</Form.Label>
            <Form.Control
              type="text"
              id="proficiency_level"
              name="proficiency_level"
              value={formData.proficiency_level}
              onChange={handleInputChange}
              isInvalid={!!errors.proficiency_level}
            />
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


