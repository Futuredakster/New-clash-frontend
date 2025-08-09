import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import UserModal from '../UserModal'; // Make sure the path to UserModal is correct
import AccountModal from '../AccountModal'; // Import the AccountModal component
import PasswordModal from '../PasswordModal'; // Import the PasswordModal component
import { link } from '../constant';

const EditUser = () => {
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
        const [accountResponse, userResponse] = await Promise.all([
          axios.get(`${link}/accounts/info`, {
            headers: { accessToken },
          }),
          axios.get(`${link}/users`, {
            headers: { accessToken },
          }),
        ]);
        setAccount(accountResponse.data);
        setUser(userResponse.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, []);

  const handleShowUserModal = () => setShowUserModal(true);
  const handleCloseUserModal = () => setShowUserModal(false);
  const handleShowAccountModal = () => setShowAccountModal(true);
  const handleCloseAccountModal = () => setShowAccountModal(false);
  const handleShowPasswordModal = () => setShowPasswordModal(true);
  const handleClosePasswordModal = () => setShowPasswordModal(false);

  if (loading) {
    return (
      <Container fluid className="fade-in">
        <Row className="justify-content-center">
          <Col xs={12} className="text-center" style={{ paddingTop: '100px' }}>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading user information...</p>
          </Col>
        </Row>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container fluid className="fade-in">
        <Row className="justify-content-center">
          <Col xs={12} lg={8}>
            <Alert variant="danger" className="mt-4">
              <Alert.Heading>Error Loading Data</Alert.Heading>
              <p>{error}</p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="fade-in px-3">
      <Row>
        <Col>
          <div className="page-header-modern">
            <h1 className="page-title-modern">Account Settings</h1>
            <p className="page-subtitle-modern">Manage your account and user information</p>
          </div>

          <Row>
            <Col lg={6} className="mb-4">
              <Card className="card-modern h-100">
                <Card.Header className="card-modern-header">
                  <h4 className="mb-0">
                    <i className="fas fa-building me-2"></i>
                    Account Information
                  </h4>
                  <small className="text-muted">Your organization details</small>
                </Card.Header>
                <Card.Body className="card-modern-body">
                  {account ? (
                    <div>
                      <div className="mb-3">
                        <label className="form-label-modern">
                          <i className="fas fa-tag me-2"></i>
                          Account Name
                        </label>
                        <div className="info-display-modern">
                          {account.account_name}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label-modern">
                          <i className="fas fa-layer-group me-2"></i>
                          Account Type
                        </label>
                        <div className="info-display-modern">
                          {account.account_type}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label-modern">
                          <i className="fas fa-align-left me-2"></i>
                          Description
                        </label>
                        <div className="info-display-modern">
                          {account.account_description || 'No description provided'}
                        </div>
                      </div>
                      
                      <Button 
                        variant="dark" 
                        className="btn-modern w-100" 
                        onClick={handleShowAccountModal}
                      >
                        <i className="fas fa-edit me-2"></i>
                        Edit Account Information
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="fas fa-exclamation-circle fa-2x mb-3"></i>
                      <p>No account information available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} className="mb-4">
              <Card className="card-modern h-100">
                <Card.Header className="card-modern-header">
                  <h4 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    User Information
                  </h4>
                  <small className="text-muted">Your personal details</small>
                </Card.Header>
                <Card.Body className="card-modern-body">
                  {user ? (
                    <div>
                      <div className="mb-3">
                        <label className="form-label-modern">
                          <i className="fas fa-user-circle me-2"></i>
                          Username
                        </label>
                        <div className="info-display-modern">
                          {user.username}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label-modern">
                          <i className="fas fa-envelope me-2"></i>
                          Email Address
                        </label>
                        <div className="info-display-modern">
                          {user.email}
                        </div>
                      </div>
                      
                      <div className="d-grid gap-2">
                        <Button 
                          variant="dark" 
                          className="btn-modern" 
                          onClick={handleShowUserModal}
                        >
                          <i className="fas fa-edit me-2"></i>
                          Edit User Information
                        </Button>
                        <Button 
                          variant="outline-dark" 
                          className="btn-modern-outline" 
                          onClick={handleShowPasswordModal}
                        >
                          <i className="fas fa-lock me-2"></i>
                          Change Password
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted py-4">
                      <i className="fas fa-exclamation-circle fa-2x mb-3"></i>
                      <p>No user information available</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

      {user && (
        <>
          <UserModal
            showModal={showUserModal}
            handleClose={handleCloseUserModal}
            user_id={user.user_id} // Assuming user object has a user_id
          />
          <PasswordModal
            showModal={showPasswordModal}
            handleClose={handleClosePasswordModal}
            user_id={user.user_id} // Assuming user object has a user_id
          />
        </>
      )}

      {account && (
        <AccountModal
          showModal={showAccountModal}
          handleClose={handleCloseAccountModal}
          account_id={account.account_id}
        />
      )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditUser;
