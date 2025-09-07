import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { link } from './constant';
import '../brackets/Brackets.css';
import '../brackets/ModernBracket.css';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';


const ParticipentBracket = () => {
  const [bracketData, setBracketData] = useState([]);
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [viewportState, setViewportState] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const svgRef = useRef(null);
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
        participant_id1: bracket.participant_id1,
        participant_id2: bracket.participant_id2,
        is_complete: bracket.winner && bracket.winner !== null
      }));

      setBracketData(newBrackets);
    } catch (error) {
      console.error('Error fetching brackets:', error);
    }
  };

  // Group rounds from bracket data
  const rounds = useMemo(() => {
    return bracketData.reduce((acc, bracket) => {
      (acc[bracket.round] = acc[bracket.round] || []).push(bracket);
      return acc;
    }, {});
  }, [bracketData]);

  // Calculate complete tournament structure with placeholders
  const completeStructure = useMemo(() => {
    if (bracketData.length === 0) return { rounds: {}, totalRounds: 0 };
    
    const round1Matches = rounds['1'] || [];
    const totalParticipants = round1Matches.length * 2;
    
    const calculateTournamentRounds = (participants) => {
      const structure = {};
      let currentParticipants = participants;
      let roundNumber = 1;
      
      while (currentParticipants > 1) {
        const matchesInRound = Math.floor(currentParticipants / 2);
        structure[roundNumber] = matchesInRound;
        currentParticipants = matchesInRound + (currentParticipants % 2);
        roundNumber++;
      }
      
      return structure;
    };
    
    const expectedStructure = calculateTournamentRounds(totalParticipants);
    const completeRounds = {};
    
    Object.keys(expectedStructure).forEach(roundNumber => {
      const expectedMatches = expectedStructure[roundNumber];
      const actualMatches = rounds[roundNumber] || [];
      
      completeRounds[roundNumber] = [];
      
      actualMatches.forEach(match => {
        completeRounds[roundNumber].push({
          ...match,
          isPlaceholder: false
        });
      });
      
      for (let i = actualMatches.length; i < expectedMatches; i++) {
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

  // Create node positions for tournament bracket layout
  const nodePositions = useMemo(() => {
    const positions = new Map();
    const { rounds: completeRounds, totalRounds } = completeStructure;
    
    if (totalRounds === 0) return positions;
    
    const roundKeys = Object.keys(completeRounds).sort((a, b) => parseInt(a) - parseInt(b));
    const containerWidth = 1400;
    const containerHeight = 800;
    const roundSpacing = containerWidth / (totalRounds + 1);
    
    roundKeys.forEach((roundKey, roundIndex) => {
      const roundNumber = parseInt(roundKey);
      const roundMatches = completeRounds[roundKey];
      const matchCount = roundMatches.length;
      
      const verticalSpacing = containerHeight / (matchCount + 1);
      
      roundMatches.forEach((match, matchIndex) => {
        const x = roundSpacing * (roundIndex + 1);
        const y = verticalSpacing * (matchIndex + 1);
        
        positions.set(match.bracket_id, {
          x,
          y,
          round: roundNumber,
          matchIndex,
          match
        });
      });
    });
    
    return positions;
  }, [completeStructure]);

  // Calculate connections between matches
  const connections = useMemo(() => {
    const connectionMap = new Map();
    const { rounds: completeRounds } = completeStructure;
    
    Object.keys(completeRounds).forEach(roundKey => {
      const currentRound = parseInt(roundKey);
      const nextRound = currentRound + 1;
      const currentRoundMatches = completeRounds[roundKey];
      const nextRoundMatches = completeRounds[nextRound] || [];
      
      if (nextRoundMatches.length === 0) return;
      
      currentRoundMatches.forEach((match, matchIndex) => {
        // Calculate total winners in this round (including byes from previous rounds)
        const round1Matches = completeRounds['1'] || [];
        let totalWinners = 0;
        
        for (let r = 1; r <= currentRound; r++) {
          const roundMatches = completeRounds[r] || [];
          if (r === 1) {
            totalWinners = roundMatches.length + (round1Matches.length * 2 % 2);
          } else {
            const prevRoundMatches = completeRounds[r - 1] || [];
            const prevRoundWinners = prevRoundMatches.length + (prevRoundMatches.length % 2);
            totalWinners = Math.floor(prevRoundWinners / 2) + (prevRoundWinners % 2);
          }
        }
        
        // Determine if this match gets a bye
        let targetMatchIndex;
        if (totalWinners % 2 === 1 && matchIndex === currentRoundMatches.length - 1) {
          // This is a bye, skip to the round after next
          const afterNextRound = currentRound + 2;
          const afterNextMatches = completeRounds[afterNextRound];
          if (afterNextMatches) {
            targetMatchIndex = Math.floor(matchIndex / 2);
            const targetMatch = afterNextMatches[targetMatchIndex];
            if (targetMatch) {
              connectionMap.set(match.bracket_id, {
                targetId: targetMatch.bracket_id,
                isBye: true,
                sourceRound: currentRound,
                targetRound: afterNextRound
              });
            }
          }
        } else {
          // Normal progression to next round
          targetMatchIndex = Math.floor(matchIndex / 2);
          const targetMatch = nextRoundMatches[targetMatchIndex];
          if (targetMatch) {
            connectionMap.set(match.bracket_id, {
              targetId: targetMatch.bracket_id,
              isBye: false,
              sourceRound: currentRound,
              targetRound: nextRound
            });
          }
        }
      });
    });
    
    return connectionMap;
  }, [completeStructure]);

  // Generate SVG path for curved connections
  const generatePath = (start, end, isBye = false) => {
    const midX = start.x + (end.x - start.x) * 0.6;
    const controlX1 = start.x + (end.x - start.x) * 0.3;
    const controlX2 = start.x + (end.x - start.x) * 0.7;
    
    const strokeColor = isBye ? '#e74c3c' : '#3498db';
    const strokeWidth = isBye ? 3 : 2;
    const strokeDash = isBye ? '8,4' : 'none';
    
    return (
      <path
        d={`M ${start.x + 100} ${start.y + 50} Q ${controlX1} ${start.y + 50} ${midX} ${start.y + 50 + (end.y - start.y) * 0.5} Q ${controlX2} ${end.y + 50} ${end.x} ${end.y + 50}`}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={strokeDash}
        opacity={0.8}
      />
    );
  };

  // Mouse event handlers for pan and zoom
  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      setViewportState(prev => ({
        ...prev,
        panX: prev.panX + deltaX,
        panY: prev.panY + deltaY
      }));
      
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 0.1;
    const newZoom = e.deltaY > 0 
      ? Math.max(0.5, viewportState.zoom - zoomFactor)
      : Math.min(3, viewportState.zoom + zoomFactor);
    
    setViewportState(prev => ({ ...prev, zoom: newZoom }));
  };

  const resetView = () => {
    setViewportState({ zoom: 1, panX: 0, panY: 0 });
  };

  const handleParticipantHover = (participantId) => {
    if (!participantId) return;
    
    // Find all matches involving this participant
    const participantMatches = [];
    Object.values(completeStructure.rounds).forEach(roundMatches => {
      roundMatches.forEach(match => {
        if (match.participant_id1 === participantId || match.participant_id2 === participantId) {
          participantMatches.push(match.bracket_id);
        }
      });
    });
    
    setHighlightedPath(participantMatches);
  };

  const handleParticipantLeave = () => {
    setHighlightedPath(null);
  };

  // Render individual match node
  const renderMatchNode = (position) => {
    const { match } = position;
    const isHighlighted = highlightedPath && highlightedPath.includes(match.bracket_id);
    const isPlaceholder = match.isPlaceholder;
    const hasWinner = match.winner && match.winner !== null;
    const isComplete = hasWinner;
    const isBye = match.user1 === 'Bye' || match.user2 === 'Bye';
    const isClickable = !isPlaceholder && !isBye;

    const nodeStyle = {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: '200px',
      height: '100px',
      backgroundColor: isPlaceholder ? '#f8f9fa' : '#ffffff',
      border: isHighlighted ? '3px solid #e74c3c' : (isPlaceholder ? '2px dashed #dee2e6' : '2px solid #007bff'),
      borderRadius: '8px',
      padding: '8px',
      boxShadow: isHighlighted ? '0 4px 20px rgba(231, 76, 60, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
      cursor: isClickable ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      fontSize: '12px',
      zIndex: 10
    };

    const participantStyle = (isWinner) => ({
      padding: '4px 8px',
      marginBottom: '2px',
      borderRadius: '4px',
      backgroundColor: isWinner ? '#d4edda' : '#f8f9fa',
      border: isWinner ? '1px solid #28a745' : '1px solid #dee2e6',
      fontSize: '11px',
      fontWeight: isWinner ? 'bold' : 'normal',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    });

    return (
      <div
        key={match.bracket_id}
        style={nodeStyle}
        onClick={isClickable ? () => navigate(`/viewer?bracket_id=${match.bracket_id}`) : undefined}
      >
        <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px', textAlign: 'center' }}>
          Round {match.round} {isPlaceholder && '(TBD)'} {isClickable && <span style={{ color: '#28a745' }}>● LIVE</span>}
        </div>
        
        <div style={participantStyle(match.winner === 'user1')}>
          <span 
            onMouseEnter={() => handleParticipantHover(match.participant_id1)}
            onMouseLeave={handleParticipantLeave}
            style={{ cursor: match.participant_id1 ? 'pointer' : 'default' }}
          >
            {match.user1}
          </span>
          <span>{match.score1 || 0}</span>
        </div>
        
        <div style={participantStyle(match.winner === 'user2')}>
          <span 
            onMouseEnter={() => handleParticipantHover(match.participant_id2)}
            onMouseLeave={handleParticipantLeave}
            style={{ cursor: match.participant_id2 ? 'pointer' : 'default' }}
          >
            {match.user2}
          </span>
          <span>{match.score2 || 0}</span>
        </div>
        
        {hasWinner && (
          <div style={{ fontSize: '10px', color: '#28a745', textAlign: 'center', fontWeight: 'bold' }}>
            ✓ Complete
          </div>
        )}
      </div>
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
              Interactive bracket visualization with connection mapping
            </p>
          </div>
        </Col>
      </Row>

      {/* Controls */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-center gap-3 flex-wrap align-items-center">
            <Button className="btn-modern" onClick={generateBracket} size="lg">
              <i className="fas fa-eye me-2"></i>
              Load Brackets
            </Button>
            {bracketData.length > 0 && (
              <Button variant="outline-secondary" onClick={resetView} size="lg">
                <i className="fas fa-undo me-2"></i>
                Reset View
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Legend */}
      {bracketData.length > 0 && (
        <Row className="mb-3">
          <Col>
            <div className="d-flex justify-content-center">
              <div className="card bg-light p-3">
                <div className="d-flex gap-4 align-items-center text-sm">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '20px', height: '3px', backgroundColor: '#3498db' }}></div>
                    <span>Normal Path</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '20px', height: '3px', backgroundColor: '#e74c3c', borderStyle: 'dashed', borderWidth: '1px' }}></div>
                    <span>Bye Path</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ color: '#28a745', fontSize: '12px' }}>● LIVE</span>
                    <span>Clickable Match</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '20px', height: '12px', border: '2px dashed #dee2e6', backgroundColor: '#f8f9fa' }}></div>
                    <span>Future Match</span>
                  </div>
                  <div className="text-muted small">
                    <i className="fas fa-mouse-pointer me-1"></i>
                    Hover participants to trace paths • Drag to pan • Scroll to zoom
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      )}

      {/* Interactive Bracket Visualization */}
      {bracketData.length > 0 ? (
        <Row>
          <Col>
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{
                position: 'relative',
                width: '100%',
                height: '800px',
                border: '2px solid #dee2e6',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#f8f9fa',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '1400px',
                  height: '800px',
                  transform: `translate(${viewportState.panX}px, ${viewportState.panY}px) scale(${viewportState.zoom})`,
                  transformOrigin: '0 0',
                  transition: isDragging ? 'none' : 'transform 0.1s ease'
                }}
              >
                {/* SVG for connection lines */}
                <svg
                  ref={svgRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 1
                  }}
                >
                  {Array.from(connections.entries()).map(([sourceId, connection]) => {
                    const sourcePos = nodePositions.get(sourceId);
                    const targetPos = nodePositions.get(connection.targetId);
                    
                    if (!sourcePos || !targetPos) return null;
                    
                    const isHighlighted = highlightedPath && (
                      highlightedPath.includes(sourceId) && highlightedPath.includes(connection.targetId)
                    );
                    
                    return (
                      <g key={`${sourceId}-${connection.targetId}`} opacity={isHighlighted ? 1 : 0.6}>
                        {generatePath(sourcePos, targetPos, connection.isBye)}
                      </g>
                    );
                  })}
                </svg>

                {/* Match nodes */}
                {Array.from(nodePositions.values()).map(position => renderMatchNode(position))}
              </div>

              {/* Zoom indicator */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 20
              }}>
                Zoom: {Math.round(viewportState.zoom * 100)}%
              </div>
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
                Click 'Load Brackets' to view the interactive tournament visualization.
              </p>
              <Button className="btn-modern" onClick={generateBracket}>
                <i className="fas fa-eye me-2"></i>
                Load Brackets
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ParticipentBracket;
