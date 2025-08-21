import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Divisions.css'; // Import the CSS file
import { link } from '../constant';

export const Divisions = ({ props, setProps, setDivision }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tournament_id = queryParams.get('tournament_id');
  const [data, setData] = useState([]);
  const [tournamentDetails, setTournamentDetails] = useState({});
  const navigate = useNavigate();

  const handleViewDetails = (item) => {
    setDivision(item);
    const queryString = new URLSearchParams({
      division_id: item.division_id,
    //  age_group: item.age_group
    }).toString();
    navigate(`/Form?${queryString}`);
  };

  const handleView = (item) => {
    setDivision(item);
    const queryString = new URLSearchParams({
      division_id: item.division_id,
    //  age_group: item.age_group
    }).toString();
    navigate(`/DisplayParticipents?${queryString}`);
  };

const addToCart = (item) => {
  const token = localStorage.getItem('participantAccessToken');

  axios.post(`${link}/cart`, {
    division_id: item.division_id,
    age_group: item.age_group,
    proficiency_level: item.proficiency_level
  }, {
    headers: {
      participantAccessToken: token
    }
  })
  .then(response => {
    // Success popup
    alert("✅ Division successfully added to cart!");
    console.log("Cart response:", response.data);
  })
  .catch(error => {
    // If backend sent an error message
    if (error.response && error.response.data && error.response.data.error) {
      alert(`❌ ${error.response.data.error}`);
    } else {
      // Fallback if error response is missing
      alert("❌ Failed to add division to cart.");
    }
    console.error("Error adding to cart:", error);
  });
};



  const fetchTournamentDetails = async () => {
    try {
      const response = await axios.get(`${link}/tournaments/default`, {
        params: { tournament_id }
      });
      if (response.data.error) {
        alert(response.data.error);
      } else {
        setTournamentDetails(response.data);
        setProps(response.data);
      }
    } catch (error) {
      console.error('Error fetching tournament details:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${link}/divisions/praticepent`, {
          params: { tournament_id }
        });
        if (response.data.error) {
          alert(response.data.error);
        } else {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    if (!props || props.length === 0) {
      fetchTournamentDetails();
    }
  }, [tournament_id, props]);

  return (
    <div className="container-modern fade-in">
      <div className="page-header-modern">
        <h1 className="page-title-modern">{tournamentDetails.tournament_name || (props.length !== 0 && props.tournament_name)}</h1>
        <div className="d-flex justify-content-center gap-4 mt-3">
          <p className="text-muted mb-0">
            <i className="fas fa-calendar-start me-2"></i>
            <strong>Start:</strong> {new Date(tournamentDetails.start_date || (props.length !== 0 && props.start_date)).toLocaleDateString()}
          </p>
          <p className="text-muted mb-0">
            <i className="fas fa-calendar-end me-2"></i>
            <strong>End:</strong> {new Date(tournamentDetails.end_date || (props.length !== 0 && props.end_date)).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="row g-4">
        {data.map((item, index) => (
          <div className="col-12 col-md-6 col-lg-4" key={index}>
            <div className="card card-modern h-100 slide-up">
              <div className="card-modern-header">
                <h5 className="mb-0 fw-bold">{item.division_name}</h5>
              </div>
              <div className="card-modern-body">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-venus-mars me-2 text-muted"></i>
                      <div>
                        <small className="text-muted d-block">Gender</small>
                        <strong>{item.gender}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-birthday-cake me-2 text-muted"></i>
                      <div>
                        <small className="text-muted d-block">Age Range</small>
                        <strong>{item.age_group}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-medal me-2 text-muted"></i>
                      <div>
                        <small className="text-muted d-block">Level</small>
                        <strong>{item.proficiency_level}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-tag me-2 text-muted"></i>
                      <div>
                        <small className="text-muted d-block">Category</small>
                        <strong>{item.category}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-users me-2 text-muted"></i>
                      <div>
                        <small className="text-muted d-block">Competitors</small>
                        <strong>{item.participant_count}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-modern-footer">
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-modern text-center" 
                    onClick={() => handleViewDetails(item)}
                    style={{
                      width: '100%', 
                      minWidth: '0', 
                      padding: '0.5rem 1rem',
                      margin: '0',
                      border: '1px solid',
                      boxSizing: 'border-box'
                    }}
                  >
                    <i className="fas fa-user-plus me-2"></i>
                    Register Now
                  </button>
                  <button 
                    className="btn btn-modern text-center" 
                    onClick={() => handleView(item)}
                    style={{
                      width: '100%', 
                      minWidth: '0', 
                      padding: '0.5rem 1rem',
                      margin: '0',
                      border: '1px solid',
                      boxSizing: 'border-box',
                      backgroundColor: 'transparent',
                      color: 'var(--bs-primary)'
                    }}
                  >
                    <i className="fas fa-eye me-2"></i>
                    View Players
                  </button>
                  <button 
                    className="btn btn-modern text-center" 
                    onClick={() => addToCart(item)}
                    style={{
                      width: '100%', 
                      minWidth: '0', 
                      padding: '0.5rem 1rem',
                      margin: '0',
                      border: '1px solid',
                      boxSizing: 'border-box',
                      backgroundColor: 'transparent',
                      color: 'var(--bs-primary)'
                    }}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-5">
          <i className="fas fa-trophy fa-4x text-muted mb-4"></i>
          <h4 className="text-muted">No divisions available</h4>
          <p className="text-muted">Check back later for division announcements</p>
        </div>
      )}
    </div>
  );
};
