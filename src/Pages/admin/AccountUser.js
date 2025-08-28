
import axios from "axios";
import Identity from "../../components/forms/Identity";
import Password from "../../components/forms/Password";
import Credantials from "../../components/forms/Credantials";
import AccountDescript from "../../components/forms/AccountDescript";
import AccountName from "../../components/forms/AccountName";
import AccountType from "../../components/forms/AccountType";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { link } from '../../constant';
import { Container, Row, Col, Card, ProgressBar, Button } from 'react-bootstrap';

const AccountUser = () =>{
    const navigate = useNavigate();
    const [pages, setPages] = useState(0);
    const [info, setInfo] = useState({
        account_type: "",
        account_name: "",
        account_description: "",
        email: "",
        password_hash: "",
        username: ""
      });

      const FormTitles = ["Account Type","Account Name","Account Description","Identity", "Credentials", "Password"];
      const FormDescriptions = [
        "Select the type of account you want to create",
        "Choose a unique name for your account",
        "Provide a brief description of your account",
        "Enter your personal information",
        "Set up your login credentials",
        "Create a secure password"
      ];

      const PageDisplay = () => {
        if (pages === 0) {
          return <AccountType info={info} setInfo={setInfo} />;
        } else if (pages === 1) {
          return <AccountName info={info} setInfo={setInfo} />;
        } else if(pages === 2) {
          return <AccountDescript info={info} setInfo={setInfo} />;
        } else if(pages === 3){
            return <Credantials info={info} setInfo={setInfo} />;
        } else if(pages=== 4){
          return <Identity info={info} setInfo={setInfo} />;
        } else {
          return <Password info={info} setInfo={setInfo} />;
          }
      };

      const progressPercentage = ((pages + 1) / FormTitles.length) * 100;

      // Validation function to check if current page fields are filled
      const isCurrentPageValid = () => {
        switch (pages) {
          case 0: // Account Type
            return info.account_type.trim() !== "";
          case 1: // Account Name
            return info.account_name.trim() !== "";
          case 2: // Account Description
            return info.account_description.trim() !== "";
          case 3: // Credentials (Email)
            return info.email.trim() !== "";
          case 4: // Identity (Username)
            return info.username.trim() !== "";
          case 5: // Password
            return info.password_hash.trim() !== "";
          default:
            return false;
        }
      };

      // Check if all fields are filled for final submission
      const isAllFieldsValid = () => {
        return info.account_type.trim() !== "" &&
               info.account_name.trim() !== "" &&
               info.account_description.trim() !== "" &&
               info.email.trim() !== "" &&
               info.username.trim() !== "" &&
               info.password_hash.trim() !== "";
      };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--light-grey) 0%, var(--white) 100%)',
            padding: '40px 0'
        }}>
            <Container>
                <Row className="justify-content-center">
                    <Col lg={8} xl={6}>
                        <div className="text-center mb-4">
                            <h1 className="page-title-modern">Create Your Account</h1>
                            <p className="page-subtitle-modern">
                                Join Clash and start organizing amazing tournaments
                            </p>
                        </div>

                        <Card className="card-modern shadow-lg">
                            <Card.Header className="card-modern-header">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="mb-0 text-dark">{FormTitles[pages]}</h4>
                                    <span className="badge bg-dark">
                                        Step {pages + 1} of {FormTitles.length}
                                    </span>
                                </div>
                                <p className="text-muted mb-3">{FormDescriptions[pages]}</p>
                                <ProgressBar 
                                    now={progressPercentage} 
                                    variant="dark"
                                    style={{height: '8px'}}
                                    className="mb-0"
                                />
                            </Card.Header>

                            <Card.Body className="card-modern-body py-4">
                                {PageDisplay()}
                            </Card.Body>

                            <Card.Footer className="card-modern-footer">
                                <div className="d-flex justify-content-between">
                                    <Button
                                        variant="outline-secondary"
                                        disabled={pages === 0}
                                        onClick={() => {
                                            setPages((currPage) => currPage - 1);
                                        }}
                                        className="btn-modern-outline"
                                    >
                                        <i className="fas fa-arrow-left me-2"></i>
                                        Previous
                                    </Button>
                                    
                                    <Button
                                        className="btn-modern"
                                        disabled={pages === FormTitles.length - 1 ? !isAllFieldsValid() : !isCurrentPageValid()}
                                        onClick={() => {
                                            if (pages === FormTitles.length - 1) {
                                                if (isAllFieldsValid()) {
                                                    var postData = { 
                                                        account:{
                                                            account_type:info.account_type,
                                                            account_name:info.account_name,
                                                            account_description:info.account_description,
                                                        }, 
                                                        user:{
                                                            email:info.email,
                                                            password_hash:info.password_hash,
                                                            username:info.username,
                                                        } 
                                                    }
                                                    console.log(postData);
                                                    axios.post(`${link}/accounts/user`, postData)
                                                    .then((response) => {
                                                        navigate('/Login');
                                                        console.log("Request successful:", response);
                                                    })
                                                    .catch((error) => {
                                                        console.error("Error:", error);
                                                    });
                                                }
                                            } else {
                                                if (isCurrentPageValid()) {
                                                    setPages((currPage) => currPage + 1);
                                                }
                                            }
                                        }}
                                    >
                                        {pages === FormTitles.length - 1 ? (
                                            <>
                                                <i className="fas fa-check me-2"></i>
                                                Create Account
                                            </>
                                        ) : (
                                            <>
                                                Next
                                                <i className="fas fa-arrow-right ms-2"></i>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card.Footer>
                        </Card>

                        <div className="text-center mt-4">
                            <p className="text-muted">
                                Already have an account? 
                                <a href="/Login" className="text-dark fw-bold text-decoration-none ms-1">
                                    Sign in here
                                </a>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
export default AccountUser;