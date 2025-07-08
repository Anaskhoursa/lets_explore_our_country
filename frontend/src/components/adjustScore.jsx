import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, adjustScore } from '../api/context';
import './AdjustScore.css';

const AdjustScore = () => {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const [editedScores, setEditedScores] = useState({});

  const mutation = useMutation({
    mutationFn: adjustScore,
    onSuccess: () => queryClient.invalidateQueries(['users']),
    onError: () => alert('Error')
  });

  const handleChange = (id, value) => {
    setEditedScores((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdate = (id) => {
    const newScore = parseInt(editedScores[id], 10);
    if (!isNaN(newScore)) {
      mutation.mutate({ id, newScore });
      setEditedScores({})
    }

  };

  if (isLoading) return <div className="loading">Loading users...</div>;

  return (
    <div className="adjust-score-container">
      <h2>Adjust User Scores</h2>
      <table className="score-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Current Score</th>
            <th>New Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.score}</td>
              <td>
                <input
                  type="number"
                  value={editedScores[user.id] ?? ''}
                  onChange={(e) => handleChange(user.id, e.target.value)}
                  className="score-input"
                />
              </td>
              <td>
                <button onClick={() => handleUpdate(user.id)} className="update-btn">
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdjustScore;
