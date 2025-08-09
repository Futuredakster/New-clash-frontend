import React, { useState } from 'react';
import { Button, Modal, Alert, Form } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { link } from './constant';

const AccountModal = ({account_id, showModal, handleClose }) => {
  const [formData, setFormData] = useState({
    account_name: "",
    account_type: "",
    account_description: "",
    account_id:account_id
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const accessToken = localStorage.getItem("accessToken");

    try {
      await axios.patch(`${link}/accounts`, formData, {
        headers: {
          accessToken: accessToken,
        }
      });
      console.log('Account data updated successfully');
      handleClose();
      window.location.reload();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error updating account');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Update Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label htmlFor="account_name">Account Name:</Form.Label>
            <Form.Control
              type="text"
              id="account_name"
              name="account_name"
              value={formData.account_name}
              onChange={handleInputChange}
              isInvalid={!!errors.account_name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.account_name}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="account_type">Account Type:</Form.Label>
            <Form.Control
              type="text"
              id="account_type"
              name="account_type"
              value={formData.account_type}
              onChange={handleInputChange}
              isInvalid={!!errors.account_type}
            />
            <Form.Control.Feedback type="invalid">
              {errors.account_type}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="account_description">Account Description:</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              id="account_description"
              name="account_description"
              value={formData.account_description}
              onChange={handleInputChange}
            />
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

export default AccountModal;
