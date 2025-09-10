import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
import { link } from '../../../constant';

const SetupStart = ({ tournamentData, onStepComplete, onSetupComplete, onError }) => {
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [readyToStart, setReadyToStart] = useState(false);

  useEffect(() => {
    validateTournament();
  }, []);

  const validateTournament = async () => {
    if (!tournamentData?.tournament_id) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        onError('Access token not found. Please log in again.');
        return;
      }

      // Check tournament setup completeness
      const results = {
        tournament: { status: 'complete', data: tournamentData },
        divisions: { status: 'checking', count: 0 },
        mats: { status: 'checking', count: 0 },
        competitors: { status: 'checking', count: 0 },
        readiness: { canStart: false, warnings: [], errors: [] }
      };

      // Check divisions
      try {
        const divisionsResponse = await axios.get(`${link}/divisions/`, {
          headers: { accessToken: accessToken },
          params: { tournament_id: tournamentData.tournament_id }
        });
        
        const divisions = divisionsResponse.data || [];
        results.divisions = {
          status: divisions.length > 0 ? 'complete' : 'missing',
          count: divisions.length,
          data: divisions
        };

        if (divisions.length === 0) {
          results.readiness.errors.push('No divisions created. Please create at least one division.');
        }

      } catch (error) {
        results.divisions = { status: 'error', count: 0 };
        results.readiness.errors.push('Could not check divisions.');
      }

      // Check mats
      try {
        const matsResponse = await axios.get(`${link}/mats/`, {
          headers: { accessToken: accessToken },
          params: { tournament_id: tournamentData.tournament_id }
        });
        
        const mats = matsResponse.data || [];
        results.mats = {
          status: mats.length > 0 ? 'complete' : 'optional',
          count: mats.length,
          data: mats
        };

        if (mats.length === 0) {
          results.readiness.warnings.push('No mats created. You can create them later if needed.');
        }

      } catch (error) {
        results.mats = { status: 'optional', count: 0 };
        results.readiness.warnings.push('Could not check mats (optional).');
      }

      // Check competitors across all divisions
      let totalCompetitors = 0;
      let divisionsWithCompetitors = 0;
      
      if (results.divisions.data && results.divisions.data.length > 0) {
        for (const division of results.divisions.data) {
          try {
            const participantResponse = await axios.get(`${link}/participants/user`, {
              headers: { accessToken: accessToken },
              params: { division_id: division.division_id }
            });
            
            const participantCount = participantResponse.data?.participants?.length || 0;
            if (participantCount > 0) {
              divisionsWithCompetitors++;
              totalCompetitors += participantCount;
            }
          } catch (divisionError) {
            // No participants in this division
          }
        }
      }

      results.competitors = {
        status: totalCompetitors > 0 ? 'complete' : 'optional',
        count: totalCompetitors,
        divisionsWithCompetitors: divisionsWithCompetitors
      };

      if (totalCompetitors === 0) {
        results.readiness.warnings.push('No competitors assigned. You can add them later before starting matches.');
      }

      // Determine overall readiness
      results.readiness.canStart = results.readiness.errors.length === 0;

      setValidationResults(results);
      setReadyToStart(results.readiness.canStart);

    } catch (error) {
      console.error('Error validating tournament:', error);
      onError('Failed to validate tournament setup.');
    }
  };

  const handleStartTournament = async () => {
    if (!readyToStart) return;

    setLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        onError('Access token not found. Please log in again.');
        return;
      }

      // Call the brackets initialization endpoint
      const response = await axios.post(
        `${link}/brackets/initial`,  
        {
          tournament_id: tournamentData.tournament_id,
        },
        {
          headers: {
            accessToken: accessToken,
          },
        }
      );

      console.log('Tournament started successfully:', response.data);
      
      // Complete the setup process
      onSetupComplete();

    } catch (error) {
      console.error('Error starting tournament:', error);
      
      if (error.response?.data?.error) {
        if (error.response.data.error.includes('already been created')) {
          // Tournament already started, still complete the setup
          onSetupComplete();
        } else {
          onError(`Error starting tournament: ${error.response.data.error}`);
        }
      } else {
        onError('Failed to start tournament. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSetup = () => {
    // Complete setup without starting tournament
    onSetupComplete();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <i className="fas fa-check-circle text-success"></i>;
      case 'optional':
        return <i className="fas fa-info-circle text-info"></i>;
      case 'missing':
        return <i className="fas fa-exclamation-circle text-warning"></i>;
      case 'error':
        return <i className="fas fa-times-circle text-danger"></i>;
      default:
        return <i className="fas fa-circle text-muted"></i>;
    }
  };

  const getStatusBadge = (status, count) => {
    switch (status) {
      case 'complete':
        return <Badge bg="success">{count} Created</Badge>;
      case 'optional':
        return <Badge bg="secondary">{count === 0 ? 'Optional' : `${count} Created`}</Badge>;
      case 'missing':
        return <Badge bg="warning">Missing</Badge>;
      case 'error':
        return <Badge bg="danger">Error</Badge>;
      default:
        return <Badge bg="light">Unknown</Badge>;
    }
  };

  if (!tournamentData?.tournament_id) {
    return (
      <Alert variant="warning">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Please complete the previous setup steps first.
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h5 className="text-primary mb-2">
          <i className="fas fa-flag-checkered me-2"></i>
          Ready to Start "{tournamentData.tournament_name}"
        </h5>
        <p className="text-muted">
          Review your tournament setup and initialize the bracket system to begin competition.
        </p>
      </div>

      {/* Validation Results */}
      {validationResults && (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">
              <i className="fas fa-clipboard-check me-2"></i>
              Tournament Setup Validation
            </h6>
          </Card.Header>
          <Card.Body>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                  <div className="d-flex align-items-center">
                    {getStatusIcon(validationResults.tournament.status)}
                    <span className="ms-2 fw-bold">Tournament Info</span>
                  </div>
                  <Badge bg="success">Complete</Badge>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                  <div className="d-flex align-items-center">
                    {getStatusIcon(validationResults.divisions.status)}
                    <span className="ms-2 fw-bold">Divisions</span>
                  </div>
                  {getStatusBadge(validationResults.divisions.status, validationResults.divisions.count)}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                  <div className="d-flex align-items-center">
                    {getStatusIcon(validationResults.mats.status)}
                    <span className="ms-2 fw-bold">Competition Mats</span>
                  </div>
                  {getStatusBadge(validationResults.mats.status, validationResults.mats.count)}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                  <div className="d-flex align-items-center">
                    {getStatusIcon(validationResults.competitors.status)}
                    <span className="ms-2 fw-bold">Competitors</span>
                  </div>
                  {getStatusBadge(validationResults.competitors.status, validationResults.competitors.count)}
                </div>
              </div>
            </div>

            {/* Errors */}
            {validationResults.readiness.errors.length > 0 && (
              <Alert variant="danger" className="mt-3">
                <strong>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Issues Found:
                </strong>
                <ul className="mb-0 mt-2">
                  {validationResults.readiness.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Warnings */}
            {validationResults.readiness.warnings.length > 0 && (
              <Alert variant="warning" className="mt-3">
                <strong>
                  <i className="fas fa-info-circle me-2"></i>
                  Recommendations:
                </strong>
                <ul className="mb-0 mt-2">
                  {validationResults.readiness.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Ready Status */}
            {readyToStart ? (
              <Alert variant="success" className="mt-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-check-circle me-3 fa-2x"></i>
                  <div>
                    <strong>Tournament Ready!</strong>
                    <br />
                    <small>Your tournament setup is complete and ready to begin.</small>
                  </div>
                </div>
              </Alert>
            ) : (
              <Alert variant="danger" className="mt-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-times-circle me-3 fa-2x"></i>
                  <div>
                    <strong>Setup Incomplete</strong>
                    <br />
                    <small>Please resolve the issues above before starting the tournament.</small>
                  </div>
                </div>
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      {/* What happens next */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            <i className="fas fa-play me-2"></i>
            What Happens When You Start?
          </h6>
        </Card.Header>
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                     style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                  1
                </div>
                <div>
                  <strong>Initialize Brackets</strong>
                  <br />
                  <small className="text-muted">Create tournament brackets for all divisions</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                     style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                  2
                </div>
                <div>
                  <strong>Open Management Dashboard</strong>
                  <br />
                  <small className="text-muted">Access full tournament controls and bracket management</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                     style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                  3
                </div>
                <div>
                  <strong>Mat Assignments</strong>
                  <br />
                  <small className="text-muted">Assign divisions to competition mats</small>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                     style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                  4
                </div>
                <div>
                  <strong>Competition Begins</strong>
                  <br />
                  <small className="text-muted">Track matches and update brackets in real-time</small>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center gap-3 mt-4">
        <Button 
          variant="outline-secondary"
          onClick={handleFinishSetup}
        >
          <i className="fas fa-save me-2"></i>
          Finish Setup Later
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
            variant="danger" 
            onClick={handleStartTournament}
            disabled={!readyToStart || loading}
            className="fw-bold"
            style={{
              boxShadow: readyToStart ? '0 4px 15px rgba(220, 53, 69, 0.4)' : 'none'
            }}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Starting Tournament...
              </>
            ) : (
              <>
                <i className="fas fa-rocket me-2"></i>
                🚀 START TOURNAMENT
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
              <strong>Note:</strong> Once started, the tournament will have initial brackets created for all divisions. 
              You can still add competitors and make adjustments from the tournament dashboard.
              <br />
              <small className="text-muted">
                If you're not ready to start immediately, choose "Finish Setup Later" and you can start the tournament from the main dashboard when ready.
              </small>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default SetupStart;