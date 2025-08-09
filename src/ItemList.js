import axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown';
import { useState } from 'react';
import CustomModal from './CustomModal';
import { useNavigate } from "react-router-dom";
import { link } from './constant';

const ItemList = ({ items, accountId }) => {
  const accessToken = localStorage.getItem("accessToken");
  const [showModal, setShowModal] = useState(false);
  const [openStates, setOpenStates] = useState(Array(items.length).fill(false));
  const navigate = useNavigate();

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const toggleDropdown = (index) => {
    const newOpenStates = [...openStates];
    newOpenStates[index] = !newOpenStates[index];
    setOpenStates(newOpenStates);
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
                        <Dropdown show={openStates[index]} onClick={() => toggleDropdown(index)}>
                          <Dropdown.Toggle variant="outline-dark" size="sm" id={`dropdown-basic-${index}`}>
                            Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={handleShowModal}>
                              <i className="fas fa-edit me-2"></i>Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => onDelete(item.tournament_id)} className="text-danger">
                              <i className="fas fa-trash me-2"></i>Delete
                            </Dropdown.Item>
                            <CustomModal showModal={showModal} handleClose={handleCloseModal} accountId={accountId} tournament_id={item.tournament_id} />
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
          <div key={index} className="card card-modern mb-3 slide-up">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-3">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.tournament_name} 
                      className="img-fluid rounded"
                      style={{width: '100%', height: '60px', objectFit: 'cover'}}
                    />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center rounded" 
                         style={{width: '100%', height: '60px'}}>
                      <i className="fas fa-image text-muted"></i>
                    </div>
                  )}
                </div>
                <div className="col-9">
                  <h6 className="card-title mb-1 fw-bold">{item.tournament_name}</h6>
                  <div className="row text-muted small">
                    <div className="col-6">
                      <i className="fas fa-calendar-start me-1"></i>
                      Start: {new Date(item.start_date).toLocaleDateString()}
                    </div>
                    <div className="col-6">
                      <i className="fas fa-calendar-end me-1"></i>
                      End: {new Date(item.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <hr className="my-3" />
              
              <div className="row g-2 mobile-tournament-actions">
                <div className="col-6 col-sm-3">
                  {accountId === item.account_id ? (
                    <button 
                      className="btn btn-modern btn-sm w-100" 
                      onClick={() =>seeDivision(item.tournament_name,item.tournament_id)}
                    > 
                      <i className="fas fa-eye me-1"></i>Divisions
                    </button>
                  ):( 
                    <span className="text-muted small d-block text-center">N/A</span>
                  )}
                </div>
                <div className="col-6 col-sm-3">
                  {item.is_published === false ? (
                    <button 
                      className="btn btn-modern-outline btn-sm w-100" 
                      onClick={() => onPublish(item.tournament_id)}
                    >
                      <i className="fas fa-paper-plane me-1"></i>Publish
                    </button>
                  ) : (
                    <span className="status-badge status-published d-block text-center">
                      <i className="fas fa-check me-1"></i>Published
                    </span>
                  )}
                </div>
                <div className="col-6 col-sm-3">
                  {accountId === item.account_id ? (
                    <div className="dropdown-modern w-100">
                      <Dropdown show={openStates[index]} onClick={() => toggleDropdown(index)}>
                        <Dropdown.Toggle variant="outline-dark" size="sm" className="w-100">
                          <i className="fas fa-ellipsis-v me-1"></i>Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={handleShowModal}>
                            <i className="fas fa-edit me-2"></i>Edit
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => onDelete(item.tournament_id)} className="text-danger">
                            <i className="fas fa-trash me-2"></i>Delete
                          </Dropdown.Item>
                          <CustomModal showModal={showModal} handleClose={handleCloseModal} accountId={accountId} tournament_id={item.tournament_id} />
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  ) : (
                    <span className="text-muted small d-block text-center">N/A</span>
                  )}
                </div>
                <div className="col-6 col-sm-3">
                  {accountId === item.account_id ?  (
                     <button 
                       className="btn btn-modern btn-sm w-100" 
                       onClick={()=> startTournament(item.tournament_id)}
                     >
                       <i className="fas fa-play me-1"></i>Start
                     </button>
                  ) : (
                   <span className="text-muted small d-block text-center">N/A</span>
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
    </div>
  );
};

export default ItemList;
