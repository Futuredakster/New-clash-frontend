import React, { useState, useEffect, useContext} from 'react';
import axios from 'axios';
import Searchbar from '../../components/navigation/Searchbar';
import TableContent from '../../components/TableContent';
import {AuthContext} from '../../context/AuthContext';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { link } from '../../constant';



function MyTournaments() {
  const [data, setData] = useState([]);
  const [search,setSearch] = useState('')
  const {authState, setAuthState} = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if accessToken exists in localStorage
    const accessToken = localStorage.getItem("accessToken");
  
    if (!accessToken) {
      // Handle the case where accessToken is not available
      console.error('Access token not found. API request not made.');
      return;
    }
  
    // Fetch data from the backend API
    axios.get(`${link}/tournaments/byaccount`, {
      headers: {
        accessToken: accessToken,
      }, 
      params: {
        tournament_name: search,
      },
    })
      .then(response => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          console.log(authState.id);
          setData(response.data);
        
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [search]);


  return (
    <Container fluid className="fade-in px-3">
      <Row>
        <Col>
          <div className="page-header-modern">
            <h1 className="page-title-modern">My Karate Tournaments</h1>
            <p className="page-subtitle-modern">Manage and view all your created karate tournaments</p>
          </div>
          
          {/* Show different content based on whether user has tournaments */}
          {data.length === 0 && !search ? (
            /* Empty State - No tournaments created yet */
            <div className="text-center py-5">
              <Card className="card-modern mx-auto shadow-lg" style={{ maxWidth: '600px' }}>
                <Card.Body className="py-5">
                  <div className="mb-4">
                    <i className="fas fa-trophy fa-4x text-muted mb-3"></i>
                    <h3 className="fw-bold text-dark mb-2">Ready to Create Your First Tournament?</h3>
                    <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
                      Start organizing amazing karate competitions! Create tournaments, set up divisions for different skill levels and age groups, and manage everything in one place.
                    </p>
                  </div>
                  
                  <div className="d-grid gap-3 mb-4">
                    <Button 
                      className="btn btn-modern btn-lg py-3"
                      onClick={() => navigate('/CreateTournaments')}
                      style={{ fontSize: '1.1rem', fontWeight: '600' }}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Create Your First Tournament
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => navigate('/Home')}
                      className="py-2"
                    >
                      <i className="fas fa-eye me-2"></i>
                      Browse Other Tournaments for Inspiration
                    </Button>
                  </div>

                  <div className="row text-start">
                    <div className="col-md-6">
                      <h6 className="fw-bold text-dark mb-2">
                        <i className="fas fa-check-circle text-success me-2"></i>
                        What you can do:
                      </h6>
                      <ul className="list-unstyled text-muted">
                        <li className="mb-1">• Set tournament dates and details</li>
                        <li className="mb-1">• Create divisions (Kata, Kumite)</li>
                        <li className="mb-1">• Organize by age groups & skill levels</li>
                        <li>• Manage participant registrations</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold text-dark mb-2">
                        <i className="fas fa-lightbulb text-warning me-2"></i>
                        Quick tip:
                      </h6>
                      <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                        Start simple! Create your tournament first, then add divisions. You can always add more divisions later as needed.
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ) : (
            /* Normal state - Show search and tournaments */
            <div className="w-100" style={{ overflowX: 'hidden' }}>
              <div className="mb-4">
                <Searchbar
                  search={search}
                  setSearch={setSearch}
                />
              </div>
              <div className="w-100">
                <TableContent
                  items={data}
                  accountId={authState.account_id}
                />
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
export default MyTournaments;