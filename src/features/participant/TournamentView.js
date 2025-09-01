import React, { useEffect, useState,useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Divisions.css'; // Assuming this holds card styling
import { link } from './constant';
import {AuthContext} from '../../context/AuthContext';

const TournamentView = () => {
  const [tournaments, setTournaments] = useState([]);
  const [error, setError] = useState('');
   const {setParentState, parentState} = useContext(AuthContext);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchTournaments = async () => {
       const token = localStorage.getItem("participantAccessToken");
      if(parentState.status === false && token){
      try {
        const response = await axios.get(`${link}/tournaments/OneParticipant`, {
          headers: {
            participantAccessToken: token,
          },
        });

        if (response.data.error) {
          setError(response.data.error);
        } else {
          setTournaments(response.data); // Expecting an array
        }
      } catch (err) {
        console.error("Error fetching tournament data:", err);
        setError('An error occurred while fetching tournaments.');
      }
    } else if(parentState.status){
      try {
        const parentToken = localStorage.getItem("parentToken");
        const response = await axios.get(`${link}/tournaments/parent`, {
          headers: {
            parentAccessToken: parentToken,
          },
        });

        if (response.data.error) {
          console.log("Error fetching tournaments for parent:", response.data.error);
          setError(response.data.error);
        } else {
          setTournaments(response.data); // Expecting an array
        }
      } catch (err) {
        console.error("Error fetching tournament data:", err);
        setError('An error occurred while fetching tournaments.');
      }
    }
    };


    fetchTournaments();
  }, [ parentState.status]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Tournaments</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {tournaments.length > 0 ? (
        <div className="row">
          {tournaments.map((tournament) => (
            <div className="col-md-6 mb-4" key={tournament.tournament_id}>
              <div className="card h-100">
                {tournament.imageUrl && (
                  <img
                    src={tournament.imageUrl}
                    className="card-img-top"
                    alt={tournament.tournament_name}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{tournament.tournament_name}</h5>
                  <p className="card-text">Start Date: {tournament.start_date}</p>
                  <p className="card-text">End Date: {tournament.end_date}</p>

                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/DivisionsView', { state: { tournamentId: tournament.tournament_id } })}
                  >
                    View Divisions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && <div className="text-muted">Loading tournaments...</div>
      )}
    </div>
  );
};

export default TournamentView;
