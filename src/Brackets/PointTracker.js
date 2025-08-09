import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { link } from '../constant';

const PointTracker = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bracket_id = queryParams.get('bracket_id') || '';

  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [points1, setPoints1] = useState(0);
  const [points2, setPoints2] = useState(0);
  const [winUser1, setWinUser1] = useState(false);
  const [winUser2, setWinUser2] = useState(false);

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }
    setIsRunning(!isRunning);
  };

  const addTime = () => {
    setTimeLeft((prev) => prev + 10);
  };

  const subtractTime = () => {
    setTimeLeft((prev) => Math.max(prev - 10, 0));
  };

  const updatePoints = async (user, newPoints) => {
    try {
      // Send the updated points to the backend
    
      await axios.patch(`${link}/brackets/updatePoints`, {
        bracket_id,
        user,
        points: newPoints,
        time: timeLeft
      });

      // Fetch the updated bracket information to check win status
      const response = await axios.get(`${link}/brackets/One`, {
        params: { bracket_id },
      });
      const fetchedBrackets = response.data;

      // Update points
      if (user === "user1") {
        setPoints1(fetchedBrackets.points_user1 || 0);
      } else if (user === "user2") {
        setPoints2(fetchedBrackets.points_user2 || 0);
      }

      // Update win status
      setWinUser1(fetchedBrackets.win_user1 || false);
      setWinUser2(fetchedBrackets.win_user2 || false);

    } catch (error) {
      console.error("Error updating points:", error);
    }
  };

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await axios.get(`${link}/brackets/One`, {
          params: { bracket_id },
        });

        const fetchedBrackets = response.data;

        setUser1(fetchedBrackets.user1 || 'User 1');
        setUser2(fetchedBrackets.user2 || 'User 2');
        setPoints1(fetchedBrackets.points_user1 || 0);
        setPoints2(fetchedBrackets.points_user2 || 0);

        // Set the win flags
        setWinUser1(fetchedBrackets.win_user1 || false);
        setWinUser2(fetchedBrackets.win_user2 || false);

      } catch (error) {
        console.error("Error fetching brackets:", error);
      }
    };

    fetchPoints();

    return () => clearInterval(timerRef.current);
  }, [bracket_id]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const addPoints1 = () => {
    const newPoints = points1 + 1;
    updatePoints("user1", newPoints);
  };

  const subtractPoints1 = () => {
    const newPoints = points1 - 1;
    updatePoints("user1", newPoints);
  };

  const addPoints2 = () => {
    const newPoints = points2 + 1;
    updatePoints("user2", newPoints);
  };

  const subtractPoints2 = () => {
    const newPoints = points2 - 1;
    updatePoints("user2", newPoints);
  };

  return (
    <div className="d-flex vh-100 position-relative">

      {/* Red Half */}
      <div className="w-50 bg-danger d-flex flex-column justify-content-center align-items-center">
        {winUser1 && <h4 className="winner-text">🏆 Winner</h4>}
        <h2 style={{ color: 'white' }}>{user1}</h2>
        <h3 style={{ color: 'white' }}>Points: {points1}</h3>
        <div>
          <button onClick={addPoints1} style={{ margin: '5px' }}>+1 Point</button>
          <button onClick={subtractPoints1} style={{ margin: '5px' }}>-1 Point</button>
        </div>
      </div>

      {/* Blue Half */}
      <div className="w-50 bg-primary d-flex flex-column justify-content-center align-items-center">
        {winUser2 && <h4 className="winner-text">🏆 Winner</h4>}
        <h2 style={{ color: 'white' }}>{user2}</h2>
        <h3 style={{ color: 'white' }}>Points: {points2}</h3>
        <div>
          <button onClick={addPoints2} style={{ margin: '5px' }}>+1 Point</button>
          <button onClick={subtractPoints2} style={{ margin: '5px' }}>-1 Point</button>
        </div>
      </div>

      <div
        className="position-absolute start-50 translate-middle-x text-center"
        style={{ top: '10%', color: 'white' }}
      >
        <h1 style={{ fontSize: '2.5rem' }}>{formatTime(timeLeft)}</h1>

        <div style={{ marginTop: '20px' }}>
          <button onClick={toggleTimer} style={{ margin: '5px', padding: '10px 20px' }}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button onClick={addTime} style={{ margin: '5px', padding: '10px 20px' }}>
            +10s
          </button>
          <button onClick={subtractTime} style={{ margin: '5px', padding: '10px 20px' }}>
            -10s
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointTracker;
