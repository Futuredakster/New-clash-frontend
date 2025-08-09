import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DivisionModal from '../DivisionModal';
import Dropdown from 'react-bootstrap/Dropdown';
import { useNavigate } from 'react-router-dom';
import { link } from '../constant';

const SeeDivisions = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tournament_name = queryParams.get('tournament_name');
  const tournament_id = queryParams.get('tournament_id');
  const queryString = new URLSearchParams({ tournament_id:tournament_id}).toString();
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [openStates, setOpenStates] = useState(Array(data.length).fill(false));
  const navigate = useNavigate();

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const toggleDropdown = (index) => {
    const newOpenStates = [...openStates];
    newOpenStates[index] = !newOpenStates[index];
    setOpenStates(newOpenStates);
  };
  
  const forPart = (division_id) =>{
    const quereString = new URLSearchParams({division_id:division_id}).toString();
    navigate(`/SeeParticepents?${quereString}`)
  }
  const forBrack = (division_id) =>{
    const quereString = new URLSearchParams({division_id:division_id}).toString();
    navigate(`/BracketApp?${quereString}`)
  }
  const onDelete = (division_id) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found. Delete request cannot be made.');
      return;
    }

    axios.delete(`${link}/divisions`, {
      headers: {
        accessToken: accessToken,
      },
      data: {
        division_id: division_id,
      }
    })
      .then(response => {
        console.log(response.data);
        console.log('Tournament deleted successfully.');
        window.location.reload();
      })
      .catch(error => {
        console.error('Error deleting tournament:', error);
      });
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error('Access token not found. API request not made.');
      return;
    }

    axios.get(`${link}/divisions/`, {
      headers: {
        accessToken: accessToken,
      },
      params: {
        tournament_id: tournament_id,
      },
    })
      .then(response => {
        if (response.data.error) {
          alert(response.data.error);
        } else {
          setData(response.data);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [tournament_id]);

  return (
    <div>
      <h1>{tournament_name}</h1>
      <button className="btn btn-primary" onClick={() => navigate(`/CreateDivision?${queryString}`)}> Add Division</button>
      <table>
        <thead>
          <tr>
            <th>Gender</th>
            <th>Age Group</th>
            <th>Proficiency Level</th>
            <th>Category</th>
            <th>Edit</th>
            <th>Participants</th>
            <th>Bracket Creator</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.gender}</td>
              <td>{item.age_group}</td>
              <td>{item.proficiency_level}</td>
              <td>{item.category}</td>
              <td>
              <Dropdown show={openStates[index]} onClick={() => toggleDropdown(index)}>
                  <Dropdown.Toggle variant="primary" id={`dropdown-basic-${index}`}>
                    Edit
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={handleShowModal}> Edit Division</Dropdown.Item>
                    <DivisionModal showModal={showModal} handleClose={handleCloseModal}  division_id={item.division_id} />
                    <Dropdown.Item onClick={() => onDelete(item.division_id)}>Delete</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
              <td><button variant="primary" onClick={() => {forPart(item.division_id) }}>Participants</button></td>
              <td><button variant="primary" onClick={() => {forBrack(item.division_id) }}>Create Brackets</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeeDivisions;
