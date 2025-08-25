import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuestions, addQuestion, updateQuestion, removeQuestion, removeAllQuestions } from '../api/context';
import './addQuestion.css';
import Papa from 'papaparse';


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

    const [csvData, setcsvData] = useState(null)

    const [categoryInput, setCategoryInput] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedQCategory, setSelectedQCategory] = useState("");
    const [selectedFCategory, setSelectedFCategory] = useState("");
    const [version, setVersion] = useState(localStorage.getItem('version') || '');


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

    const qmutation = useMutation({
        mutationFn: removeQuestion,
        onSuccess: () => queryClient.invalidateQueries(['questions']),
        onError: () => alert('Error')
    });

    const handleRemoveQ = (id) => {
        qmutation.mutate({ id });


    };

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                const parsedQuestions = results.data.map(row => {
                    const answers = [
                        { text: row['choice 1'], isCorrect: parseInt(row.CorrectAnswer) === 1 },
                        { text: row['choice 2'], isCorrect: parseInt(row.CorrectAnswer) === 2 },
                        { text: row['choice 3'], isCorrect: parseInt(row.CorrectAnswer) === 3 },
                        { text: row['choice 4'], isCorrect: parseInt(row.CorrectAnswer) === 4 },
                    ];

                    return {
                        question: row.question,
                        question: row.category,
                        answers,
                        order: parseInt(row.order),
                    };
                });

                // parsedQuestions.forEach(q => mutation.mutate(q));
                setcsvData(parsedQuestions)
            },
        });
    };

    const handleCsvSubmit = async () => {
        csvData.forEach(q => mutation.mutate(q));
        setcsvData(null)
    }



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
            category: selectedQCategory
        };

        if (isEditing) {
            updateMutation.mutate({ id: editingId, ...payload });
        } else {
            mutation.mutate(payload);
        }
    };

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("categories")) || [];
        setCategories(stored);
    }, []);

    // Add category to localStorage and state
    const addCategory = () => {
        if (!categoryInput.trim()) return;

        const newCategories = [...categories, categoryInput.trim()];
        setCategories(newCategories);
        localStorage.setItem("categories", JSON.stringify(newCategories));
        setCategoryInput(""); // clear input
    };

    // Handle selection
    const handleSelect = (e) => {
        setSelectedCategory(e.target.value);
    };
    const handleSelectQ = (e) => {
        setSelectedQCategory(e.target.value);
    };
    const handleSelectF = (e) => {
        setSelectedFCategory(e.target.value);
    };
    const handleDelete = () => {
        const newCategories = categories.filter(c => c !== selectedCategory)
        setCategories(newCategories);
        localStorage.setItem("categories", JSON.stringify(newCategories));
        setCategoryInput(""); // clear input
        setSelectedCategory('');

    };


    return (
        <div className="question-container">

            <div
                style={{
                    padding: "16px",
                    maxWidth: "400px",
                    margin: "0 auto",
                    display: version === 'V3' ? "flex" : "none",
                    flexDirection: "column",
                    gap: "16px",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Category Manager</h2>

                <div style={{ display: "flex", gap: "8px" }}>
                    <input
                        type="text"
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        placeholder="Enter category"
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            padding: "8px",
                            flex: 1,
                        }}
                    />
                    <button
                        onClick={addCategory}
                        style={{
                            backgroundColor: "#007BFF",
                            color: "white",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                        }}
                    >
                        Add
                    </button>
                </div>

                <select
                    value={selectedCategory}
                    onChange={handleSelect}
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        padding: "8px",
                        display: version === 'V3' ? "flex" : "none",

                    }}
                >
                    <option value="">-- Select a category --</option>
                    {categories.map((cat, i) => (
                        <option key={i} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleDelete}
                    style={{
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Delete
                </button>

                {/* Display selected */}
                {selectedCategory && (
                    <p style={{ color: "#333" }}>
                        Selected category: <b>{selectedCategory}</b>
                    </p>
                )}
            </div>
            <section className="dashboard-section">
                <h2 className="section-title">Questions</h2>
                <button className="remove-btn" style={{ margin: '1rem', backgroundColor: 'red' }} onClick={() => { removeAllQuestions(); queryClient.invalidateQueries(['questions']) }}>
                    DELETE ALL QUESTIONS
                </button>
                <select
                    value={selectedFCategory}
                    onChange={handleSelectF}
                    style={{
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                        padding: "8px",
                        display: version === 'V3' ? "flex" : "none",

                    }}
                >
                    <option value="">Select a category</option>
                    {categories.map((cat, i) => (
                        <option key={i} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                <div className="card-grid">
                    {questions.filter(q => selectedFCategory ? q.category === selectedFCategory : q)?.map((q, index) => (
                        <div className="card question-card" key={q.id}>
                            <div>
                                <p className="question-text"><strong>Category:</strong> {q.category}</p>

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
                            <button className="remove-btn" style={{ marginLeft: '0.5rem', backgroundColor: 'red' }} onClick={() => handleRemoveQ(q.id)}>
                                Remove
                            </button>

                        </div>

                    ))}
                </div>
            </section>

            <div className="question-form">
                <h2>{!isEditing ? 'Add New Question' : 'Modify The Question'}</h2>
                <form onSubmit={handleSubmit}>
                    <select
                        value={selectedQCategory}
                        onChange={handleSelectQ}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            padding: "8px",
                            display: version === 'V3' ? "flex" : "none",

                        }}
                    >
                        <option value="">-- Select a category --</option>
                        {categories.map((cat, i) => (
                            <option key={i} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
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

                    <div style={{ marginBottom: '1rem', display: isEditing ? 'none' : '' }}>
                        <label style={{ color: 'black', fontWeight: 'bold' }}>

                            <input type="file" accept=".csv" onChange={handleCSVUpload} />
                        </label>
                    </div>

                    <button type='button' style={{ display: isEditing ? 'none' : '' }} disabled={!csvData} onClick={handleCsvSubmit}>Submit CSV</button>


                </form>
            </div>
        </div>
    );
};

export default AddQuestion;
