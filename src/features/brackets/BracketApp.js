import React, { useState, useEffect, useMemo } from 'react';
import { printBracket } from './BracketPrint';
import axios from 'axios';
import './Brackets.css';
import './ModernBracket.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { link } from './constant';
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
      const newBrackets = fetchedBrackets.map((bracket) => {
        // Compute winner from win_user1 and win_user2 fields
        let winner = null;
        if (bracket.win_user1 && !bracket.win_user2) {
          winner = 'user1';
        } else if (bracket.win_user2 && !bracket.win_user1) {
          winner = 'user2';
        }
        
        return {
          bracket_id: bracket.bracket_id,
          user1: bracket.user1 || 'Bye',
          user2: bracket.user2 || 'Bye',
          score1: bracket.points_user1 || 0,
          score2: bracket.points_user2 || 0,
          winner: winner,
          round: bracket.round,
          win_user1: bracket.win_user1,
          win_user2: bracket.win_user2,
          is_complete: bracket.is_complete,
          participant_id1: bracket.participant_id1,
          participant_id2: bracket.participant_id2
        };
      });

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
    // Get the tournament data
    const tournamentData = {
      rounds,
      stats: tournamentStats,
      bracketData,
      divisionId: division_id,
      lastRefresh
    };

    // Use the imported print function
    printBracket(tournamentData, division_id);
  };

  const generateTraditionalBracket = (rounds) => {
    if (!rounds || Object.keys(rounds).length === 0) {
      return '<div class="bracket-container"><div class="no-brackets">No brackets available</div></div>';
    }

    const sortedRounds = Object.keys(rounds).sort((a, b) => parseInt(a) - parseInt(b));
    const finalRound = sortedRounds[sortedRounds.length - 1];
    const champion = rounds[finalRound]?.[0]?.winner ? 
      (rounds[finalRound][0].winner === 'user1' ? rounds[finalRound][0].user1 : rounds[finalRound][0].user2) : 
      'TBD';

    // Build connection mapping based on participant IDs between consecutive rounds
    const connections = {};
    
    for (let i = 0; i < sortedRounds.length - 1; i++) {
      const currentRound = sortedRounds[i];
      const nextRound = sortedRounds[i + 1];
      
      const currentRoundMatches = rounds[currentRound] || [];
      const nextRoundMatches = rounds[nextRound] || [];
      
      // For each match in current round, find which next round match it connects to
      currentRoundMatches.forEach(currentMatch => {
        // Only create connection if current match has a winner
        if (!currentMatch.winner) return;
        
        // Find next round match that contains the winner's participant_id
        const winnerParticipantId = currentMatch.winner === 'user1' ? 
          currentMatch.participant_id1 : currentMatch.participant_id2;
          
        const targetMatch = nextRoundMatches.find(nextMatch => 
          nextMatch.participant_id1 === winnerParticipantId || 
          nextMatch.participant_id2 === winnerParticipantId
        );
        
        if (targetMatch) {
          connections[currentMatch.bracket_id] = {
            targetBracketId: targetMatch.bracket_id,
            targetRound: nextRound,
            winnerParticipantId: winnerParticipantId
          };
        }
      });
    }

    // Traditional bracket logic: 
    const leftRounds = [];
    const rightRounds = [];
    
    if (sortedRounds.length === 1) {
      // Single round - split matches between left and right sides
      const singleRound = sortedRounds[0];
      const allMatches = rounds[singleRound];
      const midPoint = Math.ceil(allMatches.length / 2);
      
      leftRounds.push({
        round: singleRound,
        matches: allMatches.slice(0, midPoint),
        side: 'left'
      });
      
      if (allMatches.length > midPoint) {
        rightRounds.push({
          round: singleRound,
          matches: allMatches.slice(midPoint),
          side: 'right'
        });
      }
    } else {
      // Multiple rounds - only process ROUND 1 for left/right split
      // Rounds 2+ will go in the center
      const firstRound = sortedRounds[0];
      const roundMatches = rounds[firstRound];
      const midPoint = Math.ceil(roundMatches.length / 2);
      
      // Left side gets first half of round 1 matches
      leftRounds.push({
        round: firstRound,
        matches: roundMatches.slice(0, midPoint),
        side: 'left'
      });
      
      // Right side gets second half of round 1 matches (if any)
      if (roundMatches.length > midPoint) {
        rightRounds.push({
          round: firstRound,
          matches: roundMatches.slice(midPoint),
          side: 'right'
        });
      }
    }

    const renderMatch = (bracket, isLeftSide = false, isRightSide = false, hasNextRound = false, matchIndex = 0) => {
      const isWinner1 = bracket.winner === 'user1';
      const isWinner2 = bracket.winner === 'user2';
      const hasWinner = bracket.winner && bracket.winner !== null;
      const isBye = bracket.user1 === 'Bye' || bracket.user2 === 'Bye';
      
      // Check if this match has a connection to next round
      const connection = connections[bracket.bracket_id];
      const shouldShowConnection = hasWinner && hasNextRound && connection;
      
      // Debug logging
      if (hasWinner && hasNextRound) {
        console.log(`Bracket ${bracket.bracket_id}: Winner=${bracket.winner}, Connection found=${!!connection}`);
        if (connection) {
          console.log(`  -> Connects to bracket ${connection.targetBracketId} (participant ${connection.winnerParticipantId})`);
        }
      }
      
      // Create simple CSS line for connection
      let connectionLine = '';
      if (shouldShowConnection) {
        connectionLine = `
          <div class="${isLeftSide ? 'line-horizontal-left' : 'line-horizontal-right'}" 
               data-target-bracket="${connection.targetBracketId}"
               style="display: block !important; visibility: visible !important;"></div>
        `;
      }
      
      return `
        <div class="match-bracket ${isBye ? 'bye-indicator' : ''}" 
             style="position: relative;" 
             data-bracket-id="${bracket.bracket_id}"
             data-round="${bracket.round}"
             data-match-index="${matchIndex}">
          <div class="participant-bracket ${isWinner1 ? 'winner' : ''} ${hasWinner && !isWinner1 ? 'loser' : ''}">
            <span class="participant-name">${bracket.user1}</span>
            <span class="participant-score">${bracket.score1}</span>
          </div>
          <div class="participant-bracket ${isWinner2 ? 'winner' : ''} ${hasWinner && !isWinner2 ? 'loser' : ''}">
            <span class="participant-name">${bracket.user2}</span>
            <span class="participant-score">${bracket.score2}</span>
          </div>
          ${connectionLine}
        </div>
      `;
    };

    const renderRoundColumn = (roundData) => {
      return `
        <div class="round-column">
          <div class="round-header-bracket">Round ${roundData.round}</div>
          ${roundData.matches.map(match => renderMatch(match)).join('')}
        </div>
      `;
    };

    // Group rounds by side and render them in order
    const renderSide = (roundsArray, side) => {
      // Group by round number
      const roundGroups = {};
      roundsArray.forEach(roundData => {
        if (!roundGroups[roundData.round]) {
          roundGroups[roundData.round] = [];
        }
        roundGroups[roundData.round].push(...roundData.matches);
      });

      // Sort rounds and render
      const sortedRoundNumbers = Object.keys(roundGroups).sort((a, b) => {
        return side === 'left' ? parseInt(a) - parseInt(b) : parseInt(b) - parseInt(a);
      });

      return sortedRoundNumbers.map(roundNumber => {
        const hasNextRound = parseInt(roundNumber) < parseInt(finalRound);
        const isLeftSide = side === 'left';
        const isRightSide = side === 'right';
        
        return `
          <div class="round-column" data-round="${roundNumber}" data-side="${side}">
            <div class="round-header-bracket">Round ${roundNumber}</div>
            ${roundGroups[roundNumber].map((match, index) => 
              renderMatch(match, isLeftSide, isRightSide, hasNextRound, index)
            ).join('')}
          </div>
        `;
      }).join('');
    };

    // Generate left side (rounds progress right to left toward center)
    const leftSideHTML = renderSide(leftRounds, 'left');
    
    // Generate right side (rounds progress left to right toward center)  
    const rightSideHTML = renderSide(rightRounds, 'right');

    // Generate center (latest/highest round and champion)
    const finalRoundMatches = rounds[finalRound] || [];
    
    // Generate center section with middle rounds (2, 3, etc.) displayed horizontally
    const middleRounds = sortedRounds.filter(round => parseInt(round) > 1);
    
    const centerHTML = middleRounds.length === 0 ? `
      <div class="bracket-center">
        <div class="champion-area">
          <div class="champion-title">🏆 TOURNAMENT</div>
          <div class="champion-name">Round ${finalRound} - ${finalRoundMatches.length} Match${finalRoundMatches.length !== 1 ? 'es' : ''}</div>
          <div style="font-size: 12px; margin-top: 10px; color: #666;">
            ${stats.totalMatches} Total Matches Across ${stats.totalRounds} Round${stats.totalRounds !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    ` : `
      <div class="bracket-center">
        ${middleRounds.map(roundNumber => {
          const roundMatches = rounds[roundNumber] || [];
          const isLastRound = parseInt(roundNumber) === parseInt(finalRound);
          const hasNextRound = !isLastRound; // Center rounds have next rounds except the final one
          return `
            <div class="round-column">
              <div class="round-header-bracket">Round ${roundNumber}${isLastRound && roundMatches.length === 1 ? ' - Final' : ''}</div>
              ${roundMatches.length > 0 ? 
                roundMatches.map((match, index) => renderMatch(match, false, false, hasNextRound, index)).join('') : 
                '<div class="match-bracket">No matches yet</div>'
              }
              
              ${isLastRound && roundMatches.length === 1 && champion !== 'TBD' ? `
                <div class="champion-area">
                  <div class="champion-title">🏆 CHAMPION</div>
                  <div class="champion-name">${champion}</div>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    return `
      <div class="bracket-container">
        <div class="bracket-side bracket-left">
          ${leftSideHTML}
        </div>
        
        ${centerHTML}
        
        <div class="bracket-side bracket-right">
          ${rightSideHTML}
        </div>
      </div>
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
