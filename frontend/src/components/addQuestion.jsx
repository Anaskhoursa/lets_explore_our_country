import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuestions, addQuestion, updateQuestion } from '../api/context';
import './addQuestion.css';

const AddQuestion = () => {
    const queryClient = useQueryClient();

    const { data: questions = [], isLoading } = useQuery({
        queryKey: ['questions'],
        queryFn: getQuestions,
    });

    const [questionText, setQuestionText] = useState('');
    const [answers, setAnswers] = useState(['', '', '', '']);
    const [order, setOrder] = useState('');

    const [correctIndex, setCorrectIndex] = useState(0);

    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);


    const mutation = useMutation({
        mutationFn: addQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries(['questions']);
            setQuestionText('');
            setAnswers(['', '', '', '']);
            setOrder('')
            setCorrectIndex(0);
        },
        onError: (err) => {
            alert('Failed to add question.');
            console.error(err);
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries(['questions']);
            setQuestionText('');
            setAnswers(['', '', '', '']);
            setOrder('');
            setCorrectIndex(0);
            setIsEditing(false);
            setEditingId(null)
        },
        onError: (err) => {
            alert('Failed to update question.');
            console.error(err);
        },
    });


    const handleAnswerChange = (index, value) => {
        const updated = [...answers];
        updated[index] = value;
        setAnswers(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const answerObjects = answers.map((text, index) => ({
            text,
            isCorrect: index === parseInt(correctIndex),
        }));

        const payload = {
            question: questionText,
            answers: answerObjects,
            order,
        };

        if (isEditing) {
            updateMutation.mutate({ id: editingId, ...payload });
        } else {
            mutation.mutate(payload);
        }
    };


    return (
        <div className="question-container">
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
                            <button className='remove-btn' onClick={() => {
                                setQuestionText(q.question);
                                setAnswers(q.answers.map(a => a.text));
                                setCorrectIndex(q.answers.findIndex(a => a.isCorrect));
                                setOrder(q.ordre);
                                setEditingId(q.id);
                                setIsEditing(true);
                            }}>
                                Edit
                            </button>

                        </div>
                    ))}
                </div>
            </section>

            <div className="question-form">
                <h2>{!isEditing ? 'Add New Question' : 'Modify The Question'}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter question"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        required
                    />
                    {answers.map((ans, index) => (
                        <div className="answer-input" key={index}>
                            <input
                                type="text"
                                placeholder={`Answer ${String.fromCharCode(65 + index)}`}
                                value={ans}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                required
                            />
                            <label style={{ color: 'black' }}
                            >
                                <input
                                    type="radio"
                                    name="correct"
                                    value={index}
                                    checked={correctIndex === index}
                                    onChange={() => setCorrectIndex(index)}
                                />
                                Correct
                            </label>
                        </div>
                    ))}
                    <input
                        type="text"
                        placeholder="Order"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                        required
                    />
                    <button type="submit" disabled={mutation.isLoading || updateMutation.isLoading}>
                        {isEditing ? (updateMutation.isLoading ? 'Modifying...' : 'Modify Question') : (mutation.isLoading ? 'Adding...' : 'Add Question')}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default AddQuestion;
