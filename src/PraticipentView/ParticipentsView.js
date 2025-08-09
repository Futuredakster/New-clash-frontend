import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { link } from '../constant';

const Container = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  background: #f9f9f9;
  margin: 10px 0;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  margin-top: 20px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const ParticipantsView = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('participantAccessToken');
    if (!token) {
      setError({ message: 'No access token found.' });
      setLoading(false);
      return;
    }

    axios.get(`${link}/participants/All`, {
      headers: {
        participantAccessToken: token,
      },
    })
    .then(response => {
      setData(response.data);
      setLoading(false);
    })
    .catch(err => {
      setError(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingMessage>Loading...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error: {error.message || 'Unknown error'}</ErrorMessage>;
  }

  return (
    <Container>
      <Title>Participants</Title>
      {data.length === 0 ? (
        <p>No participants found.</p>
      ) : (
        <List>
          {data.map((participant, index) => (
            <ListItem key={index}>{participant.name}</ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default ParticipantsView;
