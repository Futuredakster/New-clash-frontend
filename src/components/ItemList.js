import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { link } from './constant';

const ItemList = ({ items, accountId }) => {
  const accessToken = localStorage.getItem("accessToken");
  const [tournamentSetupStates, setTournamentSetupStates] = useState(new Map());
  const navigate = useNavigate();

  // Initialize tournament setup states without API calls - check only when needed
  useEffect(() => {
    if (!items || items.length === 0) return;
    
    const setupStates = new Map();
    
    // Default all tournaments to "Resume Setup" - we'll check actual progress when user clicks
    items.forEach(item => {
      setupStates.set(item.tournament_id, { nextStep: 'divisions', stepName: 'Resume Setup' });
    });
    
    setTournamentSetupStates(setupStates);
  }, [items]);

  // Function to determine where user left off in setup
  const determineSetupProgress = async (tournamentId) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        return { nextStep: 'tournament', stepName: 'Resume Setup' };
      }

      // First check if tournament has already been started (has brackets)
      try {
        const bracketResponse = await axios.get(`${link}/brackets/tournament-status/${tournamentId}`);
        if (bracketResponse.data?.hasbrackets) {
          // Tournament has been started, mark as completed
          return { nextStep: 'completed', stepName: 'Complete' };
        }
      } catch (error) {
        // No brackets exist, continue checking setup progress
      }

      // Step 1: Tournament exists (we know it does since we're checking existing tournaments)
      // Step 2: Check if divisions exist
      let divisionsExist = false;
      try {
        const divisionsResponse = await axios.get(`${link}/divisions/`, {
          headers: { accessToken: accessToken },
          params: { tournament_id: tournamentId }
        });
        divisionsExist = divisionsResponse.data && divisionsResponse.data.length > 0;
      } catch (error) {
        // No divisions
      }

      if (!divisionsExist) {
        return { nextStep: 'divisions', stepName: 'Setup Divisions' };
      }

      // Step 3: Check if mats exist
      let matsExist = false;
      try {
        const matsResponse = await axios.get(`${link}/mats/`, {
          headers: { accessToken: accessToken },
          params: { tournament_id: tournamentId }
        });
        matsExist = matsResponse.data && matsResponse.data.length > 0;
      } catch (error) {
        // No mats, but that's optional
      }

      // Step 4: Check if any competitors are assigned
      let competitorsAssigned = false;
      try {
        const divisionsResponse = await axios.get(`${link}/divisions/`, {
          headers: { accessToken: accessToken },
          params: { tournament_id: tournamentId }
        });

        for (const division of divisionsResponse.data || []) {
          try {
            const participantResponse = await axios.get(`${link}/participants/user`, {
              headers: { accessToken: accessToken },
              params: { division_id: division.division_id }
            });
            
            if (participantResponse.data?.participants?.length > 0) {
              competitorsAssigned = true;
              break;
            }
          } catch (error) {
            // No participants in this division
          }
        }
      } catch (error) {
        // Error checking competitors
      }

      // Determine next step based on what's missing
      if (!matsExist && !competitorsAssigned) {
        return { nextStep: 'mats', stepName: 'Setup Mats' };
      } else if (!competitorsAssigned) {
        return { nextStep: 'competitors', stepName: 'Assign Competitors' };
      } else {
        return { nextStep: 'start', stepName: 'Start Tournament' };
      }

    } catch (error) {
      console.error('Error determining setup progress:', error);
      return { nextStep: 'tournament', stepName: 'Resume Setup' };
    }
  };


const seeDivision = (tournamentName, tournamentId) =>{
  const queryString = new URLSearchParams({ tournament_name: tournamentName, tournament_id:tournamentId}).toString();
  navigate(`/seeDivisions?${queryString}`);
}

const handleResumeSetup = async (item) => {
  // First check if we already know it's completed
  const currentSetupState = tournamentSetupStates.get(item.tournament_id);
  if (currentSetupState?.nextStep === 'completed') {
    return;
  }

  // Update UI to show we're checking progress
  const updatedStates = new Map(tournamentSetupStates);
  updatedStates.set(item.tournament_id, { nextStep: 'divisions', stepName: 'Checking...' });
  setTournamentSetupStates(updatedStates);

  try {
    // Determine actual progress
    const progressState = await determineSetupProgress(item.tournament_id);
    
    // Update the state with actual progress
    updatedStates.set(item.tournament_id, progressState);
    setTournamentSetupStates(updatedStates);

    // Navigate to the appropriate step
    const params = new URLSearchParams();
    params.set('tournament_id', item.tournament_id);
    params.set('tournament_name', item.tournament_name);
    
    const url = `/tournament-setup/${progressState.nextStep}?${params.toString()}`;
    navigate(url);
  } catch (error) {
    console.error('Error determining setup progress:', error);
    // Fallback to divisions step
    const fallbackStates = new Map(tournamentSetupStates);
    fallbackStates.set(item.tournament_id, { nextStep: 'divisions', stepName: 'Resume Setup' });
    setTournamentSetupStates(fallbackStates);
    
    const params = new URLSearchParams();
    params.set('tournament_id', item.tournament_id);
    params.set('tournament_name', item.tournament_name);
    
    const url = `/tournament-setup/divisions?${params.toString()}`;
    navigate(url);
  }
}

  const onPublish = (tournament_id) => {
    if (!accessToken) {
      console.error('Access token not found. Delete request cannot be made.');
      return;
    }

    axios.patch(
      `${link}/tournaments/publish`,
      {
        tournament_id: tournament_id,
      },
      {
        headers: {
          accessToken: accessToken,
        },
      }
    )
      .then(response => {
        console.log(response.data);
        console.log('Tournament posted successfully.');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error posting tournament:', error);
      })
    }
  const onDelete = (tournament_id) => {
    if (!accessToken) {
      console.error('Access token not found. Delete request cannot be made.');
      return;
    }

    axios.delete(`${link}/tournaments`, {
      headers: {
        accessToken: accessToken,
      },
      data: {
        tournament_id: tournament_id,
      }
    })
      .then(response => {
        console.log(response.data);
        console.log('Tournament deleted successfully.');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error deleting tournament:', error);
      });
  };

  
  
  return (
    <div className="w-100">
      {/* Add styles for clickable rows */}
      <style jsx>{`
        .table-row-clickable:hover {
          background-color: #f8f9fa !important;
          border-left: 4px solid #0d6efd !important;
          transform: translateX(2px);
          transition: all 0.2s ease;
        }
        
        .mobile-card-clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
          border-left: 4px solid #0d6efd !important;
          transition: all 0.2s ease;
        }
        
        .mobile-card-clickable {
          transition: all 0.2s ease;
        }
      `}</style>
      {/* Desktop Table View */}
      <div className="d-none d-lg-block" style={{width: '100%'}}>
        <div className="card border-0 shadow-sm" style={{width: '100%', maxWidth: 'none'}}>
          <div className="card-header bg-white border-0 py-3" style={{paddingTop: '1rem'}}>
            <h5 className="mb-0 d-flex align-items-center">
              <i className="fas fa-trophy me-2 text-primary"></i>
              Tournaments Overview
              <span className="badge bg-light text-dark ms-2" style={{verticalAlign: 'baseline', lineHeight: '1'}}>{items.length}</span>
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive" style={{width: '100%'}}>
              <table className="table table-hover mb-0" style={{width: '100%', minWidth: '100%', tableLayout: 'auto'}}>
                <thead className="bg-light">
                  <tr>
                    <th className="border-0 py-3 ps-4" style={{width: '25%', minWidth: '200px'}}>
                      <i className="fas fa-calendar-alt me-2 text-muted"></i>Tournament
                    </th>
                    <th className="border-0 py-3" style={{width: '15%', minWidth: '120px'}}>
                      <i className="fas fa-play-circle me-2 text-muted"></i>Start Date
                    </th>
                    <th className="border-0 py-3" style={{width: '15%', minWidth: '120px'}}>
                      <i className="fas fa-stop-circle me-2 text-muted"></i>End Date
                    </th>
                    <th className="border-0 py-3 text-center" style={{width: '15%', minWidth: '130px'}}>
                      <i className="fas fa-layer-group me-2 text-muted"></i>Divisions
                    </th>
                    <th className="border-0 py-3 text-center" style={{width: '15%', minWidth: '100px'}}>
                      <i className="fas fa-cog me-2 text-muted"></i>Actions
                    </th>
                    <th className="border-0 py-3 pe-4 text-center" style={{width: '20%', minWidth: '100px'}}>
                      <i className="fas fa-broadcast-tower me-2 text-muted"></i>Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const setupState = tournamentSetupStates.get(item.tournament_id);
                    const isClickable = accountId === item.account_id && setupState && setupState.nextStep !== 'completed';
                    
                    return (
                    <tr 
                      key={index} 
                      className={`slide-up align-middle ${isClickable ? 'table-row-clickable' : ''}`}
                      style={{
                        borderLeft: '4px solid transparent',
                        cursor: isClickable ? 'pointer' : 'default'
                      }}
                      onClick={() => {
                        if (isClickable) {
                          handleResumeSetup(item);
                        }
                      }}
                      title={isClickable ? `Click to continue setup: ${setupState.stepName}` : ''}
                    >
                      <td className="py-4 ps-4">
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.tournament_name} 
                                className="rounded-circle border"
                                style={{width: '40px', height: '40px', objectFit: 'cover'}}
                              />
                            ) : (
                              <div className="bg-light d-flex align-items-center justify-content-center rounded-circle border" 
                                   style={{width: '40px', height: '40px'}}>
                                <i className="fas fa-trophy text-muted"></i>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <div className="fw-bold text-dark me-2">{item.tournament_name}</div>
                              {(() => {
                                const setupState = tournamentSetupStates.get(item.tournament_id);
                                if (setupState && setupState.nextStep !== 'completed' && accountId === item.account_id) {
                                  return (
                                    <span className="badge bg-primary" style={{fontSize: '10px', padding: '2px 6px'}}>
                                      <i className="fas fa-mouse-pointer me-1" style={{fontSize: '8px'}}></i>
                                      Click to Setup
                                    </span>
                                  );
                                } else if (setupState && setupState.nextStep === 'completed') {
                                  return (
                                    <span className="badge bg-success" style={{fontSize: '10px', padding: '2px 6px'}}>
                                      <i className="fas fa-check me-1" style={{fontSize: '8px'}}></i>
                                      Complete
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            <small className="text-muted">
                              <i className="fas fa-calendar me-1"></i>
                              {item.signup_duedate ? new Date(item.signup_duedate).toLocaleDateString() : 'No deadline set'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-dark">
                          {new Date(item.start_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <small className="text-muted">
                          {new Date(item.start_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </td>
                      <td className="py-4">
                        <div className="text-dark">
                          {new Date(item.end_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <small className="text-muted">
                          {new Date(item.end_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </td>
                      <td className="py-4 text-center">
                        {accountId === item.account_id ? (
                          <button 
                            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center" 
                            onClick={(e) => {
                              e.stopPropagation();
                              seeDivision(item.tournament_name,item.tournament_id);
                            }}
                            style={{borderRadius: '20px'}}
                          > 
                            <i className="fas fa-eye me-2"></i>
                            <span>View Divisions</span>
                          </button>
                        ):( 
                          <span className="text-muted small d-inline-flex align-items-center">
                            <i className="fas fa-lock me-1"></i>Restricted
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {accountId === item.account_id ? (
                          <button 
                            className="btn btn-outline-danger btn-sm d-inline-flex align-items-center" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item.tournament_id);
                            }}
                            style={{borderRadius: '20px'}}
                            title="Delete Tournament"
                          >
                            <i className="fas fa-trash me-2"></i>
                            <span>Delete</span>
                          </button>
                        ) : (
                          <span className="text-muted small d-inline-flex align-items-center">
                            <i className="fas fa-ban me-1"></i>N/A
                          </span>
                        )}
                      </td>
                      <td className="py-4 pe-4 text-center" onClick={(e) => e.stopPropagation()}>
                        {item.is_published === false ? (
                          <button 
                            className="btn btn-outline-warning btn-sm d-inline-flex align-items-center" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onPublish(item.tournament_id);
                            }}
                            style={{borderRadius: '20px'}}
                          >
                            <i className="fas fa-paper-plane me-2"></i>
                            <span>Publish</span>
                          </button>
                        ) : (
                          <span className="badge bg-success d-inline-flex align-items-center" style={{borderRadius: '20px', padding: '8px 12px'}}>
                            <i className="fas fa-check-circle me-2"></i>Published
                          </span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="d-lg-none">
        {items.map((item, index) => {
          const setupState = tournamentSetupStates.get(item.tournament_id);
          const isClickable = accountId === item.account_id && setupState && setupState.nextStep !== 'completed';
          
          return (
          <div 
            key={index} 
            className={`card mobile-tournament-card slide-up ${isClickable ? 'mobile-card-clickable' : ''}`}
            style={{
              cursor: isClickable ? 'pointer' : 'default'
            }}
            onClick={() => {
              if (isClickable) {
                handleResumeSetup(item);
              }
            }}
            title={isClickable ? `Tap to continue setup: ${setupState.stepName}` : ''}
          >
            {/* Card Header */}
            <div className="mobile-tournament-header">
              <div className="row align-items-center g-3">
                <div className="col-auto">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.tournament_name} 
                      className="mobile-tournament-image"
                    />
                  ) : (
                    <div className="mobile-tournament-placeholder">
                      <i className="fas fa-trophy text-muted"></i>
                    </div>
                  )}
                </div>
                <div className="col">
                  <div className="d-flex align-items-center mb-1">
                    <h6 className="mobile-tournament-title me-2 mb-0">{item.tournament_name}</h6>
                    {(() => {
                      const setupState = tournamentSetupStates.get(item.tournament_id);
                      if (setupState && setupState.nextStep !== 'completed' && accountId === item.account_id) {
                        return (
                          <span className="badge bg-primary" style={{fontSize: '9px', padding: '2px 4px'}}>
                            <i className="fas fa-hand-pointer me-1" style={{fontSize: '7px'}}></i>
                            Tap to Setup
                          </span>
                        );
                      } else if (setupState && setupState.nextStep === 'completed') {
                        return (
                          <span className="badge bg-success" style={{fontSize: '9px', padding: '2px 4px'}}>
                            <i className="fas fa-check me-1" style={{fontSize: '7px'}}></i>
                            Complete
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="mobile-tournament-dates">
                    <div className="col-12">
                      <i className="fas fa-calendar-start me-1"></i>
                      <strong>Start:</strong> {new Date(item.start_date).toLocaleDateString()}
                    </div>
                    <div className="col-12">
                      <i className="fas fa-calendar-end me-1"></i>
                      <strong>End:</strong> {new Date(item.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card Content */}
            <div className="mobile-tournament-content">
              <div className="row text-center g-2">
                <div className="col-6">
                  <small className="text-muted d-block">Divisions</small>
                  <span className="badge bg-success">Divisions</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Status</small>
                  {item.is_published === false ? (
                    <span className="badge bg-warning">Draft</span>
                  ) : (
                    <span className="badge bg-success">Published</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Card Actions */}
            <div className="mobile-tournament-actions">
              <div className="row g-2">
                <div className="col-12">
                  {accountId === item.account_id ? (
                    <button 
                      className="btn btn-modern btn-sm w-100" 
                      onClick={(e) => {
                        e.stopPropagation();
                        seeDivision(item.tournament_name,item.tournament_id);
                      }}
                    > 
                      <i className="fas fa-eye me-1"></i>
                      <span className="d-none d-sm-inline">View </span>Divisions
                    </button>
                  ):( 
                    <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                      <i className="fas fa-lock me-1"></i>Restricted
                    </button>
                  )}
                </div>
              </div>
              
              <div className="row g-2 mt-2">
                <div className="col-6">
                  {item.is_published === false ? (
                    <button 
                      className="btn btn-outline-primary btn-sm w-100" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPublish(item.tournament_id);
                      }}
                    >
                      <i className="fas fa-paper-plane me-1"></i>Publish
                    </button>
                  ) : (
                    <button className="btn btn-outline-success btn-sm w-100" disabled>
                      <i className="fas fa-check me-1"></i>Published
                    </button>
                  )}
                </div>
                <div className="col-6">
                  {accountId === item.account_id ? (
                    <button 
                      className="btn btn-outline-danger btn-sm w-100" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.tournament_id);
                      }}
                      title="Delete Tournament"
                    >
                      <i className="fas fa-trash me-1"></i>
                      Delete
                    </button>
                  ) : (
                    <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                      <i className="fas fa-lock me-1"></i>Protected
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-trophy fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No tournaments found</h5>
          <p className="text-muted">Create your first tournament to get started</p>
        </div>
      )}
      
    </div>
  );
};

export default ItemList;