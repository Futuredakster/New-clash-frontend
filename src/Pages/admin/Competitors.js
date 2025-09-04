import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { link } from '../../constant';
import { useNavigate } from 'react-router-dom';
import Searchbar from '../../components/navigation/Searchbar';
import EditCompetitorModal from '../../components/modals/EditCompetitorModal';

const Competitors = () => {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitors();
  }, []);

  // Fetch competitors when search term changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCompetitors();
    }, 300); // Debounce search requests by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchCompetitors = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/Login');
        return;
      }

      // Add search parameter to the request
      const params = new URLSearchParams();
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await axios.get(`${link}/participants/users?${params.toString()}`, {
        headers: {
          'accessToken': token
        }
      });
      setCompetitors(response.data);
    } catch (error) {
      console.error("Error fetching competitors:", error);
      setError(error.response?.data?.error || 'Failed to fetch competitors');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompetitor = (competitor) => {
    setSelectedCompetitor(competitor);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedCompetitor(null);
  };

  const handleUpdateCompetitor = () => {
    // Refresh competitors data after update
    fetchCompetitors();
  };

  const handleDeleteCompetitor = async (participantId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${link}/participants/${participantId}`, {
        headers: {
          'accessToken': token
        }
      });
      
      // Remove from state
      setCompetitors(prev => prev.filter(c => c.participant_id !== participantId));
      alert(`${name} has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting competitor:', error);
      alert(error.response?.data?.error || 'Failed to delete competitor');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getBeltColorBadge = (beltColor) => {
    const colorMap = {
      'White': 'bg-light text-dark',
      'Yellow': 'bg-warning text-dark',
      'Orange': 'bg-warning text-white',
      'Green': 'bg-success text-white',
      'Purple': 'bg-info text-white',
      'Brown': 'bg-secondary text-white',
      'Black': 'bg-dark text-white'
    };
    
    return colorMap[beltColor] || 'bg-secondary text-white';
  };

  return (
    <div className="container-modern py-5" style={{ minHeight: 'calc(100vh - 76px)' }}>
      {/* Page Header */}
      <div className="page-header-modern mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <h1 className="page-title-modern">
              <i className="fas fa-users me-2"></i>
              Competitors
            </h1>
            <p className="page-subtitle-modern">Manage your tournament competitors</p>
          </div>
          <button 
            onClick={() => navigate('/ParticipantForms')}
            className="btn btn-modern"
            style={{ fontWeight: 600 }}
          >
            <i className="fas fa-user-plus me-2"></i>
            Add Competitors
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="card-modern p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-8">
            <Searchbar 
              search={searchTerm} 
              setSearch={setSearchTerm} 
              placeholder="Search competitors by name, email, or belt color..."
              ariaLabel="Search competitors"
            />
          </div>
          <div className="col-md-4 text-md-end">
            <span className="text-muted">
              <i className="fas fa-chart-bar me-2"></i>
              {competitors.length} competitor{competitors.length !== 1 ? 's' : ''}
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading competitors...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Competitors Table */}
      {!loading && !error && (
        <>
          {competitors.length === 0 ? (
            <div className="card-modern p-5 text-center">
              <i className="fas fa-users fa-4x text-muted mb-4"></i>
              <h4 className="text-muted mb-3">
                {searchTerm ? 'No competitors found' : 'No Competitors Yet'}
              </h4>
              <p className="text-muted mb-4">
                {searchTerm 
                  ? `No competitors match your search for "${searchTerm}".`
                  : "Start by adding your first competitors to the tournament."
                }
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => navigate('/ParticipantForms')}
                  className="btn btn-modern"
                >
                  <i className="fas fa-user-plus me-2"></i>
                  Add First Competitor
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="d-none d-lg-block">
                <div className="card-modern p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 w-100" style={{ minWidth: '800px', tableLayout: 'fixed', height: 'auto' }}>
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 ps-4" style={{ width: '30%' }}>
                        <i className="fas fa-user me-2 d-none d-md-inline"></i>
                        <span className="d-md-none">Name</span>
                        <span className="d-none d-md-inline">Name</span>
                      </th>
                      <th className="border-0 d-none d-lg-table-cell" style={{ width: '25%' }}>
                        <i className="fas fa-envelope me-2"></i>Email
                      </th>
                      <th className="border-0 d-none d-xl-table-cell" style={{ width: '15%' }}>
                        <i className="fas fa-calendar-alt me-2"></i>Date of Birth
                      </th>
                      <th className="border-0" style={{ width: '15%' }}>
                        <i className="fas fa-medal me-2 d-none d-sm-inline"></i>
                        <span className="d-sm-none">Belt</span>
                        <span className="d-none d-sm-inline">Belt Color</span>
                      </th>
                      <th className="border-0 d-none d-lg-table-cell" style={{ width: '15%' }}>
                        <i className="fas fa-calendar-plus me-2"></i>Registered
                      </th>
                      <th className="border-0 text-center" style={{ width: '80px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitors.map((competitor) => (
                      <tr key={competitor.participant_id} style={{ height: '60px' }}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ width: '40px', height: '40px', fontSize: '16px', color: 'white' }}>
                              {competitor.name?.charAt(0)?.toUpperCase() || 'N'}
                            </div>
                            <div>
                              <div className="fw-medium">{competitor.name || 'N/A'}</div>
                              <small className="text-muted d-none d-md-block">ID: {competitor.participant_id}</small>
                              <small className="text-muted d-lg-none">{competitor.email || 'N/A'}</small>
                            </div>
                          </div>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <div className="text-muted small">{competitor.email || 'N/A'}</div>
                        </td>
                        <td className="d-none d-xl-table-cell">
                          <div className="text-muted small">{formatDate(competitor.date_of_birth)}</div>
                        </td>
                        <td>
                          <span className={`badge ${getBeltColorBadge(competitor.belt_color)} px-2 py-1`}>
                            <span className="d-none d-sm-inline">{competitor.belt_color || 'N/A'}</span>
                            <span className="d-sm-none">{(competitor.belt_color || 'N/A').charAt(0)}</span>
                          </span>
                        </td>
                        <td className="d-none d-lg-table-cell">
                          <div className="text-muted small">{formatDate(competitor.created_at)}</div>
                        </td>
                        <td className="text-center" style={{ width: '80px' }}>
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              className="btn btn-outline-primary d-flex align-items-center justify-content-center"
                              title="Edit competitor"
                              onClick={() => handleEditCompetitor(competitor)}
                              style={{ width: '28px', height: '28px', padding: '0', fontSize: '12px' }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                              title="Delete competitor"
                              onClick={() => handleDeleteCompetitor(competitor.participant_id, competitor.name)}
                              style={{ width: '28px', height: '28px', padding: '0', fontSize: '12px' }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="d-lg-none">
                {competitors.map((competitor) => (
                  <div key={competitor.participant_id} className="card mobile-tournament-card slide-up mb-3">
                    {/* Card Header */}
                    <div className="mobile-tournament-header">
                      <div className="row align-items-center g-3">
                        <div className="col-auto">
                          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '50px', height: '50px', fontSize: '18px', color: 'white' }}>
                            {competitor.name?.charAt(0)?.toUpperCase() || 'N'}
                          </div>
                        </div>
                        <div className="col">
                          <h6 className="mobile-tournament-title mb-1">{competitor.name || 'N/A'}</h6>
                          <div className="mobile-tournament-dates">
                            <div className="col-12">
                              <i className="fas fa-envelope me-1"></i>
                              <small className="text-muted">{competitor.email || 'N/A'}</small>
                            </div>
                            <div className="col-12">
                              <i className="fas fa-calendar-alt me-1"></i>
                              <small className="text-muted">Born: {formatDate(competitor.date_of_birth)}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="mobile-tournament-content">
                      <div className="row text-center g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">Belt Color</small>
                          <span className={`badge ${getBeltColorBadge(competitor.belt_color)} px-3 py-2`}>
                            {competitor.belt_color || 'N/A'}
                          </span>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Registered</small>
                          <span className="badge bg-light text-dark px-3 py-2">
                            {formatDate(competitor.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card Actions */}
                    <div className="mobile-tournament-actions">
                      <div className="row g-2">
                        <div className="col-6">
                          <button
                            className="btn btn-outline-primary btn-sm w-100"
                            title="Edit competitor"
                            onClick={() => handleEditCompetitor(competitor)}
                          >
                            <i className="fas fa-edit me-1"></i>Edit
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            className="btn btn-outline-danger btn-sm w-100"
                            title="Delete competitor"
                            onClick={() => handleDeleteCompetitor(competitor.participant_id, competitor.name)}
                          >
                            <i className="fas fa-trash me-1"></i>Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Edit Competitor Modal */}
      <EditCompetitorModal
        show={showEditModal}
        onHide={handleCloseEditModal}
        competitor={selectedCompetitor}
        onUpdate={handleUpdateCompetitor}
      />
    </div>
  );
}

export default Competitors