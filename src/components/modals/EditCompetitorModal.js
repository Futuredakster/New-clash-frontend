import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { link } from '../../constant';

const EditCompetitorModal = ({ show, onHide, competitor, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date_of_birth: '',
    belt_color: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const beltColors = [
    'White', 'Yellow', 'Orange', 'Green', 'Purple', 'Brown', 'Black'
  ];

  // Initialize form data when competitor changes
  useEffect(() => {
    if (competitor) {
      setFormData({
        name: competitor.name || '',
        email: competitor.email || '',
        date_of_birth: competitor.date_of_birth || '',
        belt_color: competitor.belt_color || ''
      });
    }
  }, [competitor]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Only send fields that have values (all optional)
      const updateData = {};
      if (formData.name.trim()) updateData.name = formData.name.trim();
      if (formData.email.trim()) updateData.email = formData.email.trim();
      if (formData.date_of_birth) updateData.date_of_birth = formData.date_of_birth;
      if (formData.belt_color) updateData.belt_color = formData.belt_color;

      const response = await axios.put(`${link}/participants/${competitor.participant_id}`, updateData, {
        headers: {
          'accessToken': token
        }
      });

      // Call onUpdate callback to refresh the data
      if (onUpdate) {
        onUpdate();
      }

      onHide();
      alert('Competitor updated successfully!');
      
    } catch (error) {
      console.error('Error updating competitor:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update competitor';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-edit me-2"></i>
          Edit Competitor
        </Modal.Title>
      </Modal.Header>
      
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="form-label-modern">
              <i className="fas fa-user me-2"></i>
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="form-control-modern"
              placeholder="Enter competitor's name (optional)"
            />
          </div>

          <div className="mb-3">
            <label className="form-label-modern">
              <i className="fas fa-envelope me-2"></i>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-control-modern"
              placeholder="Enter email address (optional)"
            />
          </div>

          <div className="mb-3">
            <label className="form-label-modern">
              <i className="fas fa-calendar-alt me-2"></i>
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className="form-control-modern"
            />
          </div>

          <div className="mb-3">
            <label className="form-label-modern">
              <i className="fas fa-medal me-2"></i>
              Belt Color
            </label>
            <select
              value={formData.belt_color}
              onChange={(e) => handleInputChange('belt_color', e.target.value)}
              className="form-control-modern"
            >
              <option value="">Select belt color (optional)</option>
              {beltColors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="text-muted small">
            <i className="fas fa-info-circle me-2"></i>
            All fields are optional. Only the fields you fill out will be updated.
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button 
            variant="outline-secondary" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={loading}
            className="btn-modern"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Update Competitor
              </>
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default EditCompetitorModal;