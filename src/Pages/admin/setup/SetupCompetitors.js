import React, { useState, useEffect } from 'react';
import { Button, Alert, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';
import { link } from '../../../constant';

const SetupCompetitors = ({ tournamentData, onStepComplete, onError }) => {
  const [divisions, setDivisions] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentStats, setAssignmentStats] = useState({
    totalDivisions: 0,
    divisionsWithCompetitors: 0,
    totalCompetitors: 0
  });

  useEffect(() => {
    fetchDivisionsAndCompetitors();
  }, []);

  const fetchDivisionsAndCompetitors = async () => {
    if (!tournamentData?.tournament_id) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        onError('Access token not found. Please log in again.');
        return;
      }

      // Fetch divisions for this tournament
      const divisionsResponse = await axios.get(`${link}/divisions/`, {
        headers: { accessToken: accessToken },
        params: { tournament_id: tournamentData.tournament_id }
      });

      // Fetch all competitors for this account
      const competitorsResponse = await axios.get(`${link}/participants/users`, {
        headers: { accessToken: accessToken }
      });

      setDivisions(divisionsResponse.data || []);
      setCompetitors(competitorsResponse.data || []);

      // Calculate assignment statistics
      calculateAssignmentStats(divisionsResponse.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      onError('Failed to load divisions and competitors.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAssignmentStats = async (divisionsList) => {
    if (!divisionsList || divisionsList.length === 0) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      let totalCompetitors = 0;
      let divisionsWithCompetitors = 0;

      // Check each division for participants
      for (const division of divisionsList) {
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
          // Division has no participants, which is fine
        }
      }

      setAssignmentStats({
        totalDivisions: divisionsList.length,
        divisionsWithCompetitors: divisionsWithCompetitors,
        totalCompetitors: totalCompetitors
      });
    } catch (error) {
      console.error('Error calculating assignment stats:', error);
    }
  };

  const handleManualAssignment = (divisionId) => {
    // Navigate to the AddCompetitors page for this division
    window.open(`/AddCompetitors/${divisionId}`, '_blank');
  };

  const handleSkipAssignment = () => {
    // Allow skipping competitor assignment - can be done later
    onStepComplete(4, {
      competitors_assigned: assignmentStats.totalCompetitors,
      skipped: true
    });
  };

  const handleContinueToStart = () => {
    if (assignmentStats.totalCompetitors === 0) {
      onError('Warning: No competitors have been assigned to divisions. The tournament can still be created, but you will need to add competitors before starting matches.');
    }
    
    onStepComplete(4, {
      competitors_assigned: assignmentStats.totalCompetitors
    });
  };

  if (!tournamentData?.tournament_id) {
    return (
      <Alert variant="warning">
        <i className="fas fa-exclamation-triangle me-2"></i>
        Please complete the previous setup steps first.
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" />
        <p className="mt-3">Loading divisions and competitors...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h5 className="text-primary mb-2">
          <i className="fas fa-users me-2"></i>
          Assign Competitors to "{tournamentData.tournament_name}"
        </h5>
        <p className="text-muted">
          Now assign your competitors to the appropriate divisions. Competitors will be matched based on their division assignments.
        </p>
      </div>

      {/* Assignment Statistics */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="text-center border-primary">
            <Card.Body>
              <div className="display-6 text-primary">
                <i className="fas fa-layer-group"></i>
              </div>
              <h4 className="text-primary">{assignmentStats.totalDivisions}</h4>
              <small className="text-muted">Total Divisions</small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center border-success">
            <Card.Body>
              <div className="display-6 text-success">
                <i className="fas fa-check-circle"></i>
              </div>
              <h4 className="text-success">{assignmentStats.divisionsWithCompetitors}</h4>
              <small className="text-muted">Divisions with Competitors</small>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center border-info">
            <Card.Body>
              <div className="display-6 text-info">
                <i className="fas fa-users"></i>
              </div>
              <h4 className="text-info">{assignmentStats.totalCompetitors}</h4>
              <small className="text-muted">Total Competitors Assigned</small>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Available Competitors Summary */}
      <Alert variant="info" className="mb-4">
        <div className="d-flex align-items-center">
          <i className="fas fa-info-circle me-3"></i>
          <div>
            <strong>Available Competitors:</strong> You have {competitors.length} competitors in your account that can be assigned to divisions.
            <br />
            <small>
              Click on individual divisions below to assign competitors, or skip this step and assign competitors later from the tournament dashboard.
            </small>
          </div>
        </div>
      </Alert>

      {/* Divisions List */}
      {divisions.length > 0 ? (
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Tournament Divisions ({divisions.length})
            </h6>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Division</th>
                    <th className="text-center">Age Group</th>
                    <th className="text-center">Level</th>
                    <th className="text-center">Category</th>
                    <th className="text-center">Competitors</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {divisions.map((division, index) => (
                    <tr key={division.division_id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                               style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="fw-bold">{division.gender} {division.category}</div>
                            <small className="text-muted">Division #{division.division_id}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-warning text-dark">{division.age_group}</span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${
                          division.proficiency_level === 'Beginner' ? 'bg-success' :
                          division.proficiency_level === 'Intermediate' ? 'bg-warning text-dark' :
                          'bg-danger'
                        }`}>
                          {division.proficiency_level}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-secondary">{division.category}</span>
                      </td>
                      <td className="text-center">
                        <span className="text-muted">
                          <i className="fas fa-users me-1"></i>
                          Click to assign
                        </span>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleManualAssignment(division.division_id)}
                        >
                          <i className="fas fa-user-plus me-1"></i>
                          Assign Competitors
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          No divisions found. Please go back and create divisions first.
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center gap-3 mt-4">
        <Button 
          variant="outline-secondary"
          onClick={handleSkipAssignment}
        >
          <i className="fas fa-forward me-2"></i>
          Skip for Now
        </Button>

        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => window.history.back()}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back
          </Button>
          <Button 
            variant="primary" 
            onClick={handleContinueToStart}
          >
            <i className="fas fa-arrow-right me-2"></i>
            Continue to Start Tournament
            {assignmentStats.totalCompetitors > 0 && (
              <span className="badge bg-light text-dark ms-2">{assignmentStats.totalCompetitors}</span>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Alert variant="light" className="border">
          <div className="d-flex align-items-start">
            <i className="fas fa-lightbulb text-warning me-3 mt-1"></i>
            <div>
              <strong>Note:</strong> You can assign competitors now or later from the tournament dashboard. 
              Each division needs at least 2 competitors to generate brackets and start matches.
              <br />
              <small className="text-muted">
                Use the "Assign Competitors" button to open the competitor assignment page for each division.
              </small>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default SetupCompetitors;