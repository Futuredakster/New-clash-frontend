import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { link } from '../constant';

export default function CreateStream() {
  const [bracket_id, setBracket_id] = useState('');
  const [tokens, setTokens] = useState(null);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate(); // Initialize useNavigate hook

  // useEffect to extract bracket_id from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get('bracket_id');
    if (idFromUrl) {
      setBracket_id(idFromUrl);
    }
  }, [location.search]);

  const handleGenerate = async () => {
    if (!bracket_id) {
      setError('Bracket ID is missing from the URL.');
      return;
    }
    try {
      console.log('Sending bracket_id:', bracket_id);

      const res = await axios.post(`${link}/api/stream/tokens`, { bracket_id });
      setTokens(res.data);
      setError('');

      // *** New: Navigate to the host link immediately after successful token generation ***
      if (res.data && res.data.hostToken) {
        navigate(`/watch?t=${res.data.hostToken}`);
      }

    } catch (err) {
      setError('Failed to generate tokens. Is your backend running?');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto' }}>
      <h2>Create Stream</h2>
      {bracket_id ? (
        <p>
          Generating tokens for Bracket ID: <strong>{bracket_id}</strong>
        </p>
      ) : (
        <p style={{ color: 'orange' }}>No Bracket ID found in the URL. Please add `?bracket_id=YOUR_ID`.</p>
      )}

      <button onClick={handleGenerate} style={{ padding: '0.5rem 1rem' }} disabled={!bracket_id}>
        Start live streaming
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* The links below are now optional, as the user will be redirected */}
      {tokens && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <h3>Tokens Generated (for reference)</h3>
          <p>
            <strong>Host Token:</strong> <code>{tokens.hostToken}</code> (You've been redirected to this link)
          </p>
          <p>
            <strong>Viewer Token:</strong> <code>{tokens.viewerToken}</code>
          </p>
          <p style={{marginTop: '1rem'}}>
              You have been automatically navigated to the host link. Share the Viewer Link with others!
          </p>
        </div>
      )}
    </div>
  );
}