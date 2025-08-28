import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { link } from '../constant';
import '../Brackets/Brackets.css';
import '../Brackets/ModernBracket.css';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';


const ParticipentBracket = () => {
  const [bracketData, setBracketData] = useState([]);
    const navigate = useNavigate();
       const location = useLocation();
      const queryParams = new URLSearchParams(location.search);
      const division_id = queryParams.get('division_id');

  const generateBracket = async () => {

    try {
      const response = await axios.get(`${link}/brackets/participent`, {
        params: {
          division_id, // Pass the division_id as a query parameter
        },
      });

      let fetchedBrackets = response.data;
      if(fetchedBrackets.length === 0) {
       alert('No brackets created yet for the given division.');
        return;
      }
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

  const renderMatchCard = (bracket, roundNumber) => {
    const isWinner1 = bracket.winner === 'user1';
    const isWinner2 = bracket.winner === 'user2';
    const hasWinner = bracket.winner && bracket.winner !== null;
    const isComplete = hasWinner;
    const isBye = bracket.user1 === 'Bye' || bracket.user2 === 'Bye';

    return (
      <Card key={bracket.bracket_id} className="bracket-match-card card-modern mb-4">
        <Card.Header className="card-modern-header p-2">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <Badge bg="dark" className="fw-normal">
                <i className="fas fa-trophy me-1"></i>
                Round {roundNumber}
              </Badge>
              {isComplete && (
                <Badge bg="success" className="fw-normal">
                  <i className="fas fa-check me-1"></i>
                  Complete
                </Badge>
              )}
              {isBye && (
                <Badge bg="warning" text="dark" className="fw-normal">
                  <i className="fas fa-forward me-1"></i>
                  Bye
                </Badge>
              )}
            </div>
            <small className="text-muted">Match #{bracket.bracket_id}</small>
          </div>
        </Card.Header>
        
        <Card.Body className="card-modern-body p-3">
          <div className="match-participants">
            {/* Player 1 */}
            <div className={`participant ${isWinner1 ? 'winner' : ''} ${hasWinner && !isWinner1 ? 'loser' : ''} p-3 mb-2`}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i className={`fas ${bracket.user1 === 'Bye' ? 'fa-ban' : 'fa-user'} me-2 text-muted`}></i>
                  <span className="participant-name fw-medium">{bracket.user1}</span>
                  {isWinner1 && <i className="fas fa-crown ms-2 text-warning"></i>}
                </div>
                <Badge bg={isWinner1 ? 'success' : 'light'} text={isWinner1 ? 'white' : 'dark'} className="score-badge">
                  {bracket.score1}
                </Badge>
              </div>
            </div>

            <div className="vs-divider text-center my-2">
              <span className="vs-text text-muted fw-bold">VS</span>
            </div>

            {/* Player 2 */}
            <div className={`participant ${isWinner2 ? 'winner' : ''} ${hasWinner && !isWinner2 ? 'loser' : ''} p-3 mb-3`}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <i className={`fas ${bracket.user2 === 'Bye' ? 'fa-ban' : 'fa-user'} me-2 text-muted`}></i>
                  <span className="participant-name fw-medium">{bracket.user2}</span>
                  {isWinner2 && <i className="fas fa-crown ms-2 text-warning"></i>}
                </div>
                <Badge bg={isWinner2 ? 'success' : 'light'} text={isWinner2 ? 'white' : 'dark'} className="score-badge">
                  {bracket.score2}
                </Badge>
              </div>
            </div>
          </div>

          <div className="match-actions">
            <div className="d-grid">
              <Button
                variant="success"
                size="sm"
                className="btn-modern"
                onClick={() => navigate(`/viewer?bracket_id=${bracket.bracket_id}`)}
                disabled={isBye}
              >
                <i className="fas fa-eye me-2"></i>
                View Match
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const rounds = bracketData.reduce((acc, bracket) => {
    (acc[bracket.round] = acc[bracket.round] || []).push(bracket);
    return acc;
  }, {});

  return (
    <Container fluid className="tournament-bracket-container py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="page-header-modern text-center">
            <h1 className="page-title-modern">
              <i className="fas fa-users me-3"></i>
              Tournament Brackets
            </h1>
            <p className="page-subtitle-modern text-muted">
              View tournament matches and results
            </p>
          </div>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button 
              className="btn-modern" 
              onClick={generateBracket}
              size="lg"
            >
              <i className="fas fa-eye me-2"></i>
              Show Brackets
            </Button>
          </div>
        </Col>
      </Row>

      {/* Brackets Display */}
      {Object.keys(rounds).length > 0 ? (
        <Row>
          <Col>
            <div className="tournament-bracket-grid">
              {Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b)).map((roundNumber) => (
                <div key={roundNumber} className="tournament-round">
                  <div className="round-header text-center mb-4">
                    <h3 className="round-title">
                      <Badge bg="dark" className="p-3">
                        <i className="fas fa-layer-group me-2"></i>
                        Round {roundNumber}
                      </Badge>
                    </h3>
                    <p className="text-muted small mb-0">
                      {rounds[roundNumber].length} match{rounds[roundNumber].length !== 1 ? 'es' : ''}
                      {' • '}
                      {rounds[roundNumber].filter(b => b.winner && b.winner !== null).length} completed
                    </p>
                  </div>
                  
                  <div className="round-matches">
                    {rounds[roundNumber].map((bracket) => 
                      renderMatchCard(bracket, roundNumber)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col>
            <div className="empty-state text-center py-5">
              <div className="empty-state-icon mb-4">
                <i className="fas fa-trophy fa-4x text-muted"></i>
              </div>
              <h3 className="text-muted mb-3">No Brackets Available</h3>
              <p className="text-muted mb-4">
                Click 'Show Brackets' to view tournament matches and results.
              </p>
              <Button 
                className="btn-modern" 
                onClick={generateBracket}
              >
                <i className="fas fa-eye me-2"></i>
                Show Brackets
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ParticipentBracket;
