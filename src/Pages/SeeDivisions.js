import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DivisionModal from '../DivisionModal';
import Dropdown from 'react-bootstrap/Dropdown';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { link } from '../constant';

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
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [tournament_id]);

  return (
    <Container fluid className="fade-in px-3">
      <Row>
        <Col>
          <div className="page-header-modern">
            <h1 className="page-title-modern">{tournament_name}</h1>
            <p className="page-subtitle-modern">Manage divisions for this tournament</p>
          </div>
          
          <div className="mb-4">
            <Button 
              className="btn btn-modern" 
              onClick={() => navigate(`/CreateDivision?${queryString}`)}
            >
              <i className="fas fa-plus me-2"></i>
              Add Division
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
                <Card.Body>
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
                  
                  <hr className="my-3" />
                  
                  <div className="row g-2">
                    <div className="col-6 col-sm-4">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="w-100"
                        onClick={() => forPart(item.division_id)}
                      >
                        <i className="fas fa-users me-1"></i>
                        <span className="d-none d-sm-inline">Participants</span>
                        <span className="d-sm-none">Parts</span>
                      </Button>
                    </div>
                    <div className="col-6 col-sm-4">
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        className="w-100"
                        onClick={() => forBrack(item.division_id)}
                      >
                        <i className="fas fa-sitemap me-1"></i>
                        <span className="d-none d-sm-inline">Brackets</span>
                        <span className="d-sm-none">Brack</span>
                      </Button>
                    </div>
                    <div className="col-12 col-sm-4">
                      <Dropdown show={openStates[index]} onClick={() => toggleDropdown(index)}>
                        <Dropdown.Toggle variant="outline-dark" size="sm" className="w-100">
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
        </Col>
      </Row>
    </Container>
  );
};

export default SeeDivisions;
