import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import Searchbar from '../../components/navigation/Searchbar';
import { link } from '../../constant';

const AddCompetitors = () => {
  const { divisionId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [allCompetitors, setAllCompetitors] = useState([]);
  const [divisionCompetitors, setDivisionCompetitors] = useState([]);
  const [originalDivisionCompetitors, setOriginalDivisionCompetitors] = useState([]);
  const [division, setDivision] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDragDisabled, setIsDragDisabled] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, [divisionId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/Login');
        return;
      }

      // Fetch all competitors for this account
      const competitorsResponse = await axios.get(`${link}/participants/users`, {
        headers: { accessToken: token }
      });

      // Fetch current division participants
      const divisionResponse = await axios.get(`${link}/participants/user`, {
        headers: { accessToken: token },
        params: { division_id: divisionId }
      });

      const allComps = competitorsResponse.data || [];
      const divComps = divisionResponse.data.participants || [];
      const divisionInfo = divisionResponse.data.division;

      // Filter out competitors already in this division
      const availableCompetitors = allComps.filter(
        comp => !divComps.find(divComp => divComp.participant_id === comp.participant_id)
      );

      setAllCompetitors(availableCompetitors);
      setDivisionCompetitors(divComps);
      setOriginalDivisionCompetitors(divComps); // Store original database state
      setDivision(divisionInfo);
      setLoading(false);
      
      // Enable drag after a small delay to ensure droppables are mounted
      setTimeout(() => {
        setIsDragDisabled(false);
      }, 100);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load competitors');
      setLoading(false);
    }
  };

  // Handle drag and drop (memoized to prevent re-creation)
  const onDragEnd = useCallback((result) => {
    console.log('🔥 Drag ended:', result);
    console.log('📊 Current allCompetitors:', allCompetitors.map(c => `${c.participant_id}:${c.name}`));
    console.log('📊 Current divisionCompetitors:', divisionCompetitors.map(c => `${c.participant_id}:${c.name}`));
    
    if (!result.destination) {
      console.log('❌ No destination, cancelling drag');
      return;
    }
    
    // Add error handling for invalid droppable IDs
    const validDroppableIds = ['available', 'division'];
    if (!validDroppableIds.includes(result.source.droppableId) || 
        !validDroppableIds.includes(result.destination.droppableId)) {
      console.warn('Invalid droppable ID detected:', result);
      return;
    }

    const { source, destination } = result;

    // Extract participant ID from draggableId
    const getParticipantId = (draggableId) => {
      return parseInt(draggableId);
    };

    // Moving from available to division
    if (source.droppableId === 'available' && destination.droppableId === 'division') {
      const participantId = getParticipantId(result.draggableId);
      console.log('🔄 Moving from available to division, participantId:', participantId);
      
      const competitor = allCompetitors.find(c => c.participant_id === participantId);
      console.log('👤 Found competitor:', competitor);
      
      if (!competitor) {
        console.error('❌ Competitor not found:', participantId);
        console.log('Available IDs:', allCompetitors.map(c => c.participant_id));
        return;
      }

      const newAvailable = allCompetitors.filter(c => c.participant_id !== participantId);
      const newDivision = Array.from(divisionCompetitors);
      newDivision.splice(destination.index, 0, competitor);
      
      console.log('✅ After move - newAvailable count:', newAvailable.length);
      console.log('✅ After move - newDivision count:', newDivision.length);
      
      setAllCompetitors(newAvailable);
      setDivisionCompetitors(newDivision);
    }
    
    // Moving from division to available
    if (source.droppableId === 'division' && destination.droppableId === 'available') {
      const participantId = getParticipantId(result.draggableId);
      const competitor = divisionCompetitors.find(c => c.participant_id === participantId);
      
      if (!competitor) {
        console.error('Competitor not found in division:', participantId);
        return;
      }

      const newDivision = divisionCompetitors.filter(c => c.participant_id !== participantId);
      const newAvailable = Array.from(allCompetitors);
      newAvailable.splice(destination.index, 0, competitor);
      
      setAllCompetitors(newAvailable);
      setDivisionCompetitors(newDivision);
    }

    // Reordering within the same list
    if (source.droppableId === destination.droppableId) {
      const participantId = getParticipantId(result.draggableId);
      
      if (source.droppableId === 'available') {
        const competitor = allCompetitors.find(c => c.participant_id === participantId);
        const newItems = allCompetitors.filter(c => c.participant_id !== participantId);
        newItems.splice(destination.index, 0, competitor);
        setAllCompetitors(newItems);
      } else {
        const competitor = divisionCompetitors.find(c => c.participant_id === participantId);
        const newItems = divisionCompetitors.filter(c => c.participant_id !== participantId);
        newItems.splice(destination.index, 0, competitor);
        setDivisionCompetitors(newItems);
      }
    }
  }, [allCompetitors, divisionCompetitors, originalDivisionCompetitors]);

  // Save changes to backend
  const saveChanges = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Save the competitors currently in the division
      await axios.post(`${link}/divisions/${divisionId}/competitors`, {
        competitors: divisionCompetitors.map(comp => comp.participant_id)
      }, {
        headers: { accessToken: token }
      });

      setSaving(false);
      navigate('/Home', { 
        state: { message: 'Competitors updated successfully!' }
      });

    } catch (error) {
      console.error('Error saving competitors:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle detailed validation errors
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.join('\n');
        setError(`${error.response.data.error}:\n\n${errorMessages}`);
      } else {
        setError(error.response?.data?.error || 'Failed to save changes');
      }
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Loading competitors...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="container-modern py-4">
      {/* Header */}
      <div className="page-header-modern">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h1 className="page-title-modern">
              <i className="fas fa-user-plus me-3"></i>
              Add Competitors
            </h1>
            <p className="page-subtitle-modern">
              {division && `${division.gender} ${division.category} - ${division.age_group} (${division.proficiency_level})`}
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate(-1)}
            >
              <i className="fas fa-arrow-left me-2"></i>Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={saveChanges}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {!loading && (
        <DragDropContext onDragEnd={onDragEnd}>
        <Row className="g-4">
          {/* Available Competitors */}
          <Col lg={6}>
            <Card className="card-modern h-100">
              <Card.Header className="card-modern-header">
                <h5 className="mb-0">
                  <i className="fas fa-users me-2"></i>
                  Your Competitors ({searchTerm ? allCompetitors.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length : allCompetitors.length})
                </h5>
              </Card.Header>
              <Card.Body className="p-3">
                <Searchbar 
                  search={searchTerm}
                  setSearch={setSearchTerm}
                  placeholder="Search your competitors..."
                  ariaLabel="Search competitors"
                />
                
                <Droppable droppableId="available">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`mt-3 p-3 rounded ${
                        snapshot.isDraggingOver ? 'bg-light' : ''
                      }`}
                      style={{ 
                        minHeight: '400px',
                        border: '2px dashed #dee2e6',
                        borderColor: snapshot.isDraggingOver ? '#0d6efd' : '#dee2e6'
                      }}
                    >
                      {(searchTerm ? allCompetitors.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length : allCompetitors.length) === 0 ? (
                        <div className="text-center text-muted py-5">
                          <i className="fas fa-search fa-2x mb-3"></i>
                          <p>{searchTerm ? 'No competitors found' : 'All competitors are in this division'}</p>
                        </div>
                      ) : (
                        allCompetitors.map((competitor, index) => {
                          // Filter by search term
                          if (searchTerm && !competitor.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                            return null;
                          }
                          return (
                          <Draggable 
                            key={competitor.participant_id.toString()} 
                            draggableId={competitor.participant_id.toString()} 
                            index={index}
                            isDragDisabled={isDragDisabled}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`card mb-2 ${
                                  snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  cursor: isDragDisabled ? 'not-allowed' : (snapshot.isDragging ? 'grabbing' : 'grab'),
                                  userSelect: 'none',
                                  touchAction: 'none',
                                  opacity: isDragDisabled ? 0.6 : 1
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <Card.Body className="p-3">
                                  <div className="d-flex align-items-center">
                                    <div className="me-3">
                                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '40px', height: '40px', color: 'white' }}>
                                        {competitor.name.charAt(0)}
                                      </div>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">{competitor.name}</h6>
                                      <small className="text-muted">
                                        Age: {new Date().getFullYear() - new Date(competitor.date_of_birth).getFullYear()} | 
                                        Belt: {competitor.belt_color}
                                      </small>
                                    </div>
                                    <div className="text-muted" style={{ cursor: 'grab' }}>
                                      <i className="fas fa-grip-vertical"></i>
                                    </div>
                                  </div>
                                </Card.Body>
                              </div>
                            )}
                          </Draggable>
                          );
                        }).filter(Boolean)
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card.Body>
            </Card>
          </Col>

          {/* Division Competitors */}
          <Col lg={6}>
            <Card className="card-modern h-100">
              <Card.Header className="card-modern-header">
                <h5 className="mb-0">
                  <i className="fas fa-trophy me-2"></i>
                  In This Division ({divisionCompetitors.length})
                </h5>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="text-muted mb-3">
                  <i className="fas fa-info-circle me-2"></i>
                  Drag competitors here to add them to this division
                </div>
                
                <Droppable droppableId="division">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`p-3 rounded ${
                        snapshot.isDraggingOver ? 'bg-light' : ''
                      }`}
                      style={{ 
                        minHeight: '400px',
                        border: '2px dashed #dee2e6',
                        borderColor: snapshot.isDraggingOver ? '#198754' : '#dee2e6'
                      }}
                    >
                      {divisionCompetitors.length === 0 ? (
                        <div className="text-center text-muted py-5">
                          <i className="fas fa-users-slash fa-2x mb-3"></i>
                          <p>No competitors in this division yet</p>
                          <small>Drag competitors from the left panel to add them</small>
                        </div>
                      ) : (
                        divisionCompetitors.map((competitor, index) => {
                          const isOriginal = originalDivisionCompetitors.find(orig => orig.participant_id === competitor.participant_id);
                          return (
                          <Draggable 
                            key={competitor.participant_id.toString()} 
                            draggableId={competitor.participant_id.toString()} 
                            index={index}
                            isDragDisabled={isDragDisabled || isOriginal}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`card mb-2 ${
                                  snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                }`}
                                style={{
                                  ...provided.draggableProps.style,
                                  cursor: (isDragDisabled || isOriginal) ? 'not-allowed' : (snapshot.isDragging ? 'grabbing' : 'grab'),
                                  borderLeft: '4px solid #198754',
                                  userSelect: 'none',
                                  touchAction: 'none',
                                  opacity: (isDragDisabled || isOriginal) ? 0.6 : 1
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <Card.Body className="p-3">
                                  <div className="d-flex align-items-center">
                                    <div className="me-3">
                                      <div className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: '40px', height: '40px', color: 'white' }}>
                                        {competitor.name.charAt(0)}
                                      </div>
                                    </div>
                                    <div className="flex-grow-1">
                                      <h6 className="mb-1">{competitor.name}</h6>
                                      <small className="text-muted">
                                        Age: {new Date().getFullYear() - new Date(competitor.date_of_birth).getFullYear()} | 
                                        Belt: {competitor.belt_color}
                                      </small>
                                    </div>
                                    <div className="text-muted" style={{ cursor: (isDragDisabled || isOriginal) ? 'not-allowed' : 'grab' }}>
                                      <i className="fas fa-grip-vertical"></i>
                                    </div>
                                  </div>
                                </Card.Body>
                              </div>
                            )}
                          </Draggable>
                          );
                        })
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        </DragDropContext>
      )}
    </Container>
  );
};

export default AddCompetitors;