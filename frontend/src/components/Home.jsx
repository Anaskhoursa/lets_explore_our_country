import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAll, playName, removeQuestion, removeUser, stopName } from '../api/context';
import './Home.css';
import { useSocket } from '../socketWrapper';
import React, { useState } from 'react';


const Home = () => {

    const queryClient = useQueryClient()
    const socket = useSocket()
    const [isNameShown, setIsNameShown] = useState(false);

    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: ['data'],
        queryFn: getAll,
    });

    const mutation = useMutation({
        mutationFn: removeUser,
        onSuccess: () => queryClient.invalidateQueries(['data']),
        onError: () => alert('Error')
    });

    const qmutation = useMutation({
        mutationFn: removeQuestion,
        onSuccess: () => queryClient.invalidateQueries(['data']),
        onError: () => alert('Error')
    });

    const handleRemove = (id) => {
        mutation.mutate({ id });


    };
    const handleRemoveQ = (id) => {
        qmutation.mutate({ id });


    };

    if (isLoading || isFetching) return <div className="loading">Loading...</div>;
    if (isError) return <div className="error">Error fetching data</div>;






    const { users, questions } = data;

    return (
        <div className="dashboard-container">


            <div className="user-table" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', maxHeight: '70vh', overflowY: 'auto' }}>
                <h2 style={{ color: 'black' }}>Current Users</h2>
                <table>
                    <thead>
                        <tr style={{ color: 'black' }}>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Score</th>
                            <th>Remove</th>
                            <th>Show Name</th>


                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ color: 'black' }}>
                                <td>{user.name}</td>
                                <td>{user.role}</td>
                                <td>{user.score}</td>
                                <td>
                                    <button className="update-btn" onClick={() => handleRemove(user.id)}>
                                        Remove
                                    </button>
                                </td>
                                <td>
                                    <button className="update-btn" onClick={() => !isNameShown ? (playName({ name: user.name }), setIsNameShown(true)) : (stopName(), setIsNameShown(false))}>
                                        {!isNameShown ? 'Show' : 'Hide'} Name
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <section className="dashboard-section">
                <h2 className="section-title">Questions</h2>
                <div className="card-grid">
                    {questions?.map((q, index) => (
                        <div className="card question-card" key={q.id}>
                            <div>
                                <p className="question-text"><strong>Q{index + 1}:</strong> {q.question}</p>
                                <ul className="answer-list">
                                    {q.answers.map((ans, i) => (
                                        <li
                                            key={i}
                                            className={`answer-item ${ans.isCorrect ? 'correct' : ''}`}
                                        >
                                            {String.fromCharCode(65 + i)}. {ans.text}
                                            {ans.isCorrect && <span className="correct-badge">Correct</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button className="remove-btn" onClick={() => handleRemoveQ(q.id)}>
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
