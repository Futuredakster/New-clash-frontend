import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { link } from './constant';

const SpectatorView = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bracket_id = queryParams.get('bracket_id') || '';

  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [points1, setPoints1] = useState(0);
  const [points2, setPoints2] = useState(0);
  const [winUser1, setWinUser1] = useState(false);
  const [winUser2, setWinUser2] = useState(false);

  // Penalty and SENSHU state
  const [penalties1, setPenalties1] = useState(0);
  const [penalties2, setPenalties2] = useState(0);
  const [penaltyLevel1, setPenaltyLevel1] = useState(null);
  const [penaltyLevel2, setPenaltyLevel2] = useState(null);
  const [senshuUser1, setSenshuUser1] = useState(false);
  const [senshuUser2, setSenshuUser2] = useState(false);
  const [firstScorer, setFirstScorer] = useState(null);

  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [lastUpdate, setLastUpdate] = useState(null);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement === containerRef.current ||
        document.webkitFullscreenElement === containerRef.current ||
        document.msFullscreenElement === containerRef.current
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Real-time polling function
  const fetchBracketData = async () => {
    try {
      const response = await axios.get(`${link}/brackets/One`, {
        params: { bracket_id },
      });

      const fetchedBrackets = response.data;

      if (fetchedBrackets) {
        setUser1(fetchedBrackets.user1 || 'User 1');
        setUser2(fetchedBrackets.user2 || 'User 2');
        setPoints1(fetchedBrackets.points_user1 || 0);
        setPoints2(fetchedBrackets.points_user2 || 0);

        // Set the win flags
        setWinUser1(fetchedBrackets.win_user1 || false);
        setWinUser2(fetchedBrackets.win_user2 || false);

        // Set penalty and SENSHU data
        setPenalties1(fetchedBrackets.penalties_user1 || 0);
        setPenalties2(fetchedBrackets.penalties_user2 || 0);
        setPenaltyLevel1(fetchedBrackets.penalty_level_user1 || null);
        setPenaltyLevel2(fetchedBrackets.penalty_level_user2 || null);
        setSenshuUser1(fetchedBrackets.senshu_user1 || false);
        setSenshuUser2(fetchedBrackets.senshu_user2 || false);
        setFirstScorer(fetchedBrackets.first_scorer || null);

        // Update time from database
        setTimeLeft(fetchedBrackets.time || 300);

        setConnectionStatus('Live');
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error fetching bracket data:", error);
      setConnectionStatus('Connection Error');
    }
  };

  // Set up real-time polling
  useEffect(() => {
    if (!bracket_id) return;

    // Initial fetch
    fetchBracketData();

    // Set up polling every 1.5 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchBracketData();
    }, 1500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [bracket_id]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Helper function to render penalty circles
  const renderPenaltyCircles = (penalties) => {
    const circles = [];
    for (let i = 0; i < 4; i++) {
      circles.push(
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: i < penalties ? '#ffc107' : 'transparent',
            border: '2px solid #ffc107',
            margin: '0 2px'
          }}
        />
      );
    }
    return circles;
  };

  return (
    <div
      ref={containerRef}
      className="d-flex vh-100 position-relative"
      style={{ backgroundColor: isFullscreen ? '#000' : 'inherit' }}
    >
      {/* Connection Status */}
      <div
        className="position-absolute"
        style={{ top: '10px', left: '10px', zIndex: 20 }}
      >
        <span
          style={{
            backgroundColor: connectionStatus === 'Live' ? '#28a745' : connectionStatus === 'Connection Error' ? '#dc3545' : '#ffc107',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          ● {connectionStatus}
        </span>
        {lastUpdate && (
          <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Red Half */}
      <div className="w-50 bg-danger d-flex flex-column justify-content-center align-items-center">
        {winUser1 && <h4 className="winner-text">🏆 Winner</h4>}

        <h2 style={{ color: 'white' }}>
          {user1} {senshuUser1 && <span style={{ color: '#ffd700' }}>⭐</span>}
        </h2>

        <h3 style={{ color: 'white' }}>Points: {points1}</h3>

        {/* Penalty indicators */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ color: 'white', fontSize: '14px', marginBottom: '5px' }}>
            Penalties: {renderPenaltyCircles(penalties1)}
          </div>
          {penaltyLevel1 && (
            <div style={{ color: '#ffc107', fontSize: '12px', fontWeight: 'bold' }}>
              Status: {penaltyLevel1}
            </div>
          )}
        </div>
      </div>

      {/* Blue Half */}
      <div className="w-50 bg-primary d-flex flex-column justify-content-center align-items-center">
        {winUser2 && <h4 className="winner-text">🏆 Winner</h4>}

        <h2 style={{ color: 'white' }}>
          {user2} {senshuUser2 && <span style={{ color: '#ffd700' }}>⭐</span>}
        </h2>

        <h3 style={{ color: 'white' }}>Points: {points2}</h3>

        {/* Penalty indicators */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ color: 'white', fontSize: '14px', marginBottom: '5px' }}>
            Penalties: {renderPenaltyCircles(penalties2)}
          </div>
          {penaltyLevel2 && (
            <div style={{ color: '#ffc107', fontSize: '12px', fontWeight: 'bold' }}>
              Status: {penaltyLevel2}
            </div>
          )}
        </div>
      </div>

      {/* Timer in center */}
      <div
        className="position-absolute start-50 translate-middle-x text-center"
        style={{ top: '10%', color: 'white' }}
      >
        <h1 style={{ fontSize: '2.5rem' }}>{formatTime(timeLeft)}</h1>

        <div style={{ marginTop: '20px' }}>
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <i className="fas fa-eye me-2"></i>
            Spectator View - Live Updates
          </div>
        </div>
      </div>

      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '30px',
          height: '30px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          zIndex: 10
        }}
        title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          e.target.style.color = 'rgba(255, 255, 255, 0.9)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.color = 'rgba(255, 255, 255, 0.6)';
        }}
      >
        {isFullscreen ? '⤌' : '⤢'}
      </button>
    </div>
  );
};

export default SpectatorView;