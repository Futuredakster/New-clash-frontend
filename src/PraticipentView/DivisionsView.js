import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Divisions.css';
import { link } from '../constant';
import { useLocation } from "react-router-dom";

const DivisionsView = () => {
  const [divisions, setDivisions] = useState([]);
  const [time, setTime] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();
   const location = useLocation();
  const { tournamentId } = location.state || {};

  useEffect(() => {
    const fetchDivisions = async () => {
      const token = localStorage.getItem('participantAccessToken');
      if (!token) {
        setError('No access token found.');
        return;
      }

      try {
        const response = await axios.get(`${link}/Divisions/partview`, {
          headers: {
            participantAccessToken: token,
          },
          params: {
            tournamentId,
          },
        });
        setDivisions(response.data.divisions);
        setTime(response.data.total_time); // total_time is a number
      } catch (err) {
        console.error('Error fetching division data:', err);
        setError('Failed to load divisions. Please try again.');
      }
    };

    fetchDivisions();
  }, []);

  const handleViewParticipants = (division_id) => {
    navigate(`/ParticipentsView?division_id=${division_id}`);
  };
  const handleViewBrackets = (division_id) => {
    navigate(`/ParticipentBracket?division_id=${division_id}`);
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Your Divisions</h1>
        <p>These are the divisions you’re registered in.</p>
      </div>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      <div className="dashboard-container">
        {divisions.map((division, index) => (
          <div className="card" key={division.division_id || index}>
            <div className="card-content">
              <p><strong>Gender:</strong> {division.gender || 'N/A'}</p>
              <p><strong>Age Group:</strong> {division.age_group}</p>
              <p><strong>Proficiency Level:</strong> {division.proficiency_level}</p>
              <p><strong>Category:</strong> {division.category}</p>
            </div>
               <div className="time-display" style={{ marginTop: '20px' }}>
        <h2>Total Time: {(time / 60).toFixed(2)} minutes</h2>
      </div>

      <div className="buttons">
        <button
        className="btn btn-primary"
        onClick={() => handleViewParticipants(division.division_id)}
      >
        View All Participants
      </button>

        <button className="btn btn-primary" onClick={() =>handleViewBrackets(division.division_id)}>
          View All Brackets
        </button>
      </div>
          </div>
        ))}
      </div>

   
    </div>
  );
};

export default DivisionsView;
