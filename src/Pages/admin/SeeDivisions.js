import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DivisionModal from '../../components/modals/DivisionModal';
import Dropdown from 'react-bootstrap/Dropdown';
import { Container, Row, Col, Card, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { link } from '../../constant';

const SeeDivisions = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tournament_name = queryParams.get('tournament_name');
  const tournament_id = queryParams.get('tournament_id');
  const queryString = new URLSearchParams({ tournament_id:tournament_id}).toString();
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [openStates, setOpenStates] = useState(Array(data.length).fill(false));
  const navigate = useNavigate();

  // Mat management state
  const [showMatDashboard, setShowMatDashboard] = useState(false);
  const [showCreateMats, setShowCreateMats] = useState(false);
  const [matAssignments, setMatAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ type: '', message: '' });
  const [matCount, setMatCount] = useState(3); // Default to 3 mats
  const [matNames, setMatNames] = useState(['Mat A', 'Mat B', 'Mat C']);
  const [deletingMatId, setDeletingMatId] = useState(null);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const toggleDropdown = (index) => {
    const newOpenStates = [...openStates];
    newOpenStates[index] = !newOpenStates[index];
    setOpenStates(newOpenStates);
  };
  
  const forPart = (division_id) =>{
    const quereString = new URLSearchParams({division_id:division_id}).toString();
    navigate(`/SeeParticepents?${quereString}`)
  }
  const forBrack = (division_id) =>{
    const quereString = new URLSearchParams({division_id:division_id}).toString();
    navigate(`/BracketApp?${quereString}`)
  }
  const onDelete = (division_id) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found. Delete request cannot be made.');
      return;
    }

    axios.delete(`${link}/divisions`, {
      headers: {
        accessToken: accessToken,
      },
      data: {
        division_id: division_id,
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

  // Fetch current mat assignments
  const fetchMatAssignments = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return;
    }

    try {
      // Get divisions with their mat assignments
      const divisionsResponse = await axios.get(`${link}/divisions/`, {
        headers: { accessToken: accessToken },
        params: { tournament_id: tournament_id }
      });

      // Get mats for the tournament
      const matsResponse = await axios.get(`${link}/mats/`, {
        headers: { accessToken: accessToken },
        params: { tournament_id: tournament_id }
      });

      const divisions = divisionsResponse.data;
      const mats = matsResponse.data;

      // Create mat lookup
      const matLookup = {};
      mats.forEach(mat => {
        matLookup[mat.mat_id] = mat.mat_name;
      });

      // Filter divisions that have mat assignments and create assignments array
      const assignments = divisions
        .filter(division => division.mat_id)
        .map((division, index) => ({
          division_id: division.division_id,
          age_group: division.age_group || 'N/A',
          proficiency_level: division.proficiency_level || 'N/A',
          gender: division.gender || 'N/A',
          category: division.category || 'N/A',
          mat_id: division.mat_id,
          mat_name: matLookup[division.mat_id] || `Mat ${division.mat_id}`,
          assignment_order: index + 1,
          is_active: division.is_active || false,
          is_complete: division.is_complete || false
        }));

      setMatAssignments(assignments);
      
    } catch (error) {
      console.error('Error fetching mat assignments:', error);
    }
  };

  // Auto-assign mats handler
  const handleAssignMats = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setAlertMessage({ type: 'danger', message: 'Access token not found. Please log in again.' });
      return;
    }

    setLoading(true);
    setAlertMessage({ type: '', message: '' });

    try {
      const response = await axios.post(
        `${link}/divisions/assign-mats`,
        { tournament_id: tournament_id },
        {
          headers: {
            accessToken: accessToken,
          }
        }
      );

      setMatAssignments(response.data.assignments);
      setAlertMessage({ 
        type: 'success', 
        message: `Successfully assigned ${response.data.total_divisions} divisions to ${response.data.total_mats} mats!` 
      });
      
      // Refresh the divisions data without full page reload
      if (accessToken) {
        axios.get(`${link}/divisions/`, {
          headers: { accessToken: accessToken },
          params: { tournament_id: tournament_id }
        })
        .then(response => {
          if (!response.data.error) {
            setData(response.data);
          }
        })
        .catch(error => console.error('Error refreshing divisions:', error));
      }
      
    } catch (error) {
      console.error('Error assigning mats:', error);
      setAlertMessage({ 
        type: 'danger', 
        message: error.response?.data?.error || 'Failed to assign mats. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle mat creation
  const handleCreateMats = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setAlertMessage({ type: 'danger', message: 'Access token not found. Please log in again.' });
      return;
    }

    setLoading(true);
    setAlertMessage({ type: '', message: '' });

    try {
      // Create each mat
      const matPromises = matNames.slice(0, matCount).map(async (matName) => {
        return axios.post(
          `${link}/mats`, // You'll need to create this route
          { 
            tournament_id: tournament_id,
            mat_name: matName 
          },
          {
            headers: {
              accessToken: accessToken,
            }
          }
        );
      });

      await Promise.all(matPromises);
      
      setAlertMessage({ 
        type: 'success', 
        message: `Successfully created ${matCount} mats for the tournament!` 
      });
      
      setShowCreateMats(false);
      
    } catch (error) {
      console.error('Error creating mats:', error);
      setAlertMessage({ 
        type: 'danger', 
        message: error.response?.data?.error || 'Failed to create mats. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Handle mat deletion
  const handleDeleteMat = async (matId, matName) => {
    if (!window.confirm(`Are you sure you want to delete ${matName}? This will remove all divisions assigned to this mat.`)) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setAlertMessage({ type: 'danger', message: 'Access token not found. Please log in again.' });
      return;
    }

    setDeletingMatId(matId);

    try {
      await axios.delete(`${link}/mats`, {
        headers: { accessToken: accessToken },
        data: { mat_id: matId }
      });

      setAlertMessage({ 
        type: 'success', 
        message: `${matName} deleted successfully!` 
      });

      // Refresh mat assignments
      fetchMatAssignments();
      
    } catch (error) {
      console.error('Error deleting mat:', error);
      setAlertMessage({ 
        type: 'danger', 
        message: error.response?.data?.error || 'Failed to delete mat. Please try again.' 
      });
    } finally {
      setDeletingMatId(null);
    }
  };

  // Delete all mats handler
  const handleDeleteAllMats = async () => {
    if (!window.confirm('Are you sure you want to delete ALL mats for this tournament? This will remove all mat assignments and cannot be undone.')) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setAlertMessage({ type: 'danger', message: 'Access token not found. Please log in again.' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.delete(`${link}/mats/all`, {
        headers: { accessToken: accessToken },
        data: { tournament_id: tournament_id }
      });

      setAlertMessage({ 
        type: 'success', 
        message: response.data.message || 'All mats deleted successfully!' 
      });

      // Refresh mat assignments and close dashboard
      setMatAssignments([]);
      setShowMatDashboard(false);
      
    } catch (error) {
      console.error('Error deleting all mats:', error);
      setAlertMessage({ 
        type: 'danger', 
        message: error.response?.data?.error || 'Failed to delete all mats. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh dashboard when modal is open
  useEffect(() => {
    let interval;
    if (showMatDashboard) {
      // Refresh every 3 seconds when dashboard is open for real-time updates
      interval = setInterval(() => {
        fetchMatAssignments();
      }, 3000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showMatDashboard]);

  // Clear alert after 5 seconds
  useEffect(() => {
    if (alertMessage.message) {
      const timer = setTimeout(() => {
        setAlertMessage({ type: '', message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found. API request not made.');
      return;
    }

    axios.get(`${link}/divisions/`, {
      headers: {
        accessToken: accessToken,
      },
      params: {
        tournament_id: tournament_id,
      },
    })
      .then(response => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          setData(response.data);
          // Also fetch mat assignments when divisions are loaded
          fetchMatAssignments();
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [tournament_id]);

  return (
    <Container fluid className="fade-in px-2 px-md-3">
      <Row>
        <Col xs={12} className="px-1 px-md-3">
          <div className="page-header-modern">
            <h1 className="page-title-modern">{tournament_name}</h1>
            <p className="page-subtitle-modern">Manage divisions for this tournament</p>
          </div>
          
          {/* Alert Messages */}
          {alertMessage.message && (
            <Alert variant={alertMessage.type} className="mb-4">
              {alertMessage.message}
            </Alert>
          )}

          <div className="mb-4 d-flex gap-2 flex-wrap align-items-center">
            <Button 
              className="btn btn-modern" 
              onClick={() => navigate(`/CreateDivision?${queryString}`)}
            >
              <i className="fas fa-plus me-2"></i>
              Add Division
            </Button>
            
            {/* Mat Management Buttons */}
            <Button 
              className="btn btn-outline-success text-nowrap" 
              onClick={() => setShowCreateMats(true)}
              disabled={loading}
            >
              <i className="fas fa-plus me-2"></i>
              <span className="d-none d-sm-inline">Create </span>Mats
            </Button>

            <Button 
              className="btn btn-outline-primary text-nowrap" 
              onClick={handleAssignMats}
              disabled={loading || data.length === 0}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                  <span className="d-none d-md-inline">Assigning</span>
                  <span className="d-md-none">...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-map me-2"></i>
                  <span className="d-none d-sm-inline">Auto-Assign </span>Mats
                </>
              )}
            </Button>
            
            <Button 
              className="btn btn-outline-secondary text-nowrap" 
              onClick={() => {
                fetchMatAssignments();
                setShowMatDashboard(true);
              }}
              disabled={data.length === 0}
            >
              <i className="fas fa-eye me-2"></i>
              <span className="d-none d-sm-inline">Mat </span>Dashboard
            </Button>

            <Button 
              className="btn btn-outline-danger text-nowrap" 
              onClick={handleDeleteAllMats}
              disabled={loading || data.length === 0}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                  <span className="d-none d-md-inline">Deleting</span>
                  <span className="d-md-none">...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-trash-alt me-2"></i>
                  <span className="d-none d-sm-inline">Delete All </span>Mats
                </>
              )}
            </Button>
          </div>

          {/* Desktop Table View */}
          <div className="d-none d-lg-block">
            <div className="table-responsive">
              <table className="table table-modern">
                <thead>
                  <tr>
                    <th>Gender</th>
                    <th>Age Group</th>
                    <th>Proficiency Level</th>
                    <th>Category</th>
                    <th>Actions</th>
                    <th>Participants</th>
                    <th>Brackets</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index} className="slide-up">
                      <td><strong>{item.gender}</strong></td>
                      <td>{item.age_group}</td>
                      <td>{item.proficiency_level}</td>
                      <td>{item.category}</td>
                      <td>
                        <Dropdown show={openStates[index]} onClick={() => toggleDropdown(index)}>
                          <Dropdown.Toggle variant="outline-dark" size="sm" id={`dropdown-basic-${index}`}>
                            <i className="fas fa-edit me-1"></i>Edit
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={handleShowModal}>
                              <i className="fas fa-edit me-2"></i>Edit Division
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => onDelete(item.division_id)} className="text-danger">
                              <i className="fas fa-trash me-2"></i>Delete
                            </Dropdown.Item>
                            <DivisionModal showModal={showModal} handleClose={handleCloseModal} division_id={item.division_id} />
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => forPart(item.division_id)}
                        >
                          <i className="fas fa-users me-1"></i>Participants
                        </Button>
                      </td>
                      <td>
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => forBrack(item.division_id)}
                        >
                          <i className="fas fa-sitemap me-1"></i>Create Brackets
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="d-lg-none">
            {data.map((item, index) => (
              <Card key={index} className="card-modern mb-3 slide-up">
                <Card.Body className="p-3">
                  <div className="row">
                    <div className="col-12">
                      <h6 className="card-title mb-3 fw-bold">
                        <i className="fas fa-layer-group me-2"></i>
                        Division Details
                      </h6>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Gender</small>
                      <strong>{item.gender}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Age Group</small>
                      <strong>{item.age_group}</strong>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Proficiency</small>
                      <strong>{item.proficiency_level}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Category</small>
                      <strong>{item.category}</strong>
                    </div>
                  </div>
                  
                  <div className="container-fluid p-0">
                    <hr className="my-3 mx-1" style={{ maxWidth: '92%', margin: '1rem auto' }} />
                    
                    <div className="row g-2 mx-1">
                      <div className="col-12 col-sm-4 px-1">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="w-100"
                          style={{ maxWidth: '95%', margin: '0 auto', display: 'block' }}
                          onClick={() => forPart(item.division_id)}
                        >
                          <i className="fas fa-users me-1"></i>
                          <span className="d-none d-sm-inline">Participants</span>
                          <span className="d-sm-none">Participants</span>
                        </Button>
                      </div>
                      <div className="col-12 col-sm-4 px-1">
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          className="w-100"
                          style={{ maxWidth: '95%', margin: '0 auto', display: 'block' }}
                          onClick={() => forBrack(item.division_id)}
                        >
                          <i className="fas fa-sitemap me-1"></i>
                          <span className="d-none d-sm-inline">Brackets</span>
                          <span className="d-sm-none">Brackets</span>
                        </Button>
                      </div>
                      <div className="col-12 col-sm-4 px-1">
                        <Dropdown show={openStates[index]} onClick={() => toggleDropdown(index)}>
                          <Dropdown.Toggle 
                            variant="outline-dark" 
                            size="sm" 
                            className="w-100"
                            style={{ maxWidth: '95%', margin: '0 auto', display: 'block' }}
                          >
                            <i className="fas fa-ellipsis-v me-1"></i>Actions
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={handleShowModal}>
                              <i className="fas fa-edit me-2"></i>Edit Division
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => onDelete(item.division_id)} className="text-danger">
                              <i className="fas fa-trash me-2"></i>Delete
                            </Dropdown.Item>
                            <DivisionModal showModal={showModal} handleClose={handleCloseModal} division_id={item.division_id} />
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>

          {data.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-layer-group fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No divisions found</h5>
              <p className="text-muted">Create your first division to get started</p>
            </div>
          )}

          {/* Create Mats Modal */}
          <Modal show={showCreateMats} onHide={() => setShowCreateMats(false)} size="md">
            <Modal.Header closeButton>
              <Modal.Title>
                <i className="fas fa-plus me-2"></i>
                Create Mats for {tournament_name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <label className="form-label">Number of Mats</label>
                <select 
                  className="form-select" 
                  value={matCount} 
                  onChange={(e) => updateMatCount(parseInt(e.target.value))}
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} Mat{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Mat Names</label>
                {matNames.slice(0, matCount).map((name, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => updateMatName(index, e.target.value)}
                      placeholder={`Mat ${String.fromCharCode(65 + index)}`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <small>
                  These mats will be created for this tournament. You can then assign divisions to them using the "Auto-Assign Mats" button.
                </small>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCreateMats(false)}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleCreateMats} disabled={loading}>
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    Create {matCount} Mat{matCount > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Mat Dashboard Modal */}
          <Modal show={showMatDashboard} onHide={() => setShowMatDashboard(false)} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>
                <i className="fas fa-map me-2"></i>
                Mat Dashboard - {tournament_name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center p-3" style={{ minHeight: '400px' }}>
              {matAssignments.length > 0 ? (
                <div className="w-100">
                  <h6 className="mb-3 text-center">Current Mat Assignments:</h6>
                  
                  {/* Mobile Card View */}
                  <div className="d-block d-md-none">
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                      {matAssignments.map((assignment, index) => (
                        <div key={index} className={`card mb-2 ${assignment.is_complete ? 'border-success' : assignment.is_active ? 'border-info' : 'border-secondary'}`}>
                          <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0 text-primary">{assignment.mat_name}</h6>
                              {assignment.is_complete ? (
                                <span className="badge bg-success">
                                  <i className="fas fa-check me-1"></i>Complete
                                </span>
                              ) : assignment.is_active ? (
                                <span className="badge bg-primary">
                                  <i className="fas fa-play me-1"></i>Active
                                </span>
                              ) : (
                                <span className="badge bg-secondary">
                                  <i className="fas fa-clock me-1"></i>Pending
                                </span>
                              )}
                            </div>
                            <div className="mb-2">
                              <small className="text-muted">Division:</small><br/>
                              <strong>{assignment.gender} {assignment.category}</strong>
                            </div>
                            <div className="row mb-2">
                              <div className="col-6">
                                <small className="text-muted">Age:</small><br/>
                                <span>{assignment.age_group}</span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted">Level:</small><br/>
                                <span className="badge bg-light text-dark">{assignment.proficiency_level}</span>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                Order: <span className="badge bg-secondary">#{assignment.assignment_order}</span>
                              </small>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteMat(assignment.mat_id, assignment.mat_name)}
                                disabled={deletingMatId === assignment.mat_id}
                                title={`Delete ${assignment.mat_name}`}
                              >
                                {deletingMatId === assignment.mat_id ? (
                                  <Spinner as="span" animation="border" size="sm" role="status" />
                                ) : (
                                  <i className="fas fa-trash"></i>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="d-none d-md-block">
                    <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                      <table className="table table-sm table-bordered table-hover mb-0">
                        <thead className="table-light sticky-top">
                          <tr>
                            <th style={{ minWidth: '80px' }}>Mat</th>
                            <th style={{ minWidth: '140px' }}>Division</th>
                            <th style={{ minWidth: '80px' }}>Age</th>
                            <th style={{ minWidth: '100px' }}>Level</th>
                            <th style={{ minWidth: '90px', textAlign: 'center' }}>Status</th>
                            <th style={{ minWidth: '70px', textAlign: 'center' }}>Order</th>
                            <th style={{ minWidth: '100px', textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matAssignments.map((assignment, index) => {
                            const rowClass = assignment.is_complete ? 'table-success' : 
                                           assignment.is_active ? 'table-info' : '';
                            return (
                            <tr key={index} className={rowClass}>
                              <td>
                                <strong className="text-primary">{assignment.mat_name}</strong>
                              </td>
                              <td>
                                {assignment.gender} {assignment.category}
                              </td>
                              <td>{assignment.age_group}</td>
                              <td>
                                <span className="badge bg-light text-dark">{assignment.proficiency_level}</span>
                              </td>
                              <td className="text-center">
                                {assignment.is_complete ? (
                                  <span className="badge bg-success">
                                    <i className="fas fa-check me-1"></i>Complete
                                  </span>
                                ) : assignment.is_active ? (
                                  <span className="badge bg-primary">
                                    <i className="fas fa-play me-1"></i>Active
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary">
                                    <i className="fas fa-clock me-1"></i>Pending
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <span className="badge bg-secondary">#{assignment.assignment_order}</span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteMat(assignment.mat_id, assignment.mat_name)}
                                  disabled={deletingMatId === assignment.mat_id}
                                  title={`Delete ${assignment.mat_name}`}
                                >
                                  {deletingMatId === assignment.mat_id ? (
                                    <>
                                      <Spinner as="span" animation="border" size="sm" role="status" className="me-1" />
                                      <span className="d-none d-lg-inline">Deleting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-trash me-1"></i>
                                      <span className="d-none d-lg-inline">Delete</span>
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <i className="fas fa-info-circle fa-3x text-muted mb-4"></i>
                  <h5 className="text-muted mb-3">No mat assignments yet</h5>
                  <p className="text-muted">Click "Auto-Assign Mats" to distribute divisions across available mats.</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
              <div className="d-flex align-items-center">
                <small className="text-muted">
                  <i className="fas fa-sync-alt me-1"></i>
                  Auto-refreshing every 3 seconds
                </small>
              </div>
              <div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={fetchMatAssignments}
                  className="me-2"
                >
                  <i className="fas fa-sync-alt me-1"></i>
                  Refresh Now
                </Button>
                <Button variant="secondary" onClick={() => setShowMatDashboard(false)}>
                  Close
                </Button>
                {matAssignments.length === 0 && (
                  <Button variant="primary" onClick={handleAssignMats} disabled={loading} className="ms-2">
                    {loading ? 'Assigning...' : 'Auto-Assign Mats'}
                  </Button>
                )}
              </div>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default SeeDivisions;
