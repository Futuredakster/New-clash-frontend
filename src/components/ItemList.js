import axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown';
import { useState, useEffect } from 'react';
import CustomModal from './modals/CustomModal';
import { useNavigate } from "react-router-dom";
import { link } from './constant';

const ItemList = ({ items, accountId }) => {
  const accessToken = localStorage.getItem("accessToken");
  const [showModal, setShowModal] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [openStates, setOpenStates] = useState(Array(items.length).fill(false));
  const [startingTournament, setStartingTournament] = useState(null);
  const [startedTournaments, setStartedTournaments] = useState(new Set());
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
          setStartedTournaments(prev => new Set(prev).add(tournamentId));
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

  const handleShowModal = (tournamentId) => {
    setSelectedTournamentId(tournamentId);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTournamentId(null);
  };

  const handleDropdownItemClick = (index, action, ...args) => {
    // Close the dropdown
    const newOpenStates = [...openStates];
    newOpenStates[index] = false;
    setOpenStates(newOpenStates);
    
    // Execute the action
    action(...args);
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

    const startTournament = async (tournament_id) => {
      console.log('START TOURNAMENT clicked for tournament:', tournament_id);
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert('Access token not found. Please log in again.');
        return;
      }

      // Prevent multiple clicks
      if (startingTournament === tournament_id) {
        console.log('Already starting tournament, ignoring click');
        return;
      }

      // First check if tournament has participants by checking divisions
      try {
        console.log('Checking for participants before starting tournament...');
        
        // Get divisions for this tournament
        const divisionsResponse = await axios.get(`${link}/divisions/`, {
          headers: { accessToken: accessToken },
          params: { tournament_id: tournament_id }
        });

        if (!divisionsResponse.data || divisionsResponse.data.length === 0) {
          alert('Cannot start tournament: No divisions found. Please create divisions first.');
          setStartingTournament(null);
          return;
        }

        // Check each division for participants
        let totalParticipants = 0;
        for (const division of divisionsResponse.data) {
          try {
            const participantResponse = await axios.get(`${link}/participants/All`, {
              headers: { accessToken: accessToken },
              params: { division_id: division.division_id }
            });
            if (participantResponse.data && participantResponse.data.length > 0) {
              totalParticipants += participantResponse.data.length;
            }
          } catch (divisionError) {
            console.log(`No participants in division ${division.division_id}`);
          }
        }

        if (totalParticipants === 0) {
          alert('Cannot start tournament: No participants are registered. Please add participants to divisions before starting the tournament.');
          setStartingTournament(null);
          return;
        }

        console.log(`Found ${totalParticipants} participants across all divisions. Proceeding to start tournament...`);
      } catch (participantError) {
        console.error('Error checking participants:', participantError);
        alert('Error checking participants. Please try again.');
        setStartingTournament(null);
        return;
      }

      console.log('Setting tournament as starting...');
      setStartingTournament(tournament_id);

      try {
        console.log('Making API call to create brackets...');
        const response = await axios.post(
          `${link}/brackets/initial`,  
          {
            tournament_id: tournament_id,
          },
          {
            headers: {
              accessToken: accessToken,
            },
          }
        );
        console.log('API response:', response.data);
        alert('Tournament started successfully');
        setStartedTournaments(prev => new Set(prev).add(tournament_id));
        
        // Update setup state to show tournament is complete
        setTournamentSetupStates(prev => {
          const updated = new Map(prev);
          updated.set(tournament_id, { nextStep: 'completed', stepName: 'Complete' });
          return updated;
        });
        
        setStartingTournament(null);
        
        // Find tournament name for redirect
        const tournament = items.find(item => item.tournament_id === tournament_id);
        const tournamentName = tournament?.tournament_name || '';
        
        // Redirect to SeeDivisions with workflow parameter
        const queryString = new URLSearchParams({ 
          tournament_name: tournamentName, 
          tournament_id: tournament_id, 
          workflow: 'tournament_started' 
        }).toString();
        navigate(`/seeDivisions?${queryString}`);
      } catch (error) {
        console.error('Error starting tournament:', error);
        if (error.response?.data?.error) {
          // Check if it's the duplicate brackets error
          if (error.response.data.error.includes('already been created')) {
            setStartedTournaments(prev => new Set(prev).add(tournament_id));
            
            // Update setup state to show tournament is complete
            setTournamentSetupStates(prev => {
              const updated = new Map(prev);
              updated.set(tournament_id, { nextStep: 'completed', stepName: 'Complete' });
              return updated;
            });
            
            alert('Tournament brackets have already been created.');
          } else {
            alert(`Error: ${error.response.data.error}`);
          }
        } else {
          alert('Failed to start tournament. Please try again.');
        }
        setStartingTournament(null); // Reset on error
      }
    }
  
  
  return (
    <div className="w-100">
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
                    <th className="border-0 py-3 text-center" style={{width: '10%', minWidth: '80px'}}>
                      <i className="fas fa-cog me-2 text-muted"></i>Actions
                    </th>
                    <th className="border-0 py-3 text-center" style={{width: '10%', minWidth: '100px'}}>
                      <i className="fas fa-broadcast-tower me-2 text-muted"></i>Status
                    </th>
                    <th className="border-0 py-3 text-center" style={{width: '10%', minWidth: '120px'}}>
                      <i className="fas fa-magic me-2 text-muted"></i>Setup
                    </th>
                    <th className="border-0 py-3 pe-4 text-center" style={{width: '10%', minWidth: '100px'}}>
                      <i className="fas fa-play me-2 text-muted"></i>Controls
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="slide-up align-middle" style={{borderLeft: '4px solid transparent'}}>
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
                            <div className="fw-bold text-dark mb-1">{item.tournament_name}</div>
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
                            onClick={() =>seeDivision(item.tournament_name,item.tournament_id)}
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
                      <td className="py-4 text-center">
                        {accountId === item.account_id ? (
                          <div className="dropdown-modern d-inline-block">
                            <Dropdown show={openStates[index]} onToggle={(isOpen) => {
                              const newOpenStates = [...openStates];
                              newOpenStates[index] = isOpen;
                              setOpenStates(newOpenStates);
                            }}>
                              <Dropdown.Toggle 
                                variant="outline-secondary" 
                                size="sm" 
                                id={`dropdown-basic-${index}`}
                                style={{borderRadius: '20px'}}
                                className="d-flex align-items-center"
                              >
                                <i className="fas fa-ellipsis-h"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleDropdownItemClick(index, handleShowModal, item.tournament_id)}>
                                  <i className="fas fa-edit me-2 text-primary"></i>Edit Tournament
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => handleDropdownItemClick(index, onDelete, item.tournament_id)} className="text-danger">
                                  <i className="fas fa-trash me-2"></i>Delete Tournament
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        ) : (
                          <span className="text-muted small d-inline-flex align-items-center">
                            <i className="fas fa-ban me-1"></i>N/A
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-center">
                        {item.is_published === false ? (
                          <button 
                            className="btn btn-outline-warning btn-sm d-inline-flex align-items-center" 
                            onClick={() => onPublish(item.tournament_id)}
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
                      <td className="py-4 text-center">
                        {accountId === item.account_id ? (
                          (() => {
                            const setupState = tournamentSetupStates.get(item.tournament_id);
                            if (!setupState) {
                              return <span className="text-muted small">Loading...</span>;
                            }
                            
                            if (setupState.nextStep === 'completed') {
                              return (
                                <span className="badge bg-success d-inline-flex align-items-center" style={{borderRadius: '20px', padding: '8px 12px'}}>
                                  <i className="fas fa-check-circle me-2"></i>Complete
                                </span>
                              );
                            }
                            
                            return (
                              <button 
                                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center" 
                                onClick={() => handleResumeSetup(item)}
                                style={{borderRadius: '20px'}}
                                title={`Continue with: ${setupState.stepName}`}
                              >
                                <i className="fas fa-magic me-2"></i>
                                <span>{setupState.stepName}</span>
                              </button>
                            );
                          })()
                        ) : (
                          <span className="text-muted small d-inline-flex align-items-center">
                            <i className="fas fa-lock me-1"></i>Restricted
                          </span>
                        )}
                      </td>
                      <td className="py-4 pe-4 text-center">
                         {accountId === item.account_id ?  (
                           startedTournaments.has(item.tournament_id) ? (
                             <span className="badge bg-secondary d-inline-flex align-items-center" style={{borderRadius: '20px', padding: '8px 12px'}}>
                               <i className="fas fa-check-circle me-2"></i>Already Started
                             </span>
                           ) : (
                             <button 
                               className="btn btn-danger d-inline-flex align-items-center fw-bold text-white" 
                               onClick={()=> startTournament(item.tournament_id)}
                               disabled={startingTournament === item.tournament_id}
                               style={{
                                 borderRadius: '25px',
                                 fontSize: '0.95rem',
                                 padding: '10px 20px',
                                 boxShadow: '0 4px 15px rgba(220, 53, 69, 0.4)',
                                 border: '2px solid #dc3545',
                                 fontWeight: '700',
                                 animation: startingTournament !== item.tournament_id ? 'pulse 2s infinite' : 'none',
                                 background: 'linear-gradient(45deg, #dc3545, #ff6b7a)'
                               }}
                             >
                               {startingTournament === item.tournament_id ? (
                                 <>
                                   <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                   <span>STARTING TOURNAMENT...</span>
                                 </>
                               ) : (
                                 <>
                                   <i className="fas fa-rocket me-2" style={{fontSize: '1.1em'}}></i>
                                   <span>🚀 START TOURNAMENT</span>
                                 </>
                               )}
                             </button>
                           )
                        ) : (
                         <span className="text-muted small d-inline-flex align-items-center">
                           <i className="fas fa-ban me-1"></i>N/A
                         </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="d-lg-none">
        {items.map((item, index) => (
          <div key={index} className="card mobile-tournament-card slide-up">
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
                  <h6 className="mobile-tournament-title">{item.tournament_name}</h6>
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
                <div className="col-6">
                  {accountId === item.account_id ? (
                    <button 
                      className="btn btn-modern btn-sm w-100" 
                      onClick={() =>seeDivision(item.tournament_name,item.tournament_id)}
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
                <div className="col-6">
                  {accountId === item.account_id ?  (
                    startedTournaments.has(item.tournament_id) ? (
                      <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                        <i className="fas fa-check-circle me-1"></i>Started
                      </button>
                    ) : (
                       <button 
                         className="btn btn-danger w-100 fw-bold text-white" 
                         onClick={()=> startTournament(item.tournament_id)}
                         disabled={startingTournament === item.tournament_id}
                         style={{
                           borderRadius: '20px',
                           fontSize: '0.9rem',
                           padding: '8px 12px',
                           boxShadow: '0 3px 10px rgba(220, 53, 69, 0.4)',
                           border: '2px solid #dc3545',
                           fontWeight: '700',
                           background: 'linear-gradient(45deg, #dc3545, #ff6b7a)',
                           animation: startingTournament !== item.tournament_id ? 'pulse 2s infinite' : 'none'
                         }}
                       >
                         {startingTournament === item.tournament_id ? (
                           <>
                             <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                             <span>STARTING...</span>
                           </>
                         ) : (
                           <>
                             <i className="fas fa-rocket me-1"></i>
                             <span className="d-none d-sm-inline">🚀 START</span>
                             <span className="d-sm-none">🚀 START</span>
                           </>
                         )}
                       </button>
                    )
                  ) : (
                   <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                     <i className="fas fa-ban me-1"></i>N/A
                   </button>
                  )}
                </div>
              </div>
              
              <div className="row g-2 mt-2">
                <div className="col-4">
                  {item.is_published === false ? (
                    <button 
                      className="btn btn-outline-primary btn-sm w-100" 
                      onClick={() => onPublish(item.tournament_id)}
                    >
                      <i className="fas fa-paper-plane me-1"></i>Publish
                    </button>
                  ) : (
                    <button className="btn btn-outline-success btn-sm w-100" disabled>
                      <i className="fas fa-check me-1"></i>Published
                    </button>
                  )}
                </div>
                <div className="col-4">
                  {accountId === item.account_id ? (
                    (() => {
                      const setupState = tournamentSetupStates.get(item.tournament_id);
                      if (!setupState) {
                        return <button className="btn btn-outline-secondary btn-sm w-100" disabled>Loading...</button>;
                      }
                      
                      if (setupState.nextStep === 'completed') {
                        return (
                          <button className="btn btn-outline-success btn-sm w-100" disabled>
                            <i className="fas fa-check me-1"></i>Complete
                          </button>
                        );
                      }
                      
                      return (
                        <button 
                          className="btn btn-outline-primary btn-sm w-100" 
                          onClick={() => handleResumeSetup(item)}
                          title={`Continue with: ${setupState.stepName}`}
                        >
                          <i className="fas fa-magic me-1"></i>
                          Setup
                        </button>
                      );
                    })()
                  ) : (
                    <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                      <i className="fas fa-lock me-1"></i>Restricted
                    </button>
                  )}
                </div>
                <div className="col-4">
                  {accountId === item.account_id ? (
                    <div className="dropdown-modern w-100">
                      <Dropdown show={openStates[index]} onToggle={(isOpen) => {
                        const newOpenStates = [...openStates];
                        newOpenStates[index] = isOpen;
                        setOpenStates(newOpenStates);
                      }}>
                        <Dropdown.Toggle variant="outline-dark" size="sm" className="w-100">
                          <i className="fas fa-cog me-1"></i>
                          <span className="d-none d-sm-inline">More </span>Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleDropdownItemClick(index, handleShowModal, item.tournament_id)}>
                            <i className="fas fa-edit me-2"></i>Edit Tournament
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDropdownItemClick(index, onDelete, item.tournament_id)} className="text-danger">
                            <i className="fas fa-trash me-2"></i>Delete Tournament
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  ) : (
                    <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                      <i className="fas fa-lock me-1"></i>Protected
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-trophy fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No tournaments found</h5>
          <p className="text-muted">Create your first tournament to get started</p>
        </div>
      )}
      
      {/* Modal rendered outside of loops to avoid conflicts */}
      {selectedTournamentId && (
        <CustomModal 
          showModal={showModal} 
          handleClose={handleCloseModal} 
          accountId={accountId} 
          tournament_id={selectedTournamentId} 
        />
      )}
    </div>
  );
};

export default ItemList;