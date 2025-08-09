import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { link } from './constant';

const CustomModal = ({ showModal, handleClose, accountId, tournament_id }) => {
  const [formData, setFormData] = useState({
    tournament_name: "",
    start_date: "",
    end_date: "",
    account_id: accountId,
    tournament_id: tournament_id
  });
  const [imageFile, setImageFile] = useState(null);

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
    const accessToken = localStorage.getItem("accessToken");
    const data = new FormData();

    data.append('tournament_name', formData.tournament_name);
    data.append('start_date', formData.start_date);
    data.append('end_date', formData.end_date);
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
      handleClose(); // Close the modal after successful update
      window.location.reload();
    } catch (error) {
      console.error('Error updating tournament:', error.response.data);
      // Handle error (e.g., display error message to user)
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Tournament</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div>
            <label htmlFor="tournament_name">Name:</label>
            <input
              type="text"
              id="tournament_name"
              name="tournament_name"
              value={formData.tournament_name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="start_date">Start Date:</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="end_date">End Date:</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="image">Image:</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
            />
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;