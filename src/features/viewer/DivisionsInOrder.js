import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { link } from './constant';
const DivisionsInOrder = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tournamentId = params.get('tournament_id');
  const [tournamentData, setTournamentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${link}/divisions/tournament-order`, {
          params: {
            tournament_id: tournamentId,
          },
        });
        
        setTournamentData(response.data);
      } catch (error) {
        console.error('Error fetching divisions:', error);
        setError(error.response?.data?.error || 'Failed to fetch tournament data');
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchDivisions();
    } else {
      setLoading(false);
      setError('No tournament ID provided');
    }
  }, [tournamentId]);

  // Helper function to get status badge styling
  const getStatusBadge = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    };

    switch (status) {
      case 'completed':
        return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' };
      case 'in_progress':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' };
      case 'pending':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f1b0b7' };
      default:
        return baseStyle;
    }
  };

  if (loading) {
    return (
      <div style={{ marginTop: '80px', padding: '20px', textAlign: 'center' }}>
        <div>Loading tournament order...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: '80px', padding: '20px' }}>
        <div style={{ color: 'red', textAlign: 'center' }}>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!tournamentData || !tournamentData.tournament_order) {
    return (
      <div style={{ marginTop: '80px', padding: '20px', textAlign: 'center' }}>
        <div>No divisions found for this tournament.</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '80px', padding: '20px', maxWidth: '1200px', margin: '80px auto 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>Tournament Competition Order</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
          <div><strong>Tournament ID:</strong> {tournamentData.tournament_id}</div>
          <div><strong>Total Divisions:</strong> {tournamentData.total_divisions}</div>
          <div><strong>Estimated Duration:</strong> {tournamentData.total_estimated_time_formatted}</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={getStatusBadge('completed')}>Completed</span>
          <span>Division finished</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={getStatusBadge('in_progress')}>In Progress</span>
          <span>Currently competing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={getStatusBadge('pending')}>Pending</span>
          <span>Waiting to start</span>
        </div>
      </div>

      {/* Divisions List */}
      <div style={{ 
        display: 'grid', 
        gap: '15px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
      }}>
        {tournamentData.tournament_order.map((division) => (
          <div 
            key={division.division_id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: division.status === 'in_progress' ? '#fffbf0' : '#fff',
              boxShadow: division.status === 'in_progress' ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s ease'
            }}
          >
            {/* Order Number and Status */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333',
                backgroundColor: '#f8f9fa',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '2px solid #dee2e6'
              }}>
                #{division.tournament_order}
              </div>
              <span style={getStatusBadge(division.status)}>
                {division.status.replace('_', ' ')}
              </span>
            </div>

            {/* Division Details */}
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ 
                margin: '0 0 10px 0', 
                color: '#333',
                fontSize: '18px'
              }}>
                Age Group: {division.age_group}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div><strong>Level:</strong> {division.proficiency_level}</div>
                <div><strong>Gender:</strong> {division.gender || 'Mixed'}</div>
                <div><strong>Category:</strong> {division.category}</div>
                <div><strong>Duration:</strong> {division.time} mins</div>
              </div>
            </div>

            {/* Mat Assignment */}
            <div style={{
              backgroundColor: division.mat_name ? '#e8f5e8' : '#fff3cd',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span><strong>Mat Assignment:</strong></span>
                <span style={{ 
                  fontWeight: 'bold',
                  color: division.mat_name ? '#155724' : '#856404'
                }}>
                  {division.mat_name || "Hasn't been assigned one yet"}
                </span>
              </div>
            </div>

            {/* Timing Information */}
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>Est. Start Time:</strong></span>
                <span>{division.estimated_start_time_formatted}</span>
              </div>
              {division.status === 'pending' && (
                <div style={{ marginTop: '5px', color: '#666', fontSize: '12px' }}>
                  Approximately {division.estimated_start_time} minutes from tournament start
                </div>
              )}
            </div>

            {/* Division ID for debugging */}
            <div style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#999',
              textAlign: 'right'
            }}>
              ID: {division.division_id}
            </div>
          </div>
        ))}
      </div>

      {/* Summary at bottom */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Tournament Summary</h3>
        <p style={{ margin: 0, color: '#666' }}>
          Total estimated tournament duration: <strong>{tournamentData.total_estimated_time_formatted}</strong>
          {' '}({tournamentData.total_estimated_time} minutes)
        </p>
      </div>
    </div>
  );
}

export default DivisionsInOrder;