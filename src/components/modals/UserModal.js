import React, { useState } from 'react';
import { Button, Modal, Alert, Form } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { link } from './constant';

const UserModal = ({ user_id, showModal, handleClose }) => {
  const [formData, setFormData] = useState({
    user_id: user_id,
    email: "",
    username: ""
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

  const isValidEmail = (email) => {
    // Implement your email validation logic here
    return true; // Example: always return true for now
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    // You can add additional validation rules for email, e.g., regex validation

    // Only check for username if it's provided
    if (formData.username && !formData.username.trim()) {
      newErrors.username = "Username cannot be empty.";
    }
    return newErrors;
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
    const response=  await axios.patch(`${link}/users`, formData, {
        headers: {
          accessToken: accessToken,
        }
      });
      if(response.data.message){
      console.log('User data updated successfully');
      handleClose();
      window.location.reload();
      } else{
        alert(response.data.error);
        handleClose();
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error updating user');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Update User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label htmlFor="email">Email:</Form.Label>
            <Form.Control
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="username">Username:</Form.Label>
            <Form.Control
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              isInvalid={!!errors.username}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
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

export default UserModal;
