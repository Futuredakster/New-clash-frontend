import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { link } from '../../constant';
import ProgressBar from '../../components/ProgressBar';

// Step Components
import SetupTournament from './setup/SetupTournament';
import SetupDivisions from './setup/SetupDivisions';
import SetupMats from './setup/SetupMats';
import SetupCompetitors from './setup/SetupCompetitors';
import SetupStart from './setup/SetupStart';

const TournamentSetup = () => {
  const { step } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse URL parameters
  const queryParams = new URLSearchParams(location.search);
  const tournament_id = queryParams.get('tournament_id');
  const tournament_name = queryParams.get('tournament_name');

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [tournamentData, setTournamentData] = useState({
    tournament_id: tournament_id || null,
    tournament_name: tournament_name || null
  });
  const [error, setError] = useState('');

  // Step mapping
  const stepMapping = {
    'tournament': 1,
    'divisions': 2,
    'mats': 3,
    'competitors': 4,
    'start': 5
  };

  const reverseStepMapping = {
    1: 'tournament',
    2: 'divisions',
    3: 'mats',
    4: 'competitors',
    5: 'start'
  };

  // Update current step based on URL
  useEffect(() => {
    console.log('URL step:', step);
    if (step && stepMapping[step]) {
      console.log('Setting current step to:', stepMapping[step]);
      setCurrentStep(stepMapping[step]);
    } else {
      console.log('No valid step found, redirecting to tournament');
      // Default to step 1 if no valid step in URL
      navigate('/tournament-setup/tournament', { replace: true });
    }
  }, [step, navigate]);

  // Update tournament data when URL params change
  useEffect(() => {
    setTournamentData(prev => ({
      ...prev,
      tournament_id: tournament_id || prev.tournament_id,
      tournament_name: tournament_name || prev.tournament_name
    }));
  }, [tournament_id, tournament_name]);

  // Initialize completed steps based on tournament data
  useEffect(() => {
    const validateCompletedSteps = async () => {
      const completed = [];
      
      // If we have tournament data, mark step 1 as completed
      if (tournamentData.tournament_id) {
        completed.push(1);
        
        // Check if divisions exist - mark step 2 as completed
        try {
          const accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            const divisionsResponse = await axios.get(`${link}/divisions/`, {
              headers: { accessToken: accessToken },
              params: { tournament_id: tournamentData.tournament_id }
            });
            
            if (divisionsResponse.data && divisionsResponse.data.length > 0) {
              completed.push(2);
              
              // Check if mats exist - mark step 3 as completed
              try {
                const matsResponse = await axios.get(`${link}/mats/`, {
                  headers: { accessToken: accessToken },
                  params: { tournament_id: tournamentData.tournament_id }
                });
                
                if (matsResponse.data && matsResponse.data.length > 0) {
                  completed.push(3);
                }
              } catch (error) {
                // Mats don't exist, that's okay
              }
              
              // Check if any competitors are assigned - mark step 4 as completed
              let hasCompetitors = false;
              for (const division of divisionsResponse.data) {
                try {
                  const participantResponse = await axios.get(`${link}/participants/user`, {
                    headers: { accessToken: accessToken },
                    params: { division_id: division.division_id }
                  });
                  
                  if (participantResponse.data?.participants?.length > 0) {
                    hasCompetitors = true;
                    break;
                  }
                } catch (error) {
                  // No participants in this division
                }
              }
              
              if (hasCompetitors) {
                completed.push(4);
              }
              
              // Check if tournament has been started (brackets exist)
              try {
                const bracketsResponse = await axios.get(`${link}/brackets/tournament-status/${tournamentData.tournament_id}`);
                if (bracketsResponse.data?.hasbrackets) {
                  completed.push(5);
                }
              } catch (error) {
                // Tournament not started
              }
            }
          }
        } catch (error) {
          // No divisions exist
        }
      }
      
      setCompletedSteps(completed);
    };
    
    if (tournamentData.tournament_id) {
      validateCompletedSteps();
    }
  }, [tournamentData.tournament_id]);

  // Handle step completion
  const handleStepComplete = (stepNumber, data = {}) => {
    // Mark step as completed
    setCompletedSteps(prev => {
      if (!prev.includes(stepNumber)) {
        return [...prev, stepNumber];
      }
      return prev;
    });

    // Update tournament data with new information
    setTournamentData(prev => ({
      ...prev,
      ...data
    }));

    // Navigate to next step
    const nextStep = stepNumber + 1;
    if (nextStep <= 5) {
      const nextStepRoute = reverseStepMapping[nextStep];
      const params = new URLSearchParams();
      
      // Pass updated tournament data to next step
      const updatedData = { ...tournamentData, ...data };
      if (updatedData.tournament_id) {
        params.set('tournament_id', updatedData.tournament_id);
      }
      if (updatedData.tournament_name) {
        params.set('tournament_name', updatedData.tournament_name);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/tournament-setup/${nextStepRoute}?${queryString}` : `/tournament-setup/${nextStepRoute}`;
      
      navigate(url);
    }
  };

  // Handle setup completion (from final step)
  const handleSetupComplete = () => {
    // Navigate to SeeDivisions with workflow completion indicator
    const params = new URLSearchParams();
    params.set('tournament_name', tournamentData.tournament_name);
    params.set('tournament_id', tournamentData.tournament_id);
    params.set('workflow', 'setup_completed');
    
    navigate(`/seeDivisions?${params.toString()}`);
  };

  // Render current step component
  const renderCurrentStep = () => {
    const commonProps = {
      tournamentData,
      onStepComplete: handleStepComplete,
      onError: setError
    };

    switch (currentStep) {
      case 1:
        return <SetupTournament {...commonProps} />;
      case 2:
        return <SetupDivisions {...commonProps} />;
      case 3:
        return <SetupMats {...commonProps} />;
      case 4:
        return <SetupCompetitors {...commonProps} />;
      case 5:
        return <SetupStart {...commonProps} onSetupComplete={handleSetupComplete} />;
      default:
        return <div className="text-center">Invalid step</div>;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Create Tournament';
      case 2: return 'Setup Divisions';
      case 3: return 'Create Mats';
      case 4: return 'Assign Competitors';
      case 5: return 'Start Tournament';
      default: return 'Tournament Setup';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Create your karate tournament with basic information';
      case 2: return 'Define divisions to organize your competitors';
      case 3: return 'Set up competition mats for your tournament';
      case 4: return 'Assign competitors to their appropriate divisions';
      case 5: return 'Initialize brackets and start your tournament';
      default: return 'Complete tournament setup process';
    }
  };

  return (
    <Container fluid className={`fade-in ${(currentStep === 2 || currentStep === 4) ? 'px-1' : 'px-3'}`}>
      <Helmet>
        <title>{getStepTitle()} - Tournament Setup</title>
        <meta name="description" content="Multi-step tournament setup wizard" />
      </Helmet>

      <Row>
        <Col>
          <div className="page-header-modern">
            <h1 className="page-title-modern">
              <i className="fas fa-magic me-3"></i>
              Tournament Setup Wizard
            </h1>
            <p className="page-subtitle-modern">
              Follow the guided steps to set up your karate tournament
            </p>
          </div>

          {/* Progress Bar */}
          <ProgressBar 
            currentStep={currentStep}
            completedSteps={completedSteps}
            tournamentData={tournamentData}
          />

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Card className="card-modern" style={(currentStep === 2 || currentStep === 4) ? {width: '100%'} : {}}>
            <Card.Header className="card-modern-header">
              <div className="d-flex align-items-center">
                <div>
                  <h4 className="mb-0">{getStepTitle()}</h4>
                </div>
              </div>
            </Card.Header>
            <Card.Body className={`card-modern-body ${(currentStep === 2 || currentStep === 4) ? 'p-2' : 'p-4'}`} style={(currentStep === 2 || currentStep === 4) ? {width: '100%'} : {}}>
              <div style={(currentStep === 2 || currentStep === 4) ? {width: '100%'} : {}}>
                {renderCurrentStep()}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TournamentSetup;