import axios from "axios";
import { useState,useEffect } from "react";
import { link } from "../constant";
import { useLocation } from "react-router-dom";


const ParentChilds = () => {
  const [childs, setChilds] = useState([]);
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
        <h2 className="page-title-modern"><i className="fas fa-child me-2"></i>Children</h2>
        <p className="page-subtitle-modern">Linked children accounts</p>
      </div>
      <div className="row g-4 justify-content-center">
        {childs.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-child fa-4x text-muted mb-4"></i>
            <h5 className="text-muted mb-3">No children found</h5>
            <p className="text-muted">You have not linked any children accounts yet.</p>
          </div>
        ) : (
          childs.map((child, idx) => (
            <div className="col-12 col-sm-6 col-md-4 d-flex" key={child.id}>
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
                  <button className="btn btn-modern mt-3 w-100" style={{fontWeight:600, fontSize:"1rem"}} onClick={() => addToCart(child)}>
                    <i className="fas fa-cart-plus me-2"></i> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ParentChilds
