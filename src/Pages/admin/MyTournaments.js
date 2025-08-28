import React, { useState, useEffect, useContext} from 'react';
import axios from 'axios';
import Searchbar from '../../components/navigation/Searchbar';
import TableContent from '../../components/TableContent';
import {AuthContext} from '../../context/AuthContext';
import { Container, Row, Col } from 'react-bootstrap';
import { link } from '../../constant';



function MyTournaments() {
  const [data, setData] = useState([]);
  const [search,setSearch] = useState('')
  const {authState, setAuthState} = useContext(AuthContext);

  useEffect(() => {
    // Check if accessToken exists in localStorage
    const accessToken = localStorage.getItem("accessToken");
  
    if (!accessToken) {
      // Handle the case where accessToken is not available
      console.error('Access token not found. API request not made.');
      return;
    }
  
    // Fetch data from the backend API
    axios.get(`${link}/tournaments/byaccount`, {
      headers: {
        accessToken: accessToken,
      }, 
      params: {
        tournament_name: search,
      },
    })
      .then(response => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          console.log(authState.id);
          setData(response.data);
        
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [search]);


  return (
    <Container fluid className="fade-in px-3">
      <Row>
        <Col>
          <div className="page-header-modern">
            <h1 className="page-title-modern">My Tournaments</h1>
            <p className="page-subtitle-modern">Manage and view all your created tournaments</p>
          </div>
          
          <div className="w-100" style={{ overflowX: 'hidden' }}>
            <div className="mb-4">
              <Searchbar
                search={search}
                setSearch={setSearch}
              />
            </div>
            <div className="w-100">
              <TableContent
                items={data}
                accountId={authState.account_id}
              />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default MyTournaments;