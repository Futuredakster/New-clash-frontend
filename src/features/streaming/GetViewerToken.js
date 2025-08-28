import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { link } from './constant';

export default function GetViewerToken() {
  const [bracket_id, setBracket_id] = useState('');
  const [tokens, setTokens] = useState(null); // Stores fetched tokens (both host and viewer)
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // To show loading state

  const location = useLocation();
  const navigate = useNavigate();

  // Function to fetch tokens from the backend
  const fetchViewerTokens = useCallback(async (id) => {
    if (!id) {
      setError('Bracket ID is missing. Cannot fetch tokens.');
      return;
    }

    setIsLoading(true);
    setError(''); // Clear previous errors
    setTokens(null); // Clear previous tokens

    try {
      console.log('Fetching tokens for bracket_id:', id);
      // Make a GET request to your backend API
      // Assumes your backend has a GET route at /api/stream/tokens that accepts bracket_id as a query param
      const res = await axios.get(`${link}/api/stream/tokens?bracket_id=${id}`);
      setTokens(res.data);
      console.log('Tokens fetched:', res.data);

      // Navigate to the viewer link immediately after successful token retrieval
      if (res.data) {
        navigate(`/watch?t=${res.data}`);
      } else {
        setError('Viewer token not found in the response.');
      }
    } catch (err) {
      console.error('Failed to fetch tokens:', err);
      if (err.response && err.response.status === 404) {
        setError(`Tokens not found for bracket ID: ${id}. Please ensure a host stream has been created.`);
      } else {
        setError('Failed to fetch tokens. Is your backend running and configured for GET requests?');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Effect to extract bracket_id from URL on component mount and automatically fetch tokens
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get('bracket_id');
    if (idFromUrl) {
      setBracket_id(idFromUrl);
      fetchViewerTokens(idFromUrl); // Automatically fetch tokens when ID is present
    } else {
      setError('No Bracket ID found in the URL. Please add `?bracket_id=YOUR_ID` to view a stream.');
    }
  }, [location.search, fetchViewerTokens]); // Depend on location.search and fetchViewerTokens

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: 'auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>Join Stream as Viewer</h2>
      {bracket_id ? (
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          Attempting to join stream for Bracket ID: <strong style={{ color: '#007bff' }}>{bracket_id}</strong>
        </p>
      ) : (
        <p style={{ color: 'orange', marginBottom: '1.5rem' }}>
          No Bracket ID found in the URL. Please add `?bracket_id=YOUR_ID` to the URL.
        </p>
      )}

      {isLoading && (
        <p style={{ color: '#007bff', fontWeight: 'bold' }}>Loading viewer token...</p>
      )}

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {/* Button to manually re-fetch in case of initial error or if URL changes */}
      {!isLoading && bracket_id && (
        <button
          onClick={() => fetchViewerTokens(bracket_id)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'background-color 0.3s ease',
          }}
          disabled={!bracket_id}
        >
          {error ? 'Try Again' : 'Reload Viewer Token'}
        </button>
      )}

      {/* Optionally display tokens for debugging, but user will be redirected */}
      {tokens && !error && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem', textAlign: 'left' }}>
          <h3 style={{ color: '#555', marginBottom: '0.8rem' }}>Tokens Retrieved (for reference)</h3>
          <p>
            <strong>Host Token:</strong> <code>{tokens.hostToken || 'N/A'}</code>
          </p>
          <p>
            <strong>Viewer Token:</strong> <code>{tokens.viewerToken || 'N/A'}</code> (You've been redirected to this link)
          </p>
          <p style={{ marginTop: '1rem', color: '#007bff', fontStyle: 'italic' }}>
            You have been automatically navigated to the viewer link.
          </p>
        </div>
      )}
    </div>
  );
}
