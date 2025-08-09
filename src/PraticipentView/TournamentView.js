import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Divisions.css'; // Assuming this holds card styling
import { link } from '../constant';

const TournamentView = () => {
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const token = localStorage.getItem("participantAccessToken");
        if (!token) {
          console.log("No participant token found.");
          navigate("/ParticipentVer");
          return;
        }

        const response = await axios.get(`${link}/tournaments/OneParticipant`, {
          headers: {
            participantAccessToken: token,
          },
        });

        if (response.data.error) {
          setError(response.data.error);
        } else {
          setTournament(response.data);
        }
      } catch (err) {
        console.error("Error fetching tournament data:", err);
        setError('An error occurred while fetching the tournament.');
      }
    };

    fetchTournament();
  }, [navigate]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Tournaments</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {tournament ? (
        <div className="row justify-content-center">
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              {tournament.imageUrl && (
                <img
                  src={tournament.imageUrl}
                  className="card-img-top"
                  alt={tournament.name}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{tournament.tournament_name}</h5>
                <p className="card-text">Start Date: {tournament.start_date}</p>
                <p className="card-text">End Date: {tournament.end_date}</p>

                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/DivisionsView')}
                >
                  View Divisions
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !error && <div className="text-muted">Loading tournament...</div>
      )}
    </div>
  );
};

export default TournamentView;
