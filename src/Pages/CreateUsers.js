
import axios from "axios";
import Identity from "../FormComponents/Identity";
import Password from "../FormComponents/Password";
import Credantials from "../FormComponents/Credantials";
import { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import { Container, Row, Col, Card, ProgressBar, Button } from 'react-bootstrap';
import { link } from '../constant';

function CreateUsers() {
  const { authState, setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pages, setPages] = useState(0);
  const [info, setInfo] = useState({
    email: "",
    password_hash: "",
    username: "",
    account_id: authState.id
  });

  const FormTitles = ["Credentials", "Password", "Identity"];
  const FormDescriptions = [
    "Enter your login credentials",
    "Create a secure password",
    "Complete your profile"
  ];

  const PageDisplay = () => {
    if (pages === 0) {
      return <Credantials info={info} setInfo={setInfo} />;
    } else if (pages === 1) {
      return <Password info={info} setInfo={setInfo} />;
    } else {
      return <Identity info={info} setInfo={setInfo} />;
    }
  };

  const handleSubmit = () => {
    const accessToken = localStorage.getItem("accessToken");
    axios.post(`${link}/users`, info, {
      headers: {
        accessToken: accessToken,
      }
    })
      .then((response) => {
        navigate('/Home');
        console.log("Request successful:", response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const nextPage = () => {
    if (pages === FormTitles.length - 1) {
      if (isAllFieldsValid()) {
        handleSubmit();
      }
    } else {
      if (isCurrentPageValid()) {
        setPages((currPage) => currPage + 1);
      }
    }
  };

  const prevPage = () => {
    setPages((currPage) => currPage - 1);
  };

  const progressPercentage = ((pages + 1) / FormTitles.length) * 100;

  // Validation function to check if current page fields are filled
  const isCurrentPageValid = () => {
    switch (pages) {
      case 0: // Credentials (Email)
        return info.email.trim() !== "";
      case 1: // Password
        return info.password_hash.trim() !== "";
      case 2: // Identity (Username)
        return info.username.trim() !== "";
      default:
        return false;
    }
  };

  // Check if all fields are filled for final submission
  const isAllFieldsValid = () => {
    return info.email.trim() !== "" &&
           info.password_hash.trim() !== "" &&
           info.username.trim() !== "";
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="card-modern shadow-lg">
            {/* Header */}
            <Card.Header className="card-modern-header text-center border-0">
              <div className="mb-3">
                <i className="fas fa-user-plus fa-3x text-muted mb-3"></i>
              </div>
              <h2 className="page-title-modern mb-2">Create New User</h2>
              <p className="page-subtitle-modern mb-0">
                {FormDescriptions[pages]}
              </p>
            </Card.Header>

            {/* Progress Bar */}
            <div className="px-4 py-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="text-muted">Step {pages + 1} of {FormTitles.length}</small>
                <small className="text-muted">{Math.round(progressPercentage)}% Complete</small>
              </div>
              <ProgressBar 
                now={progressPercentage} 
                style={{ height: '8px' }}
                className="rounded-pill"
                variant="dark"
              />
              <div className="d-flex justify-content-between mt-2">
                {FormTitles.map((title, index) => (
                  <small 
                    key={index}
                    className={`text-${index <= pages ? 'dark fw-bold' : 'muted'}`}
                  >
                    {title}
                  </small>
                ))}
              </div>
            </div>

            {/* Form Body */}
            <Card.Body className="card-modern-body">
              <div className="form-step-container">
                <h4 className="mb-4 text-center">{FormTitles[pages]}</h4>
                {PageDisplay()}
              </div>
            </Card.Body>

            {/* Footer */}
            <Card.Footer className="card-modern-footer">
              <Row>
                <Col>
                  <Button
                    variant="outline-secondary"
                    disabled={pages === 0}
                    onClick={prevPage}
                    className="w-100 btn-modern-outline"
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Previous
                  </Button>
                </Col>
                <Col>
                  <Button
                    variant="dark"
                    disabled={pages === FormTitles.length - 1 ? !isAllFieldsValid() : !isCurrentPageValid()}
                    onClick={nextPage}
                    className="w-100 btn-modern"
                  >
                    {pages === FormTitles.length - 1 ? (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Complete
                      </>
                    ) : (
                      <>
                        Next
                        <i className="fas fa-arrow-right ms-2"></i>
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CreateUsers;