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
      <div className="table-responsive">
        <table className="table table-modern">
          <thead>
            <tr>
              <th>Tournament</th>
              <th>Start Date</th>
              <th className="d-none d-md-table-cell">End Date</th>
              <th>Divisions</th>
              <th className="d-none d-sm-table-cell">Image</th>
              <th>Actions</th>
              <th>Status</th>
              <th className="d-none d-lg-table-cell">Controls</th>
            </tr>
          </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="slide-up">
              <td>
                <div className="d-flex flex-column">
                  <strong className="mb-1">{item.tournament_name}</strong>
                  <small className="text-muted d-md-none">
                    End: {new Date(item.end_date).toLocaleDateString()}
                  </small>
                </div>
              </td>
              <td>
                <small className="d-block">
                  {new Date(item.start_date).toLocaleDateString()}
                </small>
              </td>
              <td className="d-none d-md-table-cell">
                {new Date(item.end_date).toLocaleDateString()}
              </td>
              <td>
                {accountId === item.account_id ? (
                  <button 
                    className="btn btn-modern btn-sm w-100" 
                    onClick={() =>seeDivision(item.tournament_name,item.tournament_id)}
                  > 
                    <i className="fas fa-eye d-md-none"></i>
                    <span className="d-none d-md-inline">View Divisions</span>
                    <span className="d-md-none">View</span>
                  </button>
                ):( 
                  <span className="text-muted small">N/A</span>
                )}
              </td>
              <td className="d-none d-sm-table-cell">
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
                        <i className="fas fa-ellipsis-v d-md-none"></i>
                        <span className="d-none d-md-inline">Actions</span>
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
                    className="btn btn-modern-outline btn-sm w-100" 
                    onClick={() => onPublish(item.tournament_id)}
                  >
                    <i className="fas fa-paper-plane d-md-none"></i>
                    <span className="d-none d-md-inline">Publish</span>
                    <span className="d-md-none">Pub</span>
                  </button>
                ) : (
                  <span className="status-badge status-published">
                    <i className="fas fa-check me-1"></i>
                    <span className="d-none d-md-inline">Published</span>
                    <span className="d-md-none">Live</span>
                  </span>
                )}
              </td>
              <td className="d-none d-lg-table-cell">
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
      
      {items.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-trophy fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No tournaments found</h5>
          <p className="text-muted">Create your first tournament to get started</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default ItemList;
