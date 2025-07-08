import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, addUser, updateUser } from '../api/context';
import './AddUser.css';

const AddUser = () => {
    const queryClient = useQueryClient();

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);


    const [formData, setFormData] = useState({ name: '', role: 'participant', midi: '' });

    const mutation = useMutation({
        mutationFn: addUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setFormData({ name: '', role: 'participant', midi: '' });
        },
        onError: (error) => {

            alert('Failed to add user. Please try again.');
        },
    });
    const updateMutation = useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setFormData({ name: '', role: 'participant', midi: '' });
            setIsEditing(false);
            setEditingId(null);
        },
        onError: () => {
            alert('Failed to update user. Please try again.');
        },
    });


    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim()) {
            if (isEditing) {
                updateMutation.mutate({ id: editingId, ...formData });
            } else {
                mutation.mutate(formData);
            }
        }
    };


    if (isLoading) return <div className="loading">Loading users...</div>;

    return (
        <div className="add-user-container">
            <div className="user-table" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', maxHeight: '70vh', overflowY: 'auto' }}>
                <h2 style={{ color: 'black' }}>Current Users</h2>
                <table>
                    <thead>
                        <tr style={{ color: 'black' }}>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Score</th>
                            <th>Midi</th>
                            <th>Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ color: 'black' }}>
                                <td>{user.name}</td>
                                <td>{user.role}</td>
                                <td>{user.score}</td>
                                <td>{user.midi}</td>
                                <td>
                                    <button className='update-btn' onClick={() => {
                                        setFormData({ name: user.name, role: user.role, midi: user.midi });
                                        setIsEditing(true);
                                        setEditingId(user.id);
                                    }}>
                                        Edit
                                    </button>
                                </td>


                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="user-form" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px' }}>
                <h2 style={{ color: 'black' }}>{!isEditing? 'Add New User' : 'Modify The User'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ backgroundColor: '#ccc', color: 'black' }}
                    />

                    <select name="role" value={formData.role} onChange={handleChange} style={{ backgroundColor: '#ccc', color: 'black' }}>
                        <option value="participant">Participant</option>
                        <option value="host">Host</option>
                    </select>
                    <input
                        type="number"
                        name="midi"
                        placeholder="Enter midi note"
                        value={formData.midi}
                        onChange={handleChange}
                        required
                        style={{ backgroundColor: '#ccc', color: 'black' }}
                    />

                    <button type="submit">
                        {isEditing
                            ? updateMutation.isLoading ? 'Modifying...' : 'Modify User'
                            : mutation.isLoading ? 'Adding...' : 'Add User'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AddUser;
