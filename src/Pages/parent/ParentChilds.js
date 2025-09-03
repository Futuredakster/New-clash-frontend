import axios from "axios";
import { useState,useEffect } from "react";
import { link } from "../../constant";
import { useLocation } from "react-router-dom";
import EditChildModal from "../../components/modals/EditChildModal";
import AddChildModal from "../../components/modals/AddChildModal";


const ParentChilds = () => {
  const [childs, setChilds] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const tournament_id = queryParams.get('tournament_id');
    const division_id = queryParams.get('division_id');


    const addToCart = (child) => {
        const parentToken = localStorage.getItem("parentToken");
        axios.post(`${link}/cart/parentAddToCart`, {
            participant_id: child.participant_id,
            tournament_id: tournament_id,
            division_id: division_id
        }, {
            headers: {
                parentAccessToken: parentToken
            }
        })
        .then(response => {
            alert("✅ Child successfully added to cart!");
            console.log("Cart response:", response.data);
            
            // Refresh cart count in navigation
            if (window.refreshCartCount) {
                window.refreshCartCount();
            }
        })
        .catch(error => {
            if (error.response && error.response.data && error.response.data.error) {
                alert(`❌ ${error.response.data.error}`);
            } else {
                alert("❌ Failed to add child to cart.");
            }
            console.error("Error adding to cart:", error);
        });
    };

    const handleEditChild = (child) => {
        setSelectedChild(child);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedChild(null);
    };

    const handleChildUpdated = (updatedChild) => {
        // Update the child in the list
        setChilds(prevChilds => 
            prevChilds.map(child => 
                child.participant_id === updatedChild.participant_id 
                    ? updatedChild 
                    : child
            )
        );
    };

    const handleAddChild = () => {
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const handleChildAdded = (newChild) => {
        // Add the new child to the list
        setChilds(prevChilds => [...prevChilds, newChild]);
    };

    const handleDeleteChild = async (child) => {
        // Confirmation dialog
        const isConfirmed = window.confirm(`Are you sure you want to delete ${child.name}? This action cannot be undone.`);
        
        if (!isConfirmed) {
            return;
        }

        try {
            const parentToken = localStorage.getItem("parentToken");
            
            const response = await axios.delete(`${link}/parents/participants/${child.participant_id}`, {
                headers: {
                    parentAccessToken: parentToken
                }
            });

            if (response.status === 200) {
                // Remove child from the list
                setChilds(prevChilds => 
                    prevChilds.filter(c => c.participant_id !== child.participant_id)
                );
                alert(`✅ ${child.name} has been deleted successfully.`);
            }
        } catch (error) {
            console.error("Error deleting child:", error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(`❌ ${error.response.data.error}`);
            } else {
                alert("❌ Failed to delete child. Please try again.");
            }
        }
    };

  useEffect(() => {
    const parentToken = localStorage.getItem("parentToken");
    const fetchChilds = async () => {
      try {
        const response = await axios.get(`${link}/parents/participants`, {
          headers: {
            parentAccessToken: parentToken
          }
        });
        setChilds(response.data);
      } catch (error) {
        console.error("Error fetching child data:", error);
      }
    };

    fetchChilds();
  }, []);

  return (
    <div className="container-modern fade-in">
      <div className="page-header-modern mb-4">
        <h2 className="page-title-modern"><i className="fas fa-child me-2"></i>My Karate Competitors</h2>
        <p className="page-subtitle-modern">Your registered children for karate competitions</p>
        {!tournament_id || !division_id ? (
          <div className="text-center mt-3">
            <button className="btn btn-modern" style={{fontWeight: 600}} onClick={handleAddChild}>
              <i className="fas fa-user-plus me-2"></i>
              Add Children
            </button>
          </div>
        ) : null}
      </div>
      <div className="row g-4 justify-content-center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {childs.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-child fa-4x text-muted mb-4"></i>
            <h5 className="text-muted mb-3">No competitors registered</h5>
            <p className="text-muted">You haven't registered any children for karate competitions yet.</p>
          </div>
        ) : (
          childs.map((child, idx) => (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex justify-content-center" key={child.id}>
              <div className="card card-modern h-100 shadow-lg border-0" style={{background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)", borderRadius: "16px", boxShadow: "0 6px 24px rgba(0,0,0,0.08)"}}>
                <div className="card-modern-body d-flex flex-column align-items-center justify-content-center p-4">
                  <div className="participant-avatar mb-3" style={{width: 72, height: 72, borderRadius: "50%", background: "#e3e7ee", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.07)"}}>
                    <i className="fas fa-user-circle fa-3x text-primary"></i>
                  </div>
                  <h5 className="participant-name mb-1 fw-bold" style={{color: "#222", fontSize: "1.15rem"}}>{child.name}</h5>
                  <span className="text-muted d-block mb-2" style={{fontSize: "0.95rem"}}>ID: {child.participant_id}</span>
                  <div className="mb-1 w-100 d-flex justify-content-between" style={{fontSize: "0.95rem"}}>
                    <span className="text-muted">Date of Birth:</span>
                    <strong>{child.date_of_birth || 'N/A'}</strong>
                  </div>
                  <div className="mb-2 w-100 d-flex justify-content-between" style={{fontSize: "0.95rem"}}>
                    <span className="text-muted">Belt Color:</span>
                    <strong>{child.belt_color || 'N/A'}</strong>
                  </div>
                  <span className="badge bg-primary participant-badge mt-2 px-3 py-2" style={{fontSize: "0.95rem", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)"}}>
                    <i className="fas fa-child me-1"></i>
                    Child #{idx + 1}
                  </span>
                  {tournament_id && division_id ? (
                    <button className="btn btn-modern mt-3 w-100" style={{fontWeight:600, fontSize:"1rem"}} onClick={() => addToCart(child)}>
                      <i className="fas fa-cart-plus me-2"></i> Add to Cart
                    </button>
                  ) : (
                    <div className="d-flex flex-column gap-2 mt-3 align-items-center">
                      <button 
                        className="btn btn-outline-secondary" 
                        style={{fontWeight:600, fontSize:"0.9rem", width:"120px"}}
                        onClick={() => handleEditChild(child)}
                      >
                        <i className="fas fa-edit me-1"></i> Edit
                      </button>
                      <button 
                        className="btn btn-outline-danger" 
                        style={{fontWeight:600, fontSize:"0.9rem", width:"120px"}}
                        onClick={() => handleDeleteChild(child)}
                      >
                        <i className="fas fa-trash me-1"></i> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Child Modal */}
      <EditChildModal
        showModal={showEditModal}
        handleClose={handleCloseEditModal}
        child={selectedChild}
        onChildUpdated={handleChildUpdated}
      />

      {/* Add Child Modal */}
      <AddChildModal
        showModal={showAddModal}
        handleClose={handleCloseAddModal}
        onChildAdded={handleChildAdded}
      />
    </div>
  );
}

export default ParentChilds
