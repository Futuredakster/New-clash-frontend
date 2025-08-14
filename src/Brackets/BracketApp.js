import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './Brackets.css';
import './ModernBracket.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { link } from '../constant';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';

const TournamentBracket = () => {
  const [bracketData, setBracketData] = useState([]);
  const [bracketCount, setBracketCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const division_id = queryParams.get('division_id') || '';
  const navigate = useNavigate();

  // Refresh bracket data when component mounts or when coming back from other pages
  useEffect(() => {
    // Refresh when the window/tab gains focus (user comes back from PointTracker)
    const handleFocus = () => {
      if (division_id && bracketData.length > 0 && !loading) {
        console.log('Auto-refreshing brackets due to window focus');
        fetchBrackets(true); // Background refresh
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [division_id, bracketData.length, loading]);

  // Separate useEffect for interval-based refreshing
  useEffect(() => {
    let intervalId;
    
    // Auto-refresh every 30 seconds if there are active brackets
    if (division_id && bracketData.length > 0) {
      intervalId = setInterval(() => {
        if (!loading) {
          console.log('Auto-refreshing brackets (30s interval)');
          fetchBrackets(true); // Background refresh
        }
      }, 30000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [division_id, bracketData.length]);

  // Separate function to fetch brackets (without creating new ones)
  const fetchBrackets = async (isBackground = false) => {
    if (!division_id) {
      console.error('No division_id provided.');
      return;
    }

    // Prevent multiple simultaneous requests
    if (loading && !isBackground) {
      console.log('Already loading brackets, skipping request');
      return;
    }

    if (!isBackground) {
      setLoading(true);
    }

    try {
      const response = await axios.get(`${link}/brackets`, {
        params: { division_id },
      });

      let fetchedBrackets = response.data;
      console.log('Refreshed brackets:', fetchedBrackets.length, 'brackets found');

      // Sort the brackets by bracket_id
      fetchedBrackets = fetchedBrackets.sort((a, b) => a.bracket_id - b.bracket_id);

      // Structure the brackets into rounds and include the next round
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
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching brackets from backend:', error);
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  const generateBracket = async () => {
    if (!division_id) {
      console.error('No division_id provided.');
      return;
    }

    setLoading(true);
    try {
      // Call backend to create brackets
      const response = await axios.post(`${link}/brackets`, { division_id });
      console.log('Axios response:', response.data);
    } catch (error) {
      console.error('Error making Axios call:', error);
    }

    // Fetch the brackets (use the separate fetch function)
    await fetchBrackets();
    setLoading(false);
  };

  const clearBrackets = async () => {
    if (!division_id) {
      console.error('No division_id provided.');
      return;
    }
  
    setLoading(true);
    try {
      await axios.delete(`${link}/brackets`, {
        data: { division_id },
      });
      console.log('Brackets cleared successfully');
      setBracketData([]);
      setBracketCount(0);
    } catch (error) {
      console.error('Error clearing brackets:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBracket = async (bracket_id) => {
    setLoading(true);
    try {
      await axios.delete(`${link}/brackets/byOne`, {
        data: {bracket_id},
      });
      setBracketData((prevData) => prevData.filter(b => b.bracket_id !== bracket_id));
    } catch (error){
      console.error('error deleting bracket',error);
    } finally {
      setLoading(false);
    }
  }

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the tournament data
    const tournamentData = {
      rounds,
      stats: tournamentStats,
      bracketData,
      divisionId: division_id,
      lastRefresh
    };

    // Generate print-friendly HTML
    const printHTML = generatePrintHTML(tournamentData);
    
    // Write the HTML to the new window
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const generatePrintHTML = (data) => {
    const { rounds, stats, lastRefresh } = data;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tournament Bracket - Division ${division_id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              background: white;
              color: #333;
              line-height: 1.4;
              font-size: 12px;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            
            .print-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            
            .print-subtitle {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
            }
            
            .print-stats {
              display: flex;
              justify-content: center;
              gap: 40px;
              margin-bottom: 10px;
            }
            
            .stat-item {
              text-align: center;
            }
            
            .stat-number {
              font-size: 18px;
              font-weight: bold;
              color: #333;
            }
            
            .stat-label {
              font-size: 11px;
              color: #666;
            }
            
            .rounds-container {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 30px;
              margin-top: 20px;
            }
            
            .round-section {
              break-inside: avoid;
              margin-bottom: 30px;
            }
            
            .round-header {
              text-align: center;
              margin-bottom: 15px;
              padding: 8px;
              background: #f5f5f5;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            
            .round-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            
            .round-info {
              font-size: 10px;
              color: #666;
            }
            
            .match-card {
              border: 1px solid #ddd;
              border-radius: 4px;
              margin-bottom: 15px;
              background: white;
              break-inside: avoid;
            }
            
            .match-header {
              background: #f8f9fa;
              padding: 8px 12px;
              border-bottom: 1px solid #ddd;
              font-size: 11px;
              font-weight: bold;
            }
            
            .match-body {
              padding: 12px;
            }
            
            .participant {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px;
              margin-bottom: 4px;
              border: 1px solid #eee;
              border-radius: 3px;
              background: #fafafa;
            }
            
            .participant.winner {
              background: #d4edda;
              border-color: #c3e6cb;
              font-weight: bold;
            }
            
            .participant.loser {
              background: #f8d7da;
              border-color: #f5c6cb;
              opacity: 0.7;
            }
            
            .participant-name {
              font-size: 12px;
            }
            
            .participant-score {
              font-size: 12px;
              font-weight: bold;
              min-width: 30px;
              text-align: center;
              padding: 2px 6px;
              background: white;
              border: 1px solid #ddd;
              border-radius: 2px;
            }
            
            .participant.winner .participant-score {
              background: #28a745;
              color: white;
              border-color: #28a745;
            }
            
            .vs-divider {
              text-align: center;
              margin: 4px 0;
              font-size: 10px;
              color: #666;
              font-weight: bold;
            }
            
            .bye-match {
              font-style: italic;
              color: #666;
            }
            
            .print-footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            
            @media print {
              .rounds-container {
                grid-template-columns: repeat(2, 1fr);
              }
              
              .round-section {
                page-break-inside: avoid;
              }
              
              .match-card {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="print-title">🏆 Tournament Bracket</div>
            <div class="print-subtitle">Division ${division_id}</div>
            <div class="print-stats">
              <div class="stat-item">
                <div class="stat-number">${stats.totalRounds}</div>
                <div class="stat-label">Total Rounds</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">${stats.totalMatches}</div>
                <div class="stat-label">Total Matches</div>
              </div>
            </div>
            ${lastRefresh ? `<div style="font-size: 10px; color: #666; margin-top: 10px;">Printed: ${lastRefresh.toLocaleString()}</div>` : ''}
          </div>
          
          <div class="rounds-container">
            ${Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b)).map(roundNumber => `
              <div class="round-section">
                <div class="round-header">
                  <div class="round-title">Round ${roundNumber}</div>
                  <div class="round-info">
                    ${rounds[roundNumber].length} match${rounds[roundNumber].length !== 1 ? 'es' : ''} • 
                    ${rounds[roundNumber].filter(b => b.winner && b.winner !== null).length} completed
                  </div>
                </div>
                
                <div class="round-matches">
                  ${rounds[roundNumber].map(bracket => {
                    const isWinner1 = bracket.winner === 'user1';
                    const isWinner2 = bracket.winner === 'user2';
                    const hasWinner = bracket.winner && bracket.winner !== null;
                    const isBye = bracket.user1 === 'Bye' || bracket.user2 === 'Bye';
                    
                    return `
                      <div class="match-card ${isBye ? 'bye-match' : ''}">
                        <div class="match-header">
                          Match #${bracket.bracket_id}
                          ${hasWinner ? ' • Complete' : ''}
                          ${isBye ? ' • Bye' : ''}
                        </div>
                        <div class="match-body">
                          <div class="participant ${isWinner1 ? 'winner' : ''} ${hasWinner && !isWinner1 ? 'loser' : ''}">
                            <span class="participant-name">${bracket.user1}</span>
                            <span class="participant-score">${bracket.score1}</span>
                          </div>
                          <div class="vs-divider">VS</div>
                          <div class="participant ${isWinner2 ? 'winner' : ''} ${hasWinner && !isWinner2 ? 'loser' : ''}">
                            <span class="participant-name">${bracket.user2}</span>
                            <span class="participant-score">${bracket.score2}</span>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="print-footer">
            Generated by Tournament Management System
          </div>
        </body>
      </html>
    `;
  };

  const rounds = bracketData.reduce((acc, bracket) => {
    (acc[bracket.round] = acc[bracket.round] || []).push(bracket);
    return acc;
  }, {});

  // Calculate tournament statistics - useMemo to optimize recalculation
  const tournamentStats = useMemo(() => {
    const totalMatches = bracketData.length;
    const totalRounds = Object.keys(rounds).length;
    
    const newStats = {
      totalMatches,
      totalRounds
    };
    
    // Log significant changes
    if (totalMatches > 0) {
      console.log('Tournament stats:', newStats);
    }
    
    return newStats;
  }, [bracketData, rounds]);

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
            <div className={`participant ${isWinner1 ? 'winner' : ''} ${hasWinner && !isWinner1 ? 'loser' : ''} mb-2`}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center flex-grow-1 me-2">
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
            <div className={`participant ${isWinner2 ? 'winner' : ''} ${hasWinner && !isWinner2 ? 'loser' : ''} mb-3`}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center flex-grow-1 me-2">
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
                variant="primary"
                size="sm"
                className="btn-modern mb-2"
                onClick={() => navigate(`/PointTracker?bracket_id=${bracket.bracket_id}`)}
                disabled={isBye}
              >
                <i className="fas fa-edit me-1"></i>
                <span className="button-text">{isComplete ? 'Update Score' : 'Manage Score'}</span>
              </Button>
              
              <div className="d-flex">
                <Button
                  variant="success"
                  size="sm"
                  className="btn-modern me-1 flex-fill"
                  onClick={() => navigate(`/stream?bracket_id=${bracket.bracket_id}`)}
                  disabled={isBye}
                >
                  <i className="fas fa-video me-1"></i>
                  <span className="button-text">Stream</span>
                </Button>
                
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="btn-modern-outline"
                  onClick={() => deleteBracket(bracket.bracket_id)}
                  disabled={loading}
                  title="Delete Match"
                >
                  <i className="fas fa-trash"></i>
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid className="tournament-bracket-container py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="page-header-modern text-center">
            <h1 className="page-title-modern">
              <i className="fas fa-trophy me-3"></i>
              Tournament Bracket
            </h1>
            <p className="page-subtitle-modern text-muted">
              Manage and view tournament matches
              {lastRefresh && (
                <small className="d-block mt-2 text-muted">
                  <i className="fas fa-clock me-1"></i>
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </small>
              )}
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
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-eye me-2"></i>
                  Show Brackets
                </>
              )}
            </Button>
            
            <Button 
              className="btn-modern-outline" 
              onClick={() => fetchBrackets(false)}
              disabled={loading}
              size="lg"
            >
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </Button>

            {Object.keys(rounds).length > 0 && (
              <Button 
                className="btn-modern-outline" 
                onClick={handlePrint}
                disabled={loading}
                size="lg"
                variant="info"
              >
                <i className="fas fa-print me-2"></i>
                Print Bracket
              </Button>
            )}
            
            <Button 
              className="btn-modern-outline" 
              onClick={clearBrackets}
              disabled={loading}
              size="lg"
            >
              <i className="fas fa-trash-alt me-2"></i>
              Clear All
            </Button>

            <Button 
              className="btn-modern-outline" 
              onClick={() => navigate(-1)}
              size="lg"
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </Button>
          </div>
        </Col>
      </Row>

      {/* Brackets Display */}
      {Object.keys(rounds).length > 0 ? (
        <>
          {/* Tournament Progress Summary */}
          <Row className="mb-4">
            <Col>
              <Card className="card-modern">
                <Card.Body className="card-modern-body">
                  <Row className="text-center">
                    <Col md={6} sm={6} className="mb-3 mb-md-0">
                      <div className="stat-item">
                        <h4 className="stat-number text-primary mb-1">{tournamentStats.totalRounds}</h4>
                        <p className="stat-label text-muted mb-0">
                          <i className="fas fa-layer-group me-1"></i>
                          Total Rounds
                        </p>
                      </div>
                    </Col>
                    <Col md={6} sm={6} className="mb-3 mb-md-0">
                      <div className="stat-item">
                        <h4 className="stat-number text-info mb-1">{tournamentStats.totalMatches}</h4>
                        <p className="stat-label text-muted mb-0">
                          <i className="fas fa-fist-raised me-1"></i>
                          Total Matches
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tournament Rounds */}
          <Row>
            <Col>
              <div className={`tournament-bracket-grid rounds-${Object.keys(rounds).length >= 5 ? '5-plus' : Object.keys(rounds).length}`}>
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
        </>
      ) : (
        <Row>
          <Col>
            <div className="empty-state text-center py-5">
              <div className="empty-state-icon mb-4">
                <i className="fas fa-trophy fa-4x text-muted"></i>
              </div>
              <h3 className="text-muted mb-3">No Brackets Available</h3>
              <p className="text-muted mb-4">
                Click 'Show Brackets' to load tournament matches, or create new brackets for this division.
              </p>
              <Button 
                className="btn-modern" 
                onClick={generateBracket}
                disabled={loading}
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

export default TournamentBracket;
