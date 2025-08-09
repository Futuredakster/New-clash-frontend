import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { link } from '../constant';


const ParticipentBracket = () => {
  const [bracketData, setBracketData] = useState([]);
    const navigate = useNavigate();

  const generateBracket = async () => {
    const token = localStorage.getItem('participantAccessToken');
    if (!token) {
      console.error('No token found in localStorage.');
      return;
    }

    try {
      const response = await axios.get(`${link}/brackets/participent`, {
        headers: {
            participantAccessToken: token,
        },
      });

      let fetchedBrackets = response.data;
      console.log('Fetched brackets:', fetchedBrackets);

      // Sort and map the brackets
      fetchedBrackets = fetchedBrackets.sort((a, b) => a.bracket_id - b.bracket_id);

      const newBrackets = fetchedBrackets.map((bracket) => ({
        bracket_id: bracket.bracket_id,
        user1: bracket.user1 || 'Bye',
        user2: bracket.user2 || 'Bye',
        score1: bracket.points_user1 || 0,
        score2: bracket.points_user2 || 0,
        winner: bracket.winner,
        round: bracket.round,
      }));

      setBracketData(newBrackets);
    } catch (error) {
      console.error('Error fetching brackets:', error);
    }
  };

  const rounds = bracketData.reduce((acc, bracket) => {
    (acc[bracket.round] = acc[bracket.round] || []).push(bracket);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-center mb-3">
        <button className="btn btn-primary" onClick={generateBracket}>Show Brackets</button>
      </div>

      {Object.keys(rounds).length > 0 ? (
        <div className="bracket-container">
          {Object.keys(rounds).sort().map((roundNumber) => (
            <div key={roundNumber} className="bracket-column">
              <h5 className="text-center mb-2">Round {roundNumber}</h5>
              {rounds[roundNumber].map((bracket, idx) => (
                <div key={idx} style={{ minHeight: '130px' }}>
                  <div className="card shadow-sm bracket-card">
                    <div className="card-body p-2">
                      <div className={`py-2 ${bracket.winner === 'user1' ? 'bg-success text-white' : ''}`}>
                        {bracket.user1} <span className="badge bg-light text-dark ms-1">{bracket.score1}</span>
                      </div>
                      <hr className="my-1" />
                      <div className={`py-2 ${bracket.winner === 'user2' ? 'bg-success text-white' : ''}`}>
                        {bracket.user2} <span className="badge bg-light text-dark ms-1">{bracket.score2}</span>
                      </div>
                      <button
                        className="btn btn-success mt-2"
                        onClick={() => navigate(`/viewer?bracket_id=${bracket.bracket_id}`)}
                      >
                        viewer 🎯
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p>No brackets to display. Click 'Show Brackets' to fetch data.</p>
        </div>
      )}
    </div>
  );
};

export default ParticipentBracket;
