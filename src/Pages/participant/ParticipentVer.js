import React, { useState } from "react";
import axios from "axios";
import CodeVerificationModal from "../../components/modals/CodeVerificationModal"; // Ensure this path is correct
import { link } from '../../constant';

const ParticipentVer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [participantId, setParticipantId] = useState(null);

  const handleVerify = async () => {
    try {
      console.log("Email being sent to backend:", email); // Log the email

      const response = await axios.post(`${link}/participants/auth`, { email });

      console.log("Backend response:", response.data); // Log the response data
      setParticipantId(response.data.participant_id); // Set the participant ID

      if (response.data.participant_id) {
        console.log("Participant ID set:", response.data.participant_id);
      } else {
        console.log("No participant ID received.");
      }

      setMessage("Email successfully sent");
      setShowModal(true);
    } catch (error) {
      console.error("Error during verification:", error); // Log any errors

      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container-modern">
      <div className="page-header-modern">
        <h1 className="page-title-modern">Email Verification</h1>
        <p className="page-subtitle-modern">
          Enter your email to verify and view your registered tournaments
        </p>
      </div>
      
      <div className="form-modern">
        <div className="form-group-modern">
          <label className="form-label-modern">Email Address:</label>
          <input
            type="email"
            className="form-control-modern"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
          />
        </div>
        <button 
          className="btn btn-modern w-100"
          onClick={handleVerify}
        >
          <i className="fas fa-envelope-open-text me-2"></i>
          Verify Email
        </button>

        {message && (
          <div className={`alert mt-3 ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}
      </div>

      <CodeVerificationModal
        showModal={showModal}
        handleClose={handleCloseModal}
        participantId={participantId} // Pass the ID
      />
    </div>
  );
};

export default ParticipentVer;
