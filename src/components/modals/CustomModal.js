import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { link } from './constant';

const CustomModal = ({ showModal, handleClose, accountId, tournament_id }) => {
  const [formData, setFormData] = useState({
    tournament_name: "",
    start_date: "",
    end_date: "",
    signup_duedate: "",
    account_id: accountId,
    tournament_id: tournament_id
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch existing tournament data when modal opens
  useEffect(() => {
    if (showModal && tournament_id) {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      fetchTournamentData();
    }
  }, [showModal, tournament_id]);

  // Reset form when modal closes
  useEffect(() => {
    if (!showModal) {
      setFormData({
        tournament_name: "",
        start_date: "",
        end_date: "",
        signup_duedate: "",
        account_id: accountId,
        tournament_id: tournament_id
      });
      setImageFile(null);
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [showModal, accountId, tournament_id]);

  const fetchTournamentData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(`${link}/tournaments/default`, {
        headers: { accessToken: accessToken },
        params: { tournament_id: tournament_id }
      });
      
      if (response.data) {
        // Format dates for input fields (backend likely returns YYYY-MM-DD format)
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
        };

        setFormData({
          tournament_name: response.data.tournament_name || "",
          start_date: formatDateForInput(response.data.start_date),
          end_date: formatDateForInput(response.data.end_date),
          signup_duedate: formatDateForInput(response.data.signup_duedate),
          account_id: accountId,
          tournament_id: tournament_id
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tournament data:', error);
      setErrorMessage('Error loading tournament data');
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

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    const accessToken = localStorage.getItem("accessToken");
    const data = new FormData();

    data.append('tournament_name', formData.tournament_name);
    data.append('start_date', formData.start_date);
    data.append('end_date', formData.end_date);
    data.append('signup_duedate', formData.signup_duedate);
    data.append('account_id', formData.account_id);
    data.append('tournament_id', formData.tournament_id);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await axios.patch(`${link}/tournaments`, data, {
        headers: {
          accessToken: accessToken,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Tournament data updated successfully');
      setSuccessMessage('Tournament updated successfully!');
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error updating tournament:', error.response?.data);
      setErrorMessage(error.response?.data?.message || 'Error updating tournament');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false} className="modal-modern">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-edit me-2"></i>
          Edit Tournament
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading tournament data...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit} encType="multipart/form-data" className="form-modern">
          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="tournament_name" className="form-label-modern">
              Tournament Name
            </Form.Label>
            <Form.Control
              type="text"
              id="tournament_name"
              name="tournament_name"
              value={formData.tournament_name}
              onChange={handleInputChange}
              className="form-control-modern"
              placeholder="Enter tournament name"
            />
          </Form.Group>

          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="start_date" className="form-label-modern">
              Start Date
            </Form.Label>
            <Form.Control
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              className="form-control-modern"
            />
          </Form.Group>

          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="end_date" className="form-label-modern">
              End Date
            </Form.Label>
            <Form.Control
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="form-control-modern"
            />
          </Form.Group>

          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="signup_duedate" className="form-label-modern">
              <i className="fas fa-clock me-2"></i>
              Signup Due Date
            </Form.Label>
            <Form.Control
              type="date"
              id="signup_duedate"
              name="signup_duedate"
              value={formData.signup_duedate}
              onChange={handleInputChange}
              className="form-control-modern"
            />
            <Form.Text className="text-muted">
              Last date for participants to register
            </Form.Text>
          </Form.Group>

          <Form.Group className="form-group-modern">
            <Form.Label htmlFor="image" className="form-label-modern">
              Tournament Image
            </Form.Label>
            <Form.Control
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              className="form-control-modern"
              accept="image/*"
            />
            <Form.Text className="text-muted">
              Upload a new image to replace the current tournament image (optional)
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button 
              type="submit" 
              className="btn-modern me-2" 
              disabled={isSubmitting}
            >
              <i className="fas fa-save me-2"></i>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={handleClose} 
          className="btn-modern-outline"
          disabled={isSubmitting}
        >
          <i className="fas fa-times me-2"></i>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;