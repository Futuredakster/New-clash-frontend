import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import '../brackets/Brackets.css';
import '../brackets/ModernBracket.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { link } from './constant';
import { Container, Row, Col, Button, Card, Badge, Modal } from 'react-bootstrap';

const ViewerBrackets = () => {
  const [bracketData, setBracketData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const division_id = queryParams.get('division_id') || '';
  const navigate = useNavigate();

  // Auto-load brackets when component mounts
  useEffect(() => {
    if (division_id) {
      fetchBrackets(false);
    }
  }, [division_id]);

  // Separate function to fetch brackets (without creating new ones)
  const fetchBrackets = async (isBackground = false) => {
    if (!division_id) {
      return;
    }

    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${link}/brackets`, {
        params: { division_id },
      });

      let fetchedBrackets = response.data;

      // Remove any potential duplicates based on bracket_id
      const uniqueBrackets = fetchedBrackets.filter((bracket, index, array) => 
        array.findIndex(b => b.bracket_id === bracket.bracket_id) === index
      );

      // Sort the brackets by bracket_id
      uniqueBrackets.sort((a, b) => a.bracket_id - b.bracket_id);

      // Structure the brackets into rounds and include the next round
      const newBrackets = uniqueBrackets.map((bracket) => {
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
      // Handle error silently or show user-friendly message
    } finally {
      setLoading(false);
    }
  };

  const rounds = bracketData.reduce((acc, bracket) => {
    (acc[bracket.round] = acc[bracket.round] || []).push(bracket);
    return acc;
  }, {});

  // Calculate complete tournament structure with placeholders
  const completeStructure = useMemo(() => {
    if (bracketData.length === 0) return { rounds: {}, totalRounds: 0 };
    
    // Calculate total participants from Round 1
    const round1Matches = rounds['1'] || [];
    // Count actual participants (accounting for byes)
    let totalParticipants = 0;
    round1Matches.forEach(match => {
      if (match.user1 !== 'Bi' && match.user1 !== 'Bye') totalParticipants++;
      if (match.user2 !== 'Bi' && match.user2 !== 'Bye') totalParticipants++;
    });
    
    console.log(`Round 1 matches: ${round1Matches.length}, Total participants: ${totalParticipants}`);
    
    // Calculate expected tournament structure
    const calculateTournamentRounds = (participants) => {
      const structure = {};
      let currentParticipants = participants;
      let roundNumber = 1;
      
      console.log(`Calculating tournament structure for ${participants} participants:`);
      
      while (currentParticipants > 1) {
        const matchesInRound = Math.floor(currentParticipants / 2);
        structure[roundNumber] = matchesInRound;
        console.log(`Round ${roundNumber}: ${matchesInRound} matches, ${currentParticipants} participants`);
        
        // In elimination tournaments, winners advance to next round
        // Winners from matches + any bye (if odd number of participants)
        currentParticipants = matchesInRound + (currentParticipants % 2);
        console.log(`Next round will have ${currentParticipants} participants`);
        roundNumber++;
      }
      
      console.log('Expected structure:', structure);
      return structure;
    };
    
    const expectedStructure = calculateTournamentRounds(totalParticipants);
    const completeRounds = {};
    
    // Fill in actual matches and create placeholders for future rounds
    Object.keys(expectedStructure).forEach(roundNumber => {
      const expectedMatches = expectedStructure[roundNumber];
      const actualMatches = rounds[roundNumber] || [];
      
      console.log(`Round ${roundNumber}: Expected ${expectedMatches}, Actual ${actualMatches.length}`);
      console.log(`Actual matches:`, actualMatches.map(m => `${m.bracket_id}(${m.user1} vs ${m.user2})`));
      
      completeRounds[roundNumber] = [];
      
      // Add actual matches
      actualMatches.forEach(match => {
        completeRounds[roundNumber].push({
          ...match,
          isPlaceholder: false
        });
      });
      
      // Add placeholder matches for missing spots
      for (let i = actualMatches.length; i < expectedMatches; i++) {
        console.log(`Adding placeholder for Round ${roundNumber}, Match ${i}`);
        completeRounds[roundNumber].push({
          bracket_id: `placeholder_r${roundNumber}_m${i}`,
          user1: 'TBD',
          user2: 'TBD',
          participant_id1: null,
          participant_id2: null,
          winner: null,
          round: parseInt(roundNumber),
          score1: 0,
          score2: 0,
          is_complete: false,
          isPlaceholder: true
        });
      }
    });
    
    return {
      rounds: completeRounds,
      totalRounds: Object.keys(expectedStructure).length
    };
  }, [bracketData, rounds]);

  // Calculate tournament statistics using complete structure - useMemo to optimize recalculation
  const tournamentStats = useMemo(() => {
    const actualMatches = bracketData.length;
    const actualRounds = Object.keys(rounds).length;
    const totalExpectedMatches = Object.values(completeStructure.rounds).reduce((sum, matches) => sum + matches.length, 0);
    const totalExpectedRounds = completeStructure.totalRounds;
    
    return {
      totalMatches: actualMatches,
      totalRounds: actualRounds,
      expectedMatches: totalExpectedMatches,
      expectedRounds: totalExpectedRounds,
      completionPercentage: totalExpectedMatches > 0 ? Math.round((actualMatches / totalExpectedMatches) * 100) : 0
    };
  }, [bracketData, rounds, completeStructure]);

  // Calculate node positions for bracket visualization using complete structure
  const nodePositions = useMemo(() => {
    const positions = new Map();
    const roundKeys = Object.keys(completeStructure.rounds).sort((a, b) => parseInt(a) - parseInt(b));
    const maxRounds = roundKeys.length;
    const containerWidth = 1200;
    const containerHeight = 800;
    const padding = 80; // Add padding from top and bottom
    
    roundKeys.forEach((roundNumber, roundIndex) => {
      const matches = completeStructure.rounds[roundNumber];
      const roundX = (roundIndex + 1) * (containerWidth / (maxRounds + 1));
      const totalMatches = matches.length;
      const availableHeight = containerHeight - (padding * 2);
      const spacing = availableHeight / (totalMatches + 1);
      
      console.log(`Positioning Round ${roundNumber}: ${matches.length} matches`);
      
      matches.forEach((match, matchIndex) => {
        const roundY = padding + (matchIndex + 1) * spacing;
        console.log(`Match ${match.bracket_id} (${match.user1} vs ${match.user2}) positioned at (${roundX}, ${roundY})`);
        positions.set(match.bracket_id, {
          x: roundX,
          y: roundY,
          match: match,
          round: parseInt(roundNumber)
        });
      });
    });
    
    return positions;
  }, [completeStructure]);

  // Calculate connections between matches using complete structure
  const connections = useMemo(() => {
    const connectionLines = [];
    
    // Pre-build ALL connection lines based on tournament structure
    Object.keys(completeStructure.rounds).forEach(roundNumber => {
      const currentRound = parseInt(roundNumber);
      const nextRound = currentRound + 1;
      
      if (completeStructure.rounds[nextRound]) {
        completeStructure.rounds[roundNumber].forEach((match, matchIndex) => {
          // Check if this is a bye match (participant vs "Bi" or "Bye")
          const isByeMatch = match.user1 === 'Bi' || match.user1 === 'Bye' || 
                           match.user2 === 'Bi' || match.user2 === 'Bye';
          
          if (isByeMatch) {
            // Bye matches automatically advance to next round
            // Find where this participant appears in the next round
            let advancingParticipantId = null;
            if (match.user1 !== 'Bi' && match.user1 !== 'Bye') {
              advancingParticipantId = match.participant_id1;
            } else if (match.user2 !== 'Bi' && match.user2 !== 'Bye') {
              advancingParticipantId = match.participant_id2;
            }
            
            if (advancingParticipantId) {
              // Find the next round match containing this participant
              const targetMatch = completeStructure.rounds[nextRound]?.find(nm => 
                nm.participant_id1 === advancingParticipantId || 
                nm.participant_id2 === advancingParticipantId
              );
              
              if (targetMatch) {
                const startPos = nodePositions.get(match.bracket_id);
                const endPos = nodePositions.get(targetMatch.bracket_id);
                
                if (startPos && endPos) {
                  connectionLines.push({
                    from: match.bracket_id,
                    to: targetMatch.bracket_id,
                    startPos,
                    endPos,
                    status: 'active', // Bye connections are always active
                    active: true
                  });
                }
              }
            }
          } else {
            // Regular match - check if winner has advanced
            if (!match.isPlaceholder && match.winner) {
              const winnerParticipantId = match.winner === 'user1' ? 
                match.participant_id1 : match.participant_id2;
              
              // First, try to find where this winner appears in ANY future round
              let targetMatch = null;
              let targetRoundFound = null;
              
              // Search through all future rounds to find where this winner appears
              for (let searchRound = nextRound; searchRound <= Math.max(...Object.keys(completeStructure.rounds).map(r => parseInt(r))); searchRound++) {
                targetMatch = completeStructure.rounds[searchRound]?.find(nm => 
                  nm.participant_id1 === winnerParticipantId || 
                  nm.participant_id2 === winnerParticipantId
                );
                
                if (targetMatch) {
                  targetRoundFound = searchRound;
                  console.log(`Found ${match.bracket_id} winner in Round ${targetRoundFound}`);
                  break;
                }
              }
              
              if (targetMatch && targetRoundFound) {
                // Found where the winner appears - create connection
                const startPos = nodePositions.get(match.bracket_id);
                const endPos = nodePositions.get(targetMatch.bracket_id);
                
                if (startPos && endPos) {
                  // Determine if this is a bye (skipping rounds) or normal advancement
                  const isSkippingRound = targetRoundFound > nextRound;
                  
                  connectionLines.push({
                    from: match.bracket_id,
                    to: targetMatch.bracket_id,
                    startPos,
                    endPos,
                    status: targetMatch.isPlaceholder ? 'potential' : 'active',
                    active: !targetMatch.isPlaceholder
                  });
                  
                  if (isSkippingRound) {
                    console.log(`${match.bracket_id} gets bye, skipping to Round ${targetRoundFound}`);
                  }
                }
              } else {
                // Winner exists but no match found in future rounds - connect to expected placeholder
                const nextRoundMatches = completeStructure.rounds[nextRound] || [];
                const expectedTargetIndex = Math.floor(matchIndex / 2);
                const expectedTarget = nextRoundMatches[expectedTargetIndex];
                
                if (expectedTarget) {
                  const startPos = nodePositions.get(match.bracket_id);
                  const endPos = nodePositions.get(expectedTarget.bracket_id);
                  
                  if (startPos && endPos) {
                    console.log(`${match.bracket_id} connecting to expected placeholder in Round ${nextRound}`);
                    connectionLines.push({
                      from: match.bracket_id,
                      to: expectedTarget.bracket_id,
                      startPos,
                      endPos,
                      status: 'potential',
                      active: false
                    });
                  }
                }
              }
            } else if (!match.isPlaceholder) {
              // Match exists but no winner yet - show potential connection to expected next round position
              const nextRoundMatches = completeStructure.rounds[nextRound] || [];
              const expectedTargetIndex = Math.floor(matchIndex / 2);
              const expectedTarget = nextRoundMatches[expectedTargetIndex];
              
              if (expectedTarget) {
                const startPos = nodePositions.get(match.bracket_id);
                const endPos = nodePositions.get(expectedTarget.bracket_id);
                
                if (startPos && endPos) {
                  connectionLines.push({
                    from: match.bracket_id,
                    to: expectedTarget.bracket_id,
                    startPos,
                    endPos,
                    status: 'inactive',
                    active: false
                  });
                }
              }
            }
          }
        });
      }
    });
    
    return connectionLines;
  }, [completeStructure, nodePositions]);

  // Handle participant selection for path highlighting
  const handleParticipantSelect = (participantId, participantName) => {
    const pathMatches = new Set();
    
    // Find all matches involving this participant
    bracketData.forEach(match => {
      if (match.participant_id1 === participantId || match.participant_id2 === participantId) {
        pathMatches.add(match.bracket_id);
      }
    });
    
    setHighlightedPath(pathMatches);
  };

  // Handle zoom and pan
  const handleZoom = (delta) => {
    setZoomLevel(prev => Math.max(0.3, Math.min(3, prev + delta)));
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) { // Left mouse button down
      setPanOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
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
              onClick={() => fetchBrackets(false)}
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
                    <Col md={3} sm={6} className="mb-3 mb-md-0">
                      <div className="stat-item">
                        <h4 className="stat-number text-primary mb-1">{tournamentStats.expectedRounds}</h4>
                        <p className="stat-label text-muted mb-0">
                          <i className="fas fa-layer-group me-1"></i>
                          Tournament Rounds
                        </p>
                      </div>
                    </Col>
                    <Col md={3} sm={6} className="mb-3 mb-md-0">
                      <div className="stat-item">
                        <h4 className="stat-number text-info mb-1">{tournamentStats.totalMatches}/{tournamentStats.expectedMatches}</h4>
                        <p className="stat-label text-muted mb-0">
                          <i className="fas fa-fist-raised me-1"></i>
                          Matches Created
                        </p>
                      </div>
                    </Col>
                    <Col md={3} sm={6} className="mb-3 mb-md-0">
                      <div className="stat-item">
                        <h4 className="stat-number text-success mb-1">{tournamentStats.completionPercentage}%</h4>
                        <p className="stat-label text-muted mb-0">
                          <i className="fas fa-chart-line me-1"></i>
                          Tournament Progress
                        </p>
                      </div>
                    </Col>
                    <Col md={3} sm={6} className="mb-3 mb-md-0">
                      <div className="stat-item">
                        <h4 className="stat-number text-warning mb-1">{bracketData.filter(b => b.is_complete).length}</h4>
                        <p className="stat-label text-muted mb-0">
                          <i className="fas fa-check-circle me-1"></i>
                          Completed Matches
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Interactive Bracket Map */}
          <Row>
            <Col>
              <Card className="card-modern">
                <Card.Header className="card-modern-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <i className="fas fa-sitemap me-2"></i>
                      Interactive Tournament Map
                    </h5>
                    <div className="bracket-controls">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handleZoom(0.2)}
                        className="me-2"
                      >
                        <i className="fas fa-search-plus"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => handleZoom(-0.2)}
                        className="me-2"
                      >
                        <i className="fas fa-search-minus"></i>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => {
                          setZoomLevel(1);
                          setPanOffset({ x: 0, y: 0 });
                          setHighlightedPath(new Set());
                        }}
                      >
                        <i className="fas fa-home"></i>
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="card-modern-body p-0">
                  <div 
                    ref={containerRef}
                    className="bracket-map-container"
                    style={{
                      height: '800px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'grab',
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                    }}
                    onMouseMove={handleMouseMove}
                    onWheel={(e) => {
                      e.preventDefault();
                      handleZoom(e.deltaY > 0 ? -0.1 : 0.1);
                    }}
                  >
                    <svg
                      ref={svgRef}
                      width="100%"
                      height="100%"
                      style={{
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.1s ease-out'
                      }}
                    >
                      {/* Connection Lines */}
                      {connections.map((connection, index) => {
                        const isHighlighted = highlightedPath.has(connection.from) || highlightedPath.has(connection.to);
                        
                        // Determine line style based on connection status
                        let strokeColor = '#6c757d'; // Default gray for inactive
                        let strokeWidth = 2;
                        let opacity = 0.4;
                        let strokeDasharray = '';
                        
                        if (isHighlighted) {
                          strokeColor = '#28a745'; // Green for highlighted
                          strokeWidth = 4;
                          opacity = 1;
                        } else if (connection.status === 'active') {
                          strokeColor = '#007bff'; // Blue for active connections
                          strokeWidth = 3;
                          opacity = 0.8;
                        } else if (connection.status === 'potential') {
                          strokeColor = '#ffc107'; // Yellow for potential connections
                          strokeWidth = 2;
                          opacity = 0.6;
                          strokeDasharray = '5,5'; // Dashed line
                        }
                        
                        return (
                          <path
                            key={`connection-${index}`}
                            d={`M ${connection.startPos.x + 60} ${connection.startPos.y} 
                                Q ${(connection.startPos.x + connection.endPos.x) / 2} ${connection.startPos.y},
                                  ${connection.endPos.x - 60} ${connection.endPos.y}`}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            fill="none"
                            opacity={opacity}
                            markerEnd={`url(#arrowhead-${isHighlighted ? 'highlighted' : connection.status})`}
                          />
                        );
                      })}
                      
                      {/* Arrow Markers */}
                      <defs>
                        <marker
                          id="arrowhead-active"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="#007bff"
                          />
                        </marker>
                        <marker
                          id="arrowhead-potential"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="#ffc107"
                          />
                        </marker>
                        <marker
                          id="arrowhead-inactive"
                          markerWidth="8"
                          markerHeight="6"
                          refX="7"
                          refY="3"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 8 3, 0 6"
                            fill="#6c757d"
                          />
                        </marker>
                        <marker
                          id="arrowhead-highlighted"
                          markerWidth="12"
                          markerHeight="8"
                          refX="11"
                          refY="4"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 12 4, 0 8"
                            fill="#28a745"
                          />
                        </marker>
                      </defs>
                      
                      {/* Match Nodes */}
                      {(() => {
                        const nodes = Array.from(nodePositions.values());
                        console.log(`Rendering ${nodes.length} nodes:`, nodes.map(n => `${n.match.bracket_id}(${n.match.user1} vs ${n.match.user2})`));
                        return nodes;
                      })().map((node) => {
                        const isHighlighted = highlightedPath.has(node.match.bracket_id);
                        const isWinner1 = node.match.winner === 'user1';
                        const isWinner2 = node.match.winner === 'user2';
                        const hasWinner = node.match.winner && node.match.winner !== null;
                        const isPlaceholder = node.match.isPlaceholder;
                        
                        // Determine node styling based on match status
                        let fillColor = '#ffffff';
                        let strokeColor = '#6c757d';
                        let strokeWidth = 2;
                        let opacity = 1;
                        
                        if (isHighlighted) {
                          fillColor = '#e8f5e8';
                          strokeColor = '#28a745';
                          strokeWidth = 3;
                        } else if (isPlaceholder) {
                          fillColor = '#f8f9fa';
                          strokeColor = '#dee2e6';
                          strokeWidth = 2;
                          opacity = 0.7;
                        } else if (hasWinner) {
                          fillColor = '#f8f9fa';
                          strokeColor = '#007bff';
                          strokeWidth = 2;
                        }
                        
                        return (
                          <g key={`node-${node.match.bracket_id}`}>
                            {/* Match Node */}
                            <rect
                              x={node.x - 60}
                              y={node.y - 25}
                              width="120"
                              height="50"
                              rx="8"
                              ry="8"
                              fill={fillColor}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                              strokeDasharray={isPlaceholder ? '3,3' : ''}
                              opacity={opacity}
                              className="match-node"
                              style={{ cursor: isPlaceholder ? 'default' : 'pointer' }}
                              onClick={() => !isPlaceholder && setSelectedMatch(node.match)}
                            />
                            
                            {/* Participant 1 */}
                            <text
                              x={node.x}
                              y={node.y - 8}
                              textAnchor="middle"
                              fontSize="10"
                              fill={isPlaceholder ? '#adb5bd' : (isWinner1 ? '#28a745' : '#495057')}
                              fontWeight={isWinner1 ? 'bold' : 'normal'}
                              fontStyle={isPlaceholder ? 'italic' : 'normal'}
                              style={{ cursor: isPlaceholder ? 'default' : 'pointer' }}
                              onClick={() => !isPlaceholder && node.match.participant_id1 && handleParticipantSelect(node.match.participant_id1, node.match.user1)}
                            >
                              {node.match.user1.length > 12 ? node.match.user1.substring(0, 12) + '...' : node.match.user1}
                            </text>
                            
                            {/* VS Divider */}
                            <text
                              x={node.x}
                              y={node.y + 2}
                              textAnchor="middle"
                              fontSize="8"
                              fill={isPlaceholder ? '#adb5bd' : '#6c757d'}
                              fontWeight="bold"
                              fontStyle={isPlaceholder ? 'italic' : 'normal'}
                            >
                              {isPlaceholder ? '...' : 'VS'}
                            </text>
                            
                            {/* Participant 2 */}
                            <text
                              x={node.x}
                              y={node.y + 12}
                              textAnchor="middle"
                              fontSize="10"
                              fill={isPlaceholder ? '#adb5bd' : (isWinner2 ? '#28a745' : '#495057')}
                              fontWeight={isWinner2 ? 'bold' : 'normal'}
                              fontStyle={isPlaceholder ? 'italic' : 'normal'}
                              style={{ cursor: isPlaceholder ? 'default' : 'pointer' }}
                              onClick={() => !isPlaceholder && node.match.participant_id2 && handleParticipantSelect(node.match.participant_id2, node.match.user2)}
                            >
                              {node.match.user2.length > 12 ? node.match.user2.substring(0, 12) + '...' : node.match.user2}
                            </text>
                            
                            {/* Round Label */}
                            <text
                              x={node.x - 55}
                              y={node.y - 30}
                              fontSize="8"
                              fill="#6c757d"
                              fontWeight="bold"
                            >
                              R{node.round}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                    
                    {/* Zoom Level Indicator */}
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '12px'
                      }}
                    >
                      {Math.round(zoomLevel * 100)}%
                    </div>
                  </div>
                </Card.Body>
              </Card>
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
                Click 'Show Brackets' to view tournament matches and results.
              </p>
              <Button 
                className="btn-modern" 
                onClick={() => fetchBrackets(false)}
                disabled={loading}
              >
                <i className="fas fa-eye me-2"></i>
                Show Brackets
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* Match Details Modal */}
      <Modal 
        show={selectedMatch !== null} 
        onHide={() => setSelectedMatch(null)}
        centered
        size="lg"
      >
        {selectedMatch && (
          <>
            <Modal.Header closeButton className="card-modern-header">
              <Modal.Title>
                <i className="fas fa-trophy me-2"></i>
                Match Details - Round {selectedMatch.round}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="card-modern-body">
              <Row>
                <Col md={6}>
                  <div className={`participant-card ${selectedMatch.winner === 'user1' ? 'winner' : ''} mb-3`}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-user me-3 text-primary"></i>
                      <div className="flex-grow-1">
                        <h5 className="mb-1">{selectedMatch.user1}</h5>
                        <p className="text-muted mb-0">Participant 1</p>
                      </div>
                      <Badge 
                        bg={selectedMatch.winner === 'user1' ? 'success' : 'light'} 
                        text={selectedMatch.winner === 'user1' ? 'white' : 'dark'}
                        className="fs-6 px-3 py-2"
                      >
                        {selectedMatch.score1}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className={`participant-card ${selectedMatch.winner === 'user2' ? 'winner' : ''} mb-3`}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-user me-3 text-primary"></i>
                      <div className="flex-grow-1">
                        <h5 className="mb-1">{selectedMatch.user2}</h5>
                        <p className="text-muted mb-0">Participant 2</p>
                      </div>
                      <Badge 
                        bg={selectedMatch.winner === 'user2' ? 'success' : 'light'} 
                        text={selectedMatch.winner === 'user2' ? 'white' : 'dark'}
                        className="fs-6 px-3 py-2"
                      >
                        {selectedMatch.score2}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
              
              {selectedMatch.winner && (
                <div className="text-center mt-4 p-3 bg-success-subtle rounded">
                  <h4 className="text-success mb-2">
                    <i className="fas fa-crown me-2"></i>
                    Winner: {selectedMatch.winner === 'user1' ? selectedMatch.user1 : selectedMatch.user2}
                  </h4>
                  <p className="text-muted mb-0">This match has been completed</p>
                </div>
              )}
              
              <div className="mt-4">
                <h6>Match Information</h6>
                <Row className="text-center">
                  <Col md={4}>
                    <div className="stat-item">
                      <h5 className="text-primary">{selectedMatch.bracket_id}</h5>
                      <p className="text-muted small mb-0">Match ID</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="stat-item">
                      <h5 className="text-primary">{selectedMatch.round}</h5>
                      <p className="text-muted small mb-0">Round</p>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="stat-item">
                      <h5 className={selectedMatch.is_complete ? "text-success" : "text-warning"}>
                        {selectedMatch.is_complete ? "Complete" : "Pending"}
                      </h5>
                      <p className="text-muted small mb-0">Status</p>
                    </div>
                  </Col>
                </Row>
              </div>
            </Modal.Body>
            <Modal.Footer className="card-modern-footer">
              <Button
                variant="success"
                onClick={() => {
                  navigate(`/viewer?bracket_id=${selectedMatch.bracket_id}`);
                  setSelectedMatch(null);
                }}
                disabled={selectedMatch.user1 === 'Bye' || selectedMatch.user2 === 'Bye'}
              >
                <i className="fas fa-eye me-2"></i>
                Watch Match
              </Button>
              <Button variant="secondary" onClick={() => setSelectedMatch(null)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default ViewerBrackets;
