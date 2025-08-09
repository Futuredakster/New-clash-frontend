import React, { useState } from 'react';
import axios from 'axios';
import './Brackets.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { link } from '../constant';

const TournamentBracket = () => {
  const [bracketData, setBracketData] = useState([]);
  const [bracketCount, setBracketCount] = useState(0);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const division_id = queryParams.get('division_id') || '';
  const navigate = useNavigate();

  const generateBracket = async () => {
    if (!division_id) {
      console.error('No division_id provided.');
      return;
    }

    try {
      // Call backend to create brackets
      const response = await axios.post(`${link}/brackets`, { division_id });
      console.log('Axios response:', response.data);
    } catch (error) {
      console.error('Error making Axios call:', error);
    }

    console.log("Trying TO FETCH NOW!");
    try {
      // Fetch the created brackets from the backend
      const response = await axios.get(`${link}/brackets`, {
        params: { division_id },
      });

      let fetchedBrackets = response.data;
      console.log('Fetched brackets:', fetchedBrackets);

      // Sort the brackets by bracket_id
      fetchedBrackets = fetchedBrackets.sort((a, b) => a.bracket_id - b.bracket_id);

      // Structure the brackets into rounds and include the next round
      const newBrackets = fetchedBrackets.map((bracket, idx) => ({
        bracket_id: bracket.bracket_id,
        user1: bracket.user1 || 'Bye',
        user2: bracket.user2 || 'Bye',
        score1: bracket.points_user1 || 0,
        score2: bracket.points_user2 || 0,
        winner: bracket.winner,
        round: bracket.round, // Use the round from backend directly
      }));

      setBracketData(newBrackets);
      setBracketCount((prevCount) => prevCount + 1);
    } catch (error) {
      console.error('Error fetching brackets from backend:', error);
    }
  };

  const clearBrackets = async () => {
    if (!division_id) {
      console.error('No division_id provided.');
      return;
    }
  
    try {
      await axios.delete(`${link}/brackets`, {
        data: { division_id },
      });
      console.log('Brackets cleared successfully');
      setBracketData([]);
      setBracketCount(0);
    } catch (error) {
      console.error('Error clearing brackets:', error);
    }
  };

  const deleteBracket = async (bracket_id) => {
    try {
      await axios.delete(`${link}/brackets/byOne`, {
        data: {bracket_id},
      });
      setBracketData((prevData) => prevData.filter(b => b.bracket_id !== bracket_id));
    } catch (error){
      console.error('error deleting bracket',error);
    }
  }

  const rounds = bracketData.reduce((acc, bracket) => {
    (acc[bracket.round] = acc[bracket.round] || []).push(bracket);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-center mb-3">
        <button className="btn btn-primary mx-2" onClick={generateBracket}>Show Brackets</button>
        <button className="btn btn-danger mx-2" onClick={clearBrackets}>Clear Brackets</button>
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
                        onClick={() => navigate(`/PointTracker?bracket_id=${bracket.bracket_id}`)}
                      >
                        Select 🎯
                      </button>
                      <button
                        className="btn btn-success mt-2"
                        onClick={() => deleteBracket(bracket.bracket_id)}
                      >
                        delete 🎯
                      </button>
                      <button 
                      className='btn btn-success mt-2'
                      onClick={() => navigate(`/stream?bracket_id=${bracket.bracket_id}`)}
                      >
                         Start Streaming
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

export default TournamentBracket;
