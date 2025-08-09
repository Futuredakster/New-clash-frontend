import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Searchbar from '../Searchbar';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../Divisions.css';
import { link } from '../constant';

const CompetitorView = ({ setProps }) => {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleViewDetails = (tournament) => {
        setProps(tournament);
        const queryString = new URLSearchParams({
            tournament_id: tournament.tournament_id,
        }).toString();
        navigate(`/Divisions?${queryString}`);
    };

    useEffect(() => {
        axios.get(`${link}/tournaments/praticipent`, {
            params: {
                tournament_name: search,
            },
        })
            .then(response => {
                if (response.data.error) {
                    setError(response.data.error);
                } else {
                    setData(response.data);
                    setError('');
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('An error occurred while fetching data.');
            });
    }, [search]);

    return (
        <div className="container mt-5">
            <Searchbar
                search={search}
                setSearch={setSearch}
            />
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row">
                {data.map((item, index) => (
                    <div key={index} className="col-md-4 mb-4">
                        <div className="card h-100">
                            {item.imageUrl &&
                                <img src={item.imageUrl} className="card-img-top" alt={item.tournament_name} />
                            }
                            <div className="card-body">
                                <h5 className="card-title">{item.tournament_name}</h5>
                                <p className="card-text">Start Date: {item.start_date}</p>
                                <p className="card-text">End Date: {item.end_date}</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => handleViewDetails(item)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

CompetitorView.propTypes = {
    setProps: PropTypes.func.isRequired,
};

export default CompetitorView;
