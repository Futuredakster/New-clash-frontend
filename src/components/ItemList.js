import axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown';
import { useState } from 'react';
import CustomModal from './modals/CustomModal';
import { useNavigate } from "react-router-dom";
import { link } from './constant';

const ItemList = ({ items, accountId }) => {
  const accessToken = localStorage.getItem("accessToken");
  const [showModal, setShowModal] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [openStates, setOpenStates] = useState(Array(items.length).fill(false));
  const navigate = useNavigate();

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

    const startTournament = (tournament_id) => {
      axios.post(
        `${link}/brackets/initial`,  
        {
          tournament_id: tournament_id,
        }
        )
        alert('Tournament started successfully');
    }
  
  
  return (
    <div className="w-100">
      {/* Desktop Table View */}
      <div className="d-none d-lg-block">
        <div className="table-responsive">
          <table className="table table-modern">
            <thead>
              <tr>
                <th>Tournament</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Divisions</th>
                <th>Image</th>
                <th>Actions</th>
                <th>Status</th>
                <th>Controls</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="slide-up">
                  <td>
                    <strong>{item.tournament_name}</strong>
                  </td>
                  <td>
                    {new Date(item.start_date).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(item.end_date).toLocaleDateString()}
                  </td>
                  <td>
                    {accountId === item.account_id ? (
                      <button 
                        className="btn btn-modern btn-sm" 
                        onClick={() =>seeDivision(item.tournament_name,item.tournament_id)}
                      > 
                        <i className="fas fa-eye me-2"></i>View Divisions
                      </button>
                    ):( 
                      <span className="text-muted small">N/A</span>
                    )}
                  </td>
                  <td>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.tournament_name} 
                        className="img-thumbnail"
                        style={{width: '50px', height: '50px', objectFit: 'cover'}}
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center" 
                           style={{width: '50px', height: '50px', borderRadius: '4px'}}>
                        <i className="fas fa-image text-muted"></i>
                      </div>
                    )}
                  </td>
                  <td>
                    {accountId === item.account_id ? (
                      <div className="dropdown-modern">
                        <Dropdown show={openStates[index]} onToggle={(isOpen) => {
                          const newOpenStates = [...openStates];
                          newOpenStates[index] = isOpen;
                          setOpenStates(newOpenStates);
                        }}>
                          <Dropdown.Toggle variant="outline-dark" size="sm" id={`dropdown-basic-${index}`}>
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleDropdownItemClick(index, handleShowModal, item.tournament_id)}>
                              <i className="fas fa-edit me-2"></i>Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDropdownItemClick(index, onDelete, item.tournament_id)} className="text-danger">
                              <i className="fas fa-trash me-2"></i>Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    ) : (
                      <span className="text-muted small">N/A</span>
                    )}
                  </td>
                  <td>
                    {item.is_published === false ? (
                      <button 
                        className="btn btn-modern-outline btn-sm" 
                        onClick={() => onPublish(item.tournament_id)}
                      >
                        <i className="fas fa-paper-plane me-2"></i>Publish
                      </button>
                    ) : (
                      <span className="status-badge status-published">
                        <i className="fas fa-check me-1"></i>Published
                      </span>
                    )}
                  </td>
                  <td>
                     {accountId === item.account_id ?  (
                       <button 
                         className="btn btn-modern btn-sm" 
                         onClick={()=> startTournament(item.tournament_id)}
                       >
                         <i className="fas fa-play me-1"></i>Start
                       </button>
                    ) : (
                     <span className="text-muted">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                     <button 
                       className="btn btn-success btn-sm w-100" 
                       onClick={()=> startTournament(item.tournament_id)}
                     >
                       <i className="fas fa-play me-1"></i>
                       <span className="d-none d-sm-inline">Start</span>
                       <span className="d-sm-none">Start</span>
                     </button>
                  ) : (
                   <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                     <i className="fas fa-ban me-1"></i>N/A
                   </button>
                  )}
                </div>
              </div>
              
              <div className="row g-2 mt-2">
                <div className="col-6">
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
                <div className="col-6">
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