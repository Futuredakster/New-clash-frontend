import { Link, useNavigate,useLocation } from 'react-router-dom';
import React, { useState, useContext, useEffect } from "react";
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Navbar, Nav, Container, Dropdown, Offcanvas } from 'react-bootstrap';
import { link } from './constant';

const Tolpbar = () => {
    const { authState, setAuthState, setPartState, partState,parentState,setParentState } = useContext(AuthContext);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [setUp, setSetUp] = useState(false);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tournament_id = queryParams.get('tournament_id');

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            console.error('Access token not found. API request not made.');
            setError('Access token not found');
            setLoading(false);
            return;
        }

        const fetchAccountInfo = async () => {
            try {
                const [userResponse] = await Promise.all([
                    axios.get(`${link}/users`, {
                        headers: { accessToken },
                    }),
                ]);
                setUser(userResponse.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAccountInfo();
        isSetUp();

    }, [authState.status]);

     const isSetUp = async () => {
         const accessToken = localStorage.getItem('accessToken');
            try {
                const response = await axios.get(`${link}/users/status`, {
                    headers: { accessToken },
                });
                if(response.data.message === true){
                   setSetUp(true);
                   
                } else {
                    setSetUp(false);
                }
            } catch (error) {
                console.error('Error checking setup status:', error);
                throw error;
            }
        };

        const fetchPayUrl= async () => {
             const accessToken = localStorage.getItem('accessToken');
            try {
                const response = await axios.get(`${link}/users/connect`, {
                    headers: { accessToken },
                });
                window.location.href =response.data.url; 
            } catch (error) {
                console.error('Error fetching payment URL:', error);
                throw error;
            }
        }
    const logout = () => {
        localStorage.removeItem("accessToken");
        setAuthState({ username: "", id: 0, status: false, account_id: 0, role: "" });
        setUser(null);
        setSetUp(false);
        navigate("/LandingPage");
    };

    const logoutPart = () => {
        localStorage.removeItem("participantAccessToken");
        setPartState({ id: 0, name: "", status: false });
        navigate("/LandingPage");
    };

    const logoutParent = () => {
        localStorage.removeItem("parentToken");
        setParentState({ id: 0, name: "", status: false });
        navigate("/LandingPage");
    };

    const handleMobileMenuClose = () => setShowMobileMenu(false);
    const handleMobileMenuShow = () => setShowMobileMenu(true);

    const checkUsername = () => {
        if (user && user.username) {
            return user.username;
        }
        return authState.username;
    };

    const checkUserRole = () => {
        if (user && user.role) {
            return user.role;
        }
        return authState.role || '';
    };


    return (
        <>
            <Navbar expand="lg" className="navbar-modern shadow-sm" fixed="top">
                <Container fluid>
                    {!authState.status ? (
                        <Navbar.Brand as={Link} to="/LandingPage" className="fw-bold text-dark">
                            <i className="fas fa-trophy me-2"></i>
                            Clash
                        </Navbar.Brand>
                    ) : (
                        <Navbar.Brand as={Link} to="/Home" className="fw-bold text-dark">
                            <i className="fas fa-trophy me-2"></i>
                            Clash
                        </Navbar.Brand>
                    )}

                    {/* Mobile Hamburger Menu - Show for both authenticated and non-authenticated users */}
                    <button
                        className="navbar-toggler d-lg-none"
                        type="button"
                        onClick={handleMobileMenuShow}
                        aria-controls="mobile-menu"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <i className="fas fa-bars"></i>
                    </button>

                    {/* Desktop Navigation */}
                    <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-flex">
                        <Nav className="ms-auto align-items-center">
                            {(!authState.status && !partState.status && !parentState.status) ? (
                                <>
                                    <Nav.Link as={Link} to="/ViewerTour" className="text-dark">
                                        Browse Tournaments
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/Login">
                                        <button className="btn btn-modern-outline btn-sm">
                                            <i className="fas fa-sign-in-alt me-1"></i>
                                            Login
                                        </button>
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/AccountUser">
                                        <button className="btn btn-modern btn-sm">
                                            <i className="fas fa-user-plus me-1"></i>
                                            Sign Up
                                        </button>
                                    </Nav.Link>
                                </>
                            ) : authState.role ? (
                                <>
                                    {authState.role?.toLowerCase() === 'host' && setUp === false && (
                                        <Nav.Link as="div" className="payment-pop-btn">
                                            <button onClick={fetchPayUrl} className="btn btn-modern btn-sm me-2 text-white bg-dark border-dark d-flex align-items-center justify-content-center">
                                                <i className="fas fa-credit-card me-1"></i>
                                                Set Up Payment
                                            </button>
                                        </Nav.Link>
                                    )}
                                    {authState.role?.toLowerCase() === 'host' && setUp === true && (
                                        <span className="badge bg-success text-white px-3 py-2 me-2 d-flex align-items-center">
                                            <i className="fas fa-check-circle me-2"></i>
                                            Congrats {checkUsername()}! Payment is set up.
                                        </span>
                                    )}
                                    <Nav.Link as={Link} to="/Home" className="text-dark">
                                        <i className="fas fa-home me-1"></i>
                                        Dashboard
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/CreateTournaments" className="text-dark">
                                        <i className="fas fa-plus me-1"></i>
                                        Create
                                    </Nav.Link>
                                    <Dropdown align="end">
                                        <Dropdown.Toggle 
                                            variant="link" 
                                            className="text-decoration-none text-dark d-flex align-items-center"
                                            id="user-dropdown"
                                        >
                                            <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                                 style={{width: '32px', height: '32px'}}>
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <span className="d-none d-md-inline">{checkUsername()} <span className="text-muted" style={{fontSize: '0.9em'}}>({checkUserRole() || authState.role})</span></span>
                                            <i className="fas fa-chevron-down ms-1"></i>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="dropdown-modern">
                                            <Dropdown.Header>
                                                <small className="text-muted">
                                                    Welcome, {checkUsername()} <span className="text-muted">({checkUserRole() || authState.role})</span>
                                                </small>
                                            </Dropdown.Header>
                                            <Dropdown.Divider />
                                            <Dropdown.Item as={Link} to="/EditUser">
                                                <i className="fas fa-user-cog me-2"></i>
                                                Profile Settings
                                            </Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/MyTournaments">
                                                <i className="fas fa-list me-2"></i>
                                                My Tournaments
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={logout} className="text-danger">
                                                <i className="fas fa-sign-out-alt me-2"></i>
                                                Logout
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </>
                            ) : partState.status ? (
                                <>
                                    <Nav.Link as="div" className="d-flex align-items-center">
                                        <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <span className="d-none d-md-inline">{partState.name}</span>
                                      {tournament_id && (
                                        <span className="ms-2">
                                            <button onClick={() => navigate(`DisplayCart?tournament_id=${tournament_id}`)} className="btn btn-outline-primary btn-sm">
                                                <i className="fas fa-shopping-cart"></i>
                                            </button>
                                        </span>
                                    )}
                                                                            <button className="btn btn-outline-danger btn-sm ms-3" onClick={logoutPart}>
                                            <i className="fas fa-sign-out-alt me-1"></i> Logout
                                        </button>
                                    </Nav.Link>
                                </>
                            ) : parentState.status ? (
                                <>
                                    <Nav.Link as="div" className="d-flex align-items-center">
                                        <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <span className="d-none d-md-inline">{parentState.name}</span>
                                      {tournament_id && (
                                        <span className="ms-2">
                                            <button onClick={() => navigate(`DisplayCart?tournament_id=${tournament_id}`)} className="btn btn-outline-primary btn-sm">
                                                <i className="fas fa-shopping-cart"></i>
                                            </button>
                                        </span>
                                    )}
                                                                            <button className="btn btn-outline-danger btn-sm ms-3" onClick={logoutParent}>
                                            <i className="fas fa-sign-out-alt me-1"></i> Logout
                                        </button>
                                    </Nav.Link>
                                </>
                            ) : null}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Mobile Offcanvas Menu */}
            <Offcanvas 
                show={showMobileMenu} 
                onHide={handleMobileMenuClose} 
                placement="end"
                className="mobile-menu-offcanvas"
            >
                <Offcanvas.Header closeButton className="border-bottom">
                    <Offcanvas.Title>
                        <i className="fas fa-trophy me-2"></i>
                        Menu
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <div className="mobile-menu-content">
                        {authState.status ? (
                            <>
                                {/* User Profile Section */}
                                <div className="mobile-user-section p-3 border-bottom bg-light">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                             style={{width: '40px', height: '40px'}}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold">{checkUsername()} <span className="text-muted">({checkUserRole() || authState.role})</span></div>
                                            <small className="text-muted">Tournament Creator</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation Menu */}
                                <nav className="mobile-nav p-3">
                                    {/* Dashboard */}
                                    <Link to="/Home" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                        <i className="fas fa-home me-3"></i>
                                        Dashboard
                                    </Link>

                                       {authState.role?.toLowerCase() === 'host' && setUp === false && (
                                            <button onClick={fetchPayUrl} className="btn btn-modern w-100 mb-3 d-flex align-items-center justify-content-center text-white bg-dark border-dark payment-pop-btn">
                                                <i className="fas fa-credit-card me-2"></i>
                                                Set Up Payment
                                            </button>
                                        )}

                                        {authState.role?.toLowerCase() === 'host' && setUp === true && (
                                            <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                                                <i className="fas fa-check-circle me-2"></i>
                                                <span>Congrats {checkUsername()}! Payment is set up.</span>
                                            </div>
                                        )}

                                    {/* Tournament Management Section */}
                                    <div className="mobile-nav-section">
                                        <div className="mobile-nav-section-title">Tournament Management</div>
                                        <Link to="/CreateTournaments" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-plus-circle me-3"></i>
                                            Create Tournament
                                        </Link>
                                        <Link to="/MyTournaments" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-list me-3"></i>
                                            My Tournaments
                                        </Link>
                                    </div>

                                    {/* User Management Section */}
                                    <div className="mobile-nav-section">
                                        <div className="mobile-nav-section-title">User Management</div>
                                        <Link to="/CreateUsers" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-user-plus me-3"></i>
                                            Create Users
                                        </Link>
                                        <Link to="/EditUser" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-user-edit me-3"></i>
                                            Edit Profile
                                        </Link>
                                    </div>
                                </nav>

                                {/* Logout Button */}
                                <div className="p-3 border-top mt-auto">
                                    <button 
                                        className="btn btn-outline-danger w-100" 
                                        onClick={() => {
                                            logout();
                                            handleMobileMenuClose();
                                        }}
                                    >
                                        <i className="fas fa-sign-out-alt me-2"></i>
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : partState.status ? (
                            <>
                                {/* Participant Profile Section */}
                                <div className="mobile-user-section p-3 border-bottom bg-light">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                             style={{width: '40px', height: '40px'}}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold">{partState.name}</div>
                                            <small className="text-muted">Tournament Participant</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Participant Navigation Menu */}
                                <nav className="mobile-nav p-3">
                                    {tournament_id && (
                                        <Link 
                                            to={`DisplayCart?tournament_id=${tournament_id}`} 
                                            className="mobile-nav-link" 
                                            onClick={handleMobileMenuClose}
                                        >
                                            <i className="fas fa-shopping-cart me-3"></i>
                                            My Cart
                                        </Link>
                                    )}

                                    <Link to="/ViewerTour" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                        <i className="fas fa-search me-3"></i>
                                        Browse Tournaments
                                    </Link>
                                </nav>

                                {/* Participant Logout Button */}
                                <div className="p-3 border-top mt-auto">
                                    <button 
                                        className="btn btn-outline-danger w-100" 
                                        onClick={() => {
                                            logoutPart();
                                            handleMobileMenuClose();
                                        }}
                                    >
                                        <i className="fas fa-sign-out-alt me-2"></i>
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : parentState.status ? (
                            <>
                                {/* Parent Profile Section */}
                                <div className="mobile-user-section p-3 border-bottom bg-light">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                             style={{width: '40px', height: '40px'}}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold">{parentState.name}</div>
                                            <small className="text-muted">Tournament Parent</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Parent Navigation Menu */}
                                <nav className="mobile-nav p-3">
                                    {tournament_id && (
                                        <Link 
                                            to={`DisplayCart?tournament_id=${tournament_id}`} 
                                            className="mobile-nav-link" 
                                            onClick={handleMobileMenuClose}
                                        >
                                            <i className="fas fa-shopping-cart me-3"></i>
                                            My Cart
                                        </Link>
                                    )}

                                    <Link to="/ViewerTour" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                        <i className="fas fa-search me-3"></i>
                                        Browse Tournaments
                                    </Link>
                                </nav>

                                {/* Parent Logout Button */}
                                <div className="p-3 border-top mt-auto">
                                    <button 
                                        className="btn btn-outline-danger w-100" 
                                        onClick={() => {
                                            logoutParent();
                                            handleMobileMenuClose();
                                        }}
                                    >
                                        <i className="fas fa-sign-out-alt me-2"></i>
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Guest User Section */}
                                <div className="mobile-user-section p-3 border-bottom bg-light">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                             style={{width: '40px', height: '40px'}}>
                                            <i className="fas fa-trophy"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold">Welcome to Clash</div>
                                            <small className="text-muted">Tournament Platform</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Guest Navigation Menu */}
                                <nav className="mobile-nav p-3">
                                    <Link to="/ViewerTour" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                        <i className="fas fa-search me-3"></i>
                                        Browse Tournaments
                                    </Link>

                                    <div className="mobile-nav-section">
                                        <div className="mobile-nav-section-title">Account</div>
                                        <Link to="/Login" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-sign-in-alt me-3"></i>
                                            Login
                                        </Link>
                                        <Link to="/AccountUser" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-user-plus me-3"></i>
                                            Sign Up
                                        </Link>
                                    </div>
                                </nav>
                            </>
                        )}
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default Tolpbar;









/*import { Link } from 'react-router-dom';
import React, { useState,useContext,useEffect } from "react";
import axios from 'axios';
import {AuthContext} from '../../context/AuthContext';

const Tolpbar = () => {
    const {authState, setAuthState} = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('Access token not found. API request not made.');
        setError('Access token not found');
        setLoading(false);
        return;
      }
  
      const fetchAccountInfo = async () => {
        try {
          const [userResponse] = await Promise.all([
            axios.get(`${link}/users`, {
              headers: { accessToken },
            }),
          ]);
          setUser(userResponse.data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchAccountInfo();
    }, []);

    const logout = () => {
        localStorage.removeItem("accessToken");
        setAuthState({ username: "", id: 0, status: false ,account_id: 0});
      };

      const checkUsername = () => {
        if (user && user.username) {
            return user.username;
        }
        return authState.username;
    };
    return (
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark py-3">
    
          <a href="#" className="navbar-brand container">Clash</a>
 
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navmenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
 
          <div className="collapse navbar-collapse" id="navmenu">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                  {!authState.status ?(
            <Link to="/Login" className="nav-link dropdown-toggle">Login</Link> 
            ):(
              <Link to="/LandingPage" className="btn btn-primary" onClick={logout}>
              Logout
            </Link>
                
            )}
              </li>
              <li className="nav-item">
              {!authState.status ?(
                   <Link to="/AccountUser" className="nav-link dropdown-toggle">Create New Account</Link>
            ):(
              <Link to="/EditUser" className="nav-link dropdown-toggle"> {checkUsername()} </Link>
            )}
              </li>
            </ul>
          </div>
        
        </nav>
    );
}
export default Tolpbar;
*/
     