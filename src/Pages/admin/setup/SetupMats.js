import React, { useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { link } from '../../../constant';

const SetupMats = ({ tournamentData, onStepComplete, onError }) => {
  const [matCount, setMatCount] = useState(3);
  const [matNames, setMatNames] = useState(['Mat A', 'Mat B', 'Mat C']);
  const [loading, setLoading] = useState(false);
  const [createdMats, setCreatedMats] = useState([]);

  // Update mat names when count changes
  const updateMatCount = (count) => {
    setMatCount(count);
    const newNames = [];
    for (let i = 0; i < count; i++) {
      const letter = String.fromCharCode(65 + i); // A, B, C, etc.
      newNames.push(matNames[i] || `Mat ${letter}`);
    }
    setMatNames(newNames);
  };

  const updateMatName = (index, name) => {
    const newNames = [...matNames];
    newNames[index] = name;
    setMatNames(newNames);
  };

  // Handle mat creation
  const handleCreateMats = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      onError('Access token not found. Please log in again.');
      return;
    }

    setLoading(true);
    onError(''); // Clear any previous errors

    try {
      // Create each mat
      const matPromises = matNames.slice(0, matCount).map(async (matName) => {
        return axios.post(
          `${link}/mats`,
          { 
            tournament_id: tournamentData?.tournament_id,
            mat_name: matName 
          },
          {
            headers: {
              accessToken: accessToken,
            }
          }
        );
      });

      const results = await Promise.all(matPromises);
      
      console.log(`Successfully created ${matCount} mats for the tournament!`);
      setCreatedMats(results.map(result => result.data.mat));
      
      // Complete this step and move to next
      onStepComplete(3, {
        mats_created: matCount,
        mat_names: matNames.slice(0, matCount)
      });
      
    } catch (error) {
      console.error('Error creating mats:', error);
      onError(error.response?.data?.error || 'Failed to create mats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipMats = () => {
    // Allow skipping mat creation - mats can be created later
    onStepComplete(3, {
      mats_created: 0,
      skipped: true
    });
  };

  if (!tournamentData?.tournament_id) {
    return (
      <Alert variant="warning">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Please complete the tournament and division creation steps first.
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h5 className="text-primary mb-2">
          <i className="fas fa-map me-2"></i>
          Competition Mats for "{tournamentData.tournament_name}"
        </h5>
        <p className="text-muted">
          Set up competition mats where your karate divisions will compete. You can create multiple mats to run divisions in parallel.
        </p>
      </div>

      <div className="card p-4 mb-4">
        <div className="mb-3">
          <label className="form-label fw-bold">
            <i className="fas fa-hashtag me-2"></i>
            Number of Mats
          </label>
          <select 
            className="form-select" 
            value={matCount} 
            onChange={(e) => updateMatCount(parseInt(e.target.value))}
            disabled={loading}
          >
            {[1,2,3,4,5,6,7,8].map(num => (
              <option key={num} value={num}>{num} Mat{num > 1 ? 's' : ''}</option>
            ))}
          </select>
          <small className="text-muted">
            Choose the number of competition areas you want to set up
          </small>
        </div>
        
        <div className="mb-3">
          <label className="form-label fw-bold">
            <i className="fas fa-tag me-2"></i>
            Mat Names
          </label>
          {matNames.slice(0, matCount).map((name, index) => (
            <div key={index} className="mb-2">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-map-marker-alt"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => updateMatName(index, e.target.value)}
                  placeholder={`Mat ${String.fromCharCode(65 + index)}`}
                  disabled={loading}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          <small>
            <strong>What are mats?</strong> Mats are competition areas where divisions will compete. 
            You can assign different divisions to different mats to run multiple competitions simultaneously.
          </small>
        </div>
      </div>

      {/* Preview */}
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="fas fa-eye me-2"></i>
            Mat Setup Preview
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {matNames.slice(0, matCount).map((name, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div 
                  className="p-3 rounded text-center position-relative"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    border: '8px solid #dc2626',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                    color: 'white'
                  }}
                >
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                    style={{ 
                      width: '50px', 
                      height: '50px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <i className="fas fa-map-marker-alt text-white" style={{fontSize: '20px'}}></i>
                  </div>
                  <div className="fw-bold text-white" style={{fontSize: '16px'}}>{name}</div>
                  <small className="text-white-50">Competition Area {index + 1}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center gap-3 mt-4">
        <Button 
          variant="outline-secondary"
          onClick={handleSkipMats}
          disabled={loading}
        >
          <i className="fas fa-forward me-2"></i>
          Skip for Now
        </Button>

        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => window.history.back()}
            disabled={loading}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back
          </Button>
          <Button 
            variant="success" 
            onClick={handleCreateMats} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                Creating Mats...
              </>
            ) : (
              <>
                <i className="fas fa-plus me-2"></i>
                Create {matCount} Mat{matCount > 1 ? 's' : ''} & Continue
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Alert variant="light" className="border">
          <div className="d-flex align-items-start">
            <i className="fas fa-lightbulb text-warning me-3 mt-1"></i>
            <div>
              <strong>Tip:</strong> Don't worry if you're not sure about the number of mats right now. 
              You can always create, modify, or delete mats later from the tournament dashboard.
              <br />
              <small className="text-muted">
                Mats help organize your tournament flow and allow multiple divisions to compete simultaneously.
              </small>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default SetupMats;