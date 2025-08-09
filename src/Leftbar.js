import { Link } from 'react-router-dom';

const Leftbar = () => {
    return (
        <div className="sidebar-modern d-flex flex-column">
            {/* Brand/Logo Section */}
            <div className="p-4 border-bottom border-secondary">
                <Link to="/Home" className="text-decoration-none">
                    <h4 className="text-white mb-0 fw-bold">
                        <i className="fas fa-trophy me-2"></i>
                        Clash
                    </h4>
                </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-grow-1 p-3">
                <ul className="nav nav-pills flex-column">
                    {/* Dashboard */}
                    <li className="nav-item mb-2">
                        <Link to="/Home" className="nav-link text-white d-flex align-items-center">
                            <i className="fas fa-home me-3"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    {/* Tournament Management */}
                    <li className="nav-item mb-2">
                        <div className="text-white-50 text-uppercase small fw-bold px-3 py-2">
                            Tournament Management
                        </div>
                    </li>
                    
                    <li className="nav-item mb-1">
                        <Link to="/CreateTournaments" className="nav-link text-white d-flex align-items-center">
                            <i className="fas fa-plus-circle me-3"></i>
                            <span>Create Tournament</span>
                        </Link>
                    </li>
                    
                    <li className="nav-item mb-1">
                        <Link to="/MyTournaments" className="nav-link text-white d-flex align-items-center">
                            <i className="fas fa-list me-3"></i>
                            <span>My Tournaments</span>
                        </Link>
                    </li>

                    {/* User Management */}
                    <li className="nav-item mb-2 mt-4">
                        <div className="text-white-50 text-uppercase small fw-bold px-3 py-2">
                            User Management
                        </div>
                    </li>
                    
                    <li className="nav-item mb-1">
                        <Link to="/CreateUsers" className="nav-link text-white d-flex align-items-center">
                            <i className="fas fa-user-plus me-3"></i>
                            <span>Create Users</span>
                        </Link>
                    </li>
                    
                    <li className="nav-item mb-1">
                        <Link to="/EditUser" className="nav-link text-white d-flex align-items-center">
                            <i className="fas fa-user-edit me-3"></i>
                            <span>Edit Profile</span>
                        </Link>
                    </li>

                    
                </ul>
            </nav>

            
        </div>
    );
}

export default Leftbar;