import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProgressBar = ({ currentStep, completedSteps, tournamentData }) => {
  const navigate = useNavigate();

  const steps = [
    { id: 1, name: 'Tournament', icon: 'fas fa-trophy', route: 'tournament' },
    { id: 2, name: 'Divisions', icon: 'fas fa-layer-group', route: 'divisions' },
    { id: 3, name: 'Mats', icon: 'fas fa-map', route: 'mats' },
    { id: 4, name: 'Competitors', icon: 'fas fa-users', route: 'competitors' },
    { id: 5, name: 'Start', icon: 'fas fa-play', route: 'start' }
  ];

  const handleStepClick = (step) => {
    // Only allow navigation to completed steps or current step
    if (step.id <= Math.max(...completedSteps, currentStep)) {
      const baseUrl = '/tournament-setup';
      const params = new URLSearchParams();
      
      // Pass tournament data through URL params
      if (tournamentData?.tournament_id) {
        params.set('tournament_id', tournamentData.tournament_id);
      }
      if (tournamentData?.tournament_name) {
        params.set('tournament_name', tournamentData.tournament_name);
      }
      
      const queryString = params.toString();
      const url = queryString ? `${baseUrl}/${step.route}?${queryString}` : `${baseUrl}/${step.route}`;
      
      navigate(url);
    }
  };

  const getStepStatus = (step) => {
    if (completedSteps.includes(step.id)) {
      return 'completed';
    } else if (step.id === currentStep) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-white';
      case 'current':
        return 'bg-primary text-white';
      default:
        return 'bg-light text-muted';
    }
  };

  const getConnectorColor = (stepId) => {
    return completedSteps.includes(stepId) ? 'bg-success' : 'bg-secondary';
  };

  return (
    <div className="progress-bar-modern mb-4">
      <div className="d-flex justify-content-between align-items-center position-relative">
        {/* Progress Line */}
        <div className="position-absolute w-100" style={{ top: '24px', left: '0', right: '0', zIndex: 1 }}>
          <div className="d-flex">
            {steps.slice(0, -1).map((step, index) => (
              <div key={step.id} className="flex-grow-1 d-flex align-items-center">
                <div className="flex-grow-1 mx-3">
                  <div 
                    className={`progress-connector ${getConnectorColor(step.id)}`}
                    style={{ height: '3px', borderRadius: '2px' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isClickable = step.id <= Math.max(...completedSteps, currentStep);
          
          return (
            <div key={step.id} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 2 }}>
              <div
                className={`step-circle d-flex align-items-center justify-content-center rounded-circle border-2 ${getStepColor(status)} ${isClickable ? 'step-clickable' : ''}`}
                style={{
                  width: '48px',
                  height: '48px',
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  boxShadow: status === 'current' ? '0 0 0 3px rgba(13, 110, 253, 0.25)' : 'none'
                }}
                onClick={() => handleStepClick(step)}
                title={isClickable ? `Go to ${step.name}` : step.name}
              >
                {status === 'completed' ? (
                  <i className="fas fa-check" style={{ fontSize: '18px' }}></i>
                ) : (
                  <i className={step.icon} style={{ fontSize: '16px' }}></i>
                )}
              </div>
              <small 
                className={`mt-2 fw-bold text-center ${
                  status === 'completed' ? 'text-success' : 
                  status === 'current' ? 'text-primary' : 
                  'text-muted'
                }`}
                style={{ minWidth: '80px', fontSize: '12px' }}
              >
                {step.name}
              </small>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .step-clickable:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) !important;
        }
        
        .progress-connector {
          transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .step-circle {
            width: 40px !important;
            height: 40px !important;
          }
          
          .step-circle i {
            font-size: 14px !important;
          }
          
          .progress-bar-modern small {
            font-size: 10px !important;
            min-width: 60px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;