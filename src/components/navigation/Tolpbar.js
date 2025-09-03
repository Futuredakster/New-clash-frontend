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
    const [cartCount, setCartCount] = useState(0);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tournament_id = queryParams.get('tournament_id');

    const fetchCartCount = async () => {
        // Only fetch if we have tournament_id and either participant or parent is logged in
        if (!tournament_id || (!partState.status && !parentState.status)) {
            setCartCount(0);
            return;
        }

        try {
            // Check if participant is logged in
            const participantToken = localStorage.getItem('participantAccessToken');
            if (participantToken && partState.status) {
                const response = await axios.get(`${link}/cart/counts`, {
                    headers: { participantAccessToken: participantToken },
                    params: { tournament_id: tournament_id }
                });
                setCartCount(response.data || 0);
                return;
            }

            // Check if parent is logged in
            const parentToken = localStorage.getItem('parentToken');
            if (parentToken && parentState.status) {
                const response = await axios.get(`${link}/cart/count`, {
                    headers: { parentAccessToken: parentToken },
                    params: { tournament_id: tournament_id }
                });
                setCartCount(response.data || 0);
                return;
            }

            setCartCount(0);
        } catch (error) {
            console.error('Error fetching cart count:', error);
            // Don't let cart count errors break the navigation
            setCartCount(0);
        }
    };

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

    useEffect(() => {
        fetchCartCount();
    }, [tournament_id, partState.status, parentState.status]);

    // Expose cart refresh function globally
    useEffect(() => {
        window.refreshCartCount = fetchCartCount;
        return () => {
            delete window.refreshCartCount;
        };
    }, [tournament_id, partState.status, parentState.status]);

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
                    {!authState.status && !partState.status && !parentState.status ? (
                        <Navbar.Brand as={Link} to="/LandingPage" className="fw-bold text-dark">
                            <i className="fas fa-trophy me-2"></i>
                            Clash
                        </Navbar.Brand>
                    ) : authState.status ? (
                        <Navbar.Brand as={Link} to="/Home" className="fw-bold text-dark">
                            <i className="fas fa-trophy me-2"></i>
                            Clash
                        </Navbar.Brand>
                    ) : partState.status ? (
                        <Navbar.Brand 
                            onClick={logoutPart} 
                            className="fw-bold text-dark" 
                            style={{cursor: 'pointer'}}
                            title="Click to logout"
                        >
                            <i className="fas fa-trophy me-2"></i>
                            Clash
                        </Navbar.Brand>
                    ) : parentState.status ? (
                        <Navbar.Brand 
                            onClick={logoutParent} 
                            className="fw-bold text-dark" 
                            style={{cursor: 'pointer'}}
                            title="Click to logout"
                        >
                            <i className="fas fa-trophy me-2"></i>
                            Clash
                        </Navbar.Brand>
                    ) : (
                        <Navbar.Brand as={Link} to="/LandingPage" className="fw-bold text-dark">
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
                                        Browse Karate Tournaments
                                    </Nav.Link>
                                    <Nav.Link as="div">
                                        <button 
                                            className="btn btn-modern-outline btn-sm"
                                            onClick={() => navigate('/Login', { replace: true })}
                                        >
                                            <i className="fas fa-sign-in-alt me-1"></i>
                                            Manage My Tournaments
                                        </button>
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/AccountUser">
                                        <button className="btn btn-modern btn-sm">
                                            <i className="fas fa-trophy me-1"></i>
                                            Create Tournaments
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
                                    <Dropdown>
                                        <Dropdown.Toggle 
                                            variant="link" 
                                            className="text-decoration-none text-dark d-flex align-items-center"
                                            id="participant-dropdown"
                                        >
                                            <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                                 style={{width: '32px', height: '32px'}}>
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <span className="d-none d-md-inline">{partState.name}</span>
                                            <i className="fas fa-chevron-down ms-1"></i>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="dropdown-modern">
                                            <Dropdown.Header>
                                                <small className="text-muted">
                                                    Welcome, {partState.name}
                                                </small>
                                            </Dropdown.Header>
                                            <Dropdown.Divider />
                                            <Dropdown.Item as={Link} to="/ParticipantDetails">
                                                <i className="fas fa-user-cog me-2"></i>
                                                Personal Details
                                            </Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/CompetitorView">
                                                <i className="fas fa-user-plus me-2"></i>
                                                Register yourself
                                            </Dropdown.Item>
                                             <Dropdown.Item as={Link} to="/TournamentView">
                                                <i className="fas fa-trophy me-2"></i>
                                                My Karate Competitions
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={logoutPart} className="text-danger">
                                                <i className="fas fa-sign-out-alt me-2"></i>
                                                Logout
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                    {tournament_id && (
                                        <span className="ms-3">
                                            <button 
                                                onClick={() => navigate(`DisplayCart?tournament_id=${tournament_id}`)} 
                                                className="position-relative d-flex align-items-center justify-content-center"
                                                style={{
                                                    backgroundColor: `${cartCount > 0 ? '#e8f5e9' : '#f8f9fa'} !important`,
                                                    color: `${cartCount > 0 ? '#28a745' : '#6c757d'} !important`,
                                                    border: `2px solid ${cartCount > 0 ? '#28a745' : '#dee2e6'} !important`,
                                                    borderRadius: '50px !important',
                                                    padding: '8px 16px !important',
                                                    fontSize: '14px !important',
                                                    fontWeight: '600 !important',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: cartCount > 0 ? '0 2px 8px rgba(40, 167, 69, 0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
                                                    minWidth: '80px',
                                                    height: '36px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = cartCount > 0 ? '0 4px 12px rgba(40, 167, 69, 0.4)' : '0 2px 8px rgba(0,0,0,0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = cartCount > 0 ? '0 2px 8px rgba(40, 167, 69, 0.3)' : '0 1px 4px rgba(0,0,0,0.1)';
                                                }}
                                            >
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <i className="fas fa-shopping-bag me-2"></i>
                                                    <span className="d-none d-sm-inline">Cart</span>
                                                    {cartCount > 0 && (
                                                        <span className="badge bg-white text-success rounded-pill ms-2 fw-bold" style={{fontSize: '11px', border: '1px solid #28a745'}}>
                                                            {cartCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        </span>
                                    )}
                                </>
                            ) : parentState.status ? (
                                <>
                                    {tournament_id && (
                                        <Nav.Link as="div" className="me-2">
                                            <button 
                                                onClick={() => navigate(`DisplayCart?tournament_id=${tournament_id}`)} 
                                                className="position-relative d-flex align-items-center justify-content-center"
                                                style={{
                                                    backgroundColor: `${cartCount > 0 ? '#e8f5e9' : '#f8f9fa'} !important`,
                                                    color: `${cartCount > 0 ? '#28a745' : '#6c757d'} !important`,
                                                    border: `2px solid ${cartCount > 0 ? '#28a745' : '#dee2e6'} !important`,
                                                    borderRadius: '50px !important',
                                                    padding: '8px 16px !important',
                                                    fontSize: '14px !important',
                                                    fontWeight: '600 !important',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: cartCount > 0 ? '0 2px 8px rgba(40, 167, 69, 0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
                                                    minWidth: '80px',
                                                    height: '36px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = cartCount > 0 ? '0 4px 12px rgba(40, 167, 69, 0.4)' : '0 2px 8px rgba(0,0,0,0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = cartCount > 0 ? '0 2px 8px rgba(40, 167, 69, 0.3)' : '0 1px 4px rgba(0,0,0,0.1)';
                                                }}
                                            >
                                                <div className="d-flex align-items-center justify-content-center">
                                                    <i className="fas fa-shopping-bag me-2"></i>
                                                    <span className="d-none d-sm-inline">Cart</span>
                                                    {cartCount > 0 && (
                                                        <span className="badge bg-white text-success rounded-pill ms-2 fw-bold" style={{fontSize: '11px', border: '1px solid #28a745'}}>
                                                            {cartCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        </Nav.Link>
                                    )}
                                    
                                    <Dropdown align="end">
                                        <Dropdown.Toggle 
                                            variant="link" 
                                            className="text-decoration-none text-dark d-flex align-items-center"
                                            id="parent-dropdown"
                                        >
                                            <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                                                 style={{width: '32px', height: '32px'}}>
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <span className="d-none d-md-inline">{parentState.name} <span className="text-muted" style={{fontSize: '0.9em'}}>(Parent)</span></span>
                                            <i className="fas fa-chevron-down ms-1"></i>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu className="dropdown-modern">
                                            <Dropdown.Header>
                                                <small className="text-muted">
                                                    Welcome, {parentState.name} <span className="text-muted">(Parent/Guardian)</span>
                                                </small>
                                            </Dropdown.Header>
                                            <Dropdown.Divider />
                                            <Dropdown.Item as={Link} to="/ParentDetails">
                                                <i className="fas fa-user-cog me-2"></i>
                                                Personal Details
                                            </Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/ParentChilds">
                                                <i className="fas fa-users me-2"></i>
                                                My Karate Competitors
                                            </Dropdown.Item>
                                             <Dropdown.Item as={Link} to="/CompetitorView">
                                                <i className="fas fa-child me-2"></i>
                                                Register for Competitions
                                            </Dropdown.Item>
                                             <Dropdown.Item as={Link} to="/TournamentView">
                                                <i className="fas fa-trophy me-2"></i>
                                                My Karate Competitions
                                            </Dropdown.Item>
                                            <Dropdown.Divider />
                                            <Dropdown.Item onClick={logoutParent} className="text-danger">
                                                <i className="fas fa-sign-out-alt me-2"></i>
                                                Logout
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
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
                                            <small className="text-muted">Karate Tournament Organizer</small>
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
                                        <div className="mobile-nav-section-title">Karate Tournament Management</div>
                                        <Link to="/CreateTournaments" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-plus-circle me-3"></i>
                                            Create Karate Tournament
                                        </Link>
                                        <Link to="/MyTournaments" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-list me-3"></i>
                                            My Karate Tournaments
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
                                            <small className="text-muted">Karate Competitor</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Participant Navigation Menu */}
                                <nav className="mobile-nav p-3">
                                    {tournament_id && (
                                        <Link 
                                            to={`DisplayCart?tournament_id=${tournament_id}`} 
                                            className="mobile-nav-link d-flex align-items-center justify-content-between" 
                                            onClick={handleMobileMenuClose}
                                            style={{
                                                backgroundColor: cartCount > 0 ? '#e8f5e9' : '#f8f9fa',
                                                border: `2px solid ${cartCount > 0 ? '#28a745' : '#dee2e6'}`,
                                                borderRadius: '50px',
                                                margin: '8px -12px',
                                                padding: '12px 20px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: cartCount > 0 ? '0 2px 8px rgba(40, 167, 69, 0.2)' : '0 1px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <span className="d-flex align-items-center">
                                                <i className="fas fa-shopping-bag me-3" style={{color: cartCount > 0 ? '#28a745' : '#6c757d'}}></i>
                                                <span style={{
                                                    color: cartCount > 0 ? '#28a745' : '#6c757d', 
                                                    fontWeight: '600'
                                                }}>
                                                    My Cart
                                                </span>
                                            </span>
                                            {cartCount > 0 && (
                                                <span className="badge bg-white text-success rounded-pill px-2 py-1" style={{
                                                    fontSize: '11px', 
                                                    fontWeight: '600',
                                                    border: '1px solid #28a745'
                                                }}>
                                                    {cartCount}
                                                </span>
                                            )}
                                        </Link>
                                    )}

                                    <Link to="/ParticipantDetails" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                        <i className="fas fa-user-cog me-3"></i>
                                        Personal Details
                                    </Link>
                                    <Link to="/CompetitorView" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-user-plus me-3"></i>
                                            Sign yourself up!
                                        </Link>
                                        <Link to="/TournamentView" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-trophy me-3"></i>
                                            My Karate Competitions
                                        </Link>

                                    <Link to="/ViewerTour" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                        <i className="fas fa-search me-3"></i>
                                        Browse Karate Tournaments
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
                                            <small className="text-muted">Karate Parent/Guardian</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Parent Navigation Menu */}
                                <nav className="mobile-nav p-3">
                                    {tournament_id && (
                                        <Link 
                                            to={`DisplayCart?tournament_id=${tournament_id}`} 
                                            className="mobile-nav-link d-flex align-items-center justify-content-between" 
                                            onClick={handleMobileMenuClose}
                                            style={{
                                                backgroundColor: cartCount > 0 ? '#e8f5e9' : '#f8f9fa',
                                                border: `2px solid ${cartCount > 0 ? '#28a745' : '#dee2e6'}`,
                                                borderRadius: '50px',
                                                margin: '8px -12px',
                                                padding: '12px 20px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: cartCount > 0 ? '0 2px 8px rgba(40, 167, 69, 0.2)' : '0 1px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <span className="d-flex align-items-center">
                                                <i className="fas fa-shopping-bag me-3" style={{color: cartCount > 0 ? '#28a745' : '#6c757d'}}></i>
                                                <span style={{
                                                    color: cartCount > 0 ? '#28a745' : '#6c757d', 
                                                    fontWeight: '600'
                                                }}>
                                                    My Cart
                                                </span>
                                            </span>
                                            {cartCount > 0 && (
                                                <span className="badge bg-white text-success rounded-pill px-2 py-1" style={{
                                                    fontSize: '11px', 
                                                    fontWeight: '600',
                                                    border: '1px solid #28a745'
                                                }}>
                                                    {cartCount}
                                                </span>
                                            )}
                                        </Link>
                                    )}

                                    <Link to="/ViewerTour" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                        <i className="fas fa-search me-3"></i>
                                        Browse Karate Tournaments
                                    </Link>

                                    {/* Parent Management Section */}
                                    <div className="mobile-nav-section">
                                        <div className="mobile-nav-section-title">Account Management</div>
                                        <Link to="/ParentDetails" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-user-cog me-3"></i>
                                            Personal Details
                                        </Link>
                                        <Link to="/ParentChilds" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-users me-3"></i>
                                            My Karate Competitors
                                        </Link>
                                        <Link to="/CompetitorView" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-child me-3"></i>
                                            Sign your Child Up!
                                        </Link>
                                        <Link to="/TournamentView" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-trophy me-3"></i>
                                            My Karate Competitions
                                        </Link>
                                    </div>
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
                                            <small className="text-muted">Karate Tournament Platform</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Guest Navigation Menu */}
                                <nav className="mobile-nav p-3">
                                    <Link to="/ViewerTour" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                        <i className="fas fa-search me-3"></i>
                                        Browse Karate Tournaments
                                    </Link>

                                    <div className="mobile-nav-section">
                                        <div className="mobile-nav-section-title">Account</div>
                                        <button 
                                            className="mobile-nav-link w-100 text-start border-0 bg-transparent"
                                            onClick={() => {
                                                navigate('/Login', { replace: true });
                                                handleMobileMenuClose();
                                            }}
                                        >
                                            <i className="fas fa-sign-in-alt me-3"></i>
                                            Manage My Tournaments
                                        </button>
                                        <Link to="/AccountUser" className="mobile-nav-link" onClick={handleMobileMenuClose}>
                                            <i className="fas fa-trophy me-3"></i>
                                            Create Tournaments
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
     