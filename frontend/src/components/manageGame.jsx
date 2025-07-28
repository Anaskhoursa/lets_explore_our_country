import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../socketWrapper";
import "./ManageGame.css";
import { getAll, getQuestions, incrementScore, play40sec, playLogo, playVS, resetAll, showBackground, showBackground2, showCaspar, showCaspar2, showCorrectOption, showCorrectOption2, showScore, showScore2, stopBackground, stopBackground2, stopLogo, stopQ, stopQ2, stopScore, stopScore2, stopVS } from "../api/context";
import { QueryClient, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

const ManageGame = () => {
    const socket = useSocket();
    const [timeLeft, setTimeLeft] = useState(20);
    const intervalRef = useRef(null);
    const [qIndex, setQIndex] = useState(null)
    const [userAnswers, setUserAnswers] = useState({})
    const [liveUsers, setLiveUsers] = useState([]);
    const [buttonsEnabled, setButtonsEnabled] = useState(false);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [isGameStarted, setIsGameStarted] = useState(false)
    const [optionsVisible, setOptionsVisible] = useState(true)
    const [usersVisible, setUsersVisible] = useState(true)
    const [questionVisible, setquestionVisible] = useState(false)
    const [answerVisible, setanswerVisible] = useState(false)

    const [scoreVisible, setscoreVisible] = useState(false)
    const [backgroundVisible, setbackgroundVisible] = useState(false)
    const [logoVisible, setlogoVisible] = useState(false)

    const [isRound, setIsRound] = useState(false)
    const [isChallenge, setIsChallenge] = useState(false)

    const [RoundtimeLeft1, setRoundTimeLeft1] = useState(40);
    const [RoundtimeLeft2, setRoundTimeLeft2] = useState(40);

    const [challengeShow, setChallengeShown] = useState(false)

    const [challengeResults, setChallengeResults] = useState(
        Array(5).fill().map(() => ({ winner: [], loser: [] }))
    );








    const queryClient = useQueryClient()
    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: ['data'],
        queryFn: getAll,
    });

    const users = data?.users || [];
    const questions = data?.questions || [];

    const currentQuestionId = questions[qIndex]?.id;
    const currentAnswers = userAnswers[currentQuestionId] || [];

    useEffect(() => {
        if (!socket) return;

        socket.emit("check_connected_users", (response) => {
            if (response?.success === true) {
                setButtonsEnabled(true);
                if (response?.users.length > 0) {
                    setOnlineUserIds(response?.users)

                }
            } else {
                setButtonsEnabled(false);
                if (response?.users.length > 0) {
                    setOnlineUserIds(response?.users)

                }
            }
        });


        const handleUsersConnected = ({ success }) => {
            console.log("users_connected event received:", success);

            if (success === true) {

                setButtonsEnabled(true);
            } else {
                setButtonsEnabled(false);
            }
        };

        socket.on("users_connected", handleUsersConnected);


        return () => {
            socket.off("users_connected", handleUsersConnected);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || typeof socket.on !== 'function') return;

        const handleOnlineUsers = (userIds) => {
            console.log(userIds)
            setOnlineUserIds(userIds);
        };

        socket.on('online-users', handleOnlineUsers);

        return () => {
            socket.off('online-users', handleOnlineUsers);
        };
    }, [socket]);




    // useEffect(() => {
    //     const transformUserData = (users) => {
    //         const result = {};

    //         users.forEach(user => {
    //             if (Array.isArray(user.answers)) {
    //                 user.answers.forEach(({ questionId, text }) => {
    //                     if (!result[questionId]) {
    //                         result[questionId] = [];
    //                     }

    //                     result[questionId].push({
    //                         name: user.name,
    //                         answer: text.trim()
    //                     });
    //                 });
    //             }
    //         });

    //         return result;
    //     };

    //     if (data?.users) {
    //         const transformedData = transformUserData(data.users)
    //         setUserAnswers(transformedData)
    //     }



    // }, [data])

    const handleShowStats = () => {
        if (qIndex === null) {
            alert('nooo')
            return
        };

        const question = questions[qIndex];
        if (!question) {
            alert('nooo')
            return
        };

        const options = question.answers.map(ans => ({
            text: ans.text,
            isCorrect: ans.isCorrect || false,
        }));

        // const answersData = (userAnswers[question.id] || []).map(userAnswer => {
        //     const chosenAnswer = userAnswer.answer;
        //     let status = "no answer";
        //     if (chosenAnswer !== "no answer") {
        //         const correctOption = options.find(o => o.text.trim() === chosenAnswer.trim());
        //         status = correctOption && correctOption.isCorrect ? "correct" : "wrong";
        //     }
        //     const userObj = liveUsers.find(u => u.name === userAnswer.name);
        //     const score = userObj?.score || 0;

        //     return {
        //         name: userAnswer.name,
        //         chosenAnswer,
        //         status,
        //         score,
        //     };
        // });

        const payload = {
            question: question.question,
            options,
            number: qIndex + 1,
        };

        showCaspar(payload)
    };
    const handleShowStats2 = () => {
        if (qIndex === null) {
            alert('nooo')
            return
        };

        const question = questions[qIndex];
        if (!question) {
            alert('nooo')
            return
        };

        const options = question.answers.map(ans => ({
            text: ans.text,
            isCorrect: ans.isCorrect || false,
        }));

        // const answersData = (userAnswers[question.id] || []).map(userAnswer => {
        //     const chosenAnswer = userAnswer.answer;
        //     let status = "no answer";
        //     if (chosenAnswer !== "no answer") {
        //         const correctOption = options.find(o => o.text.trim() === chosenAnswer.trim());
        //         status = correctOption && correctOption.isCorrect ? "correct" : "wrong";
        //     }
        //     const userObj = liveUsers.find(u => u.name === userAnswer.name);
        //     const score = userObj?.score || 0;

        //     return {
        //         name: userAnswer.name,
        //         chosenAnswer,
        //         status,
        //         score,
        //     };
        // });

        const payload = {
            question: question.question,
            options,
            number: qIndex + 1,
        };

        showCaspar2(payload)
    };
    const handleShowCorrect = () => {
        if (qIndex === null) {
            alert('nooo')
            return
        };

        const question = questions[qIndex];
        if (!question) {
            alert('nooo')
            return
        };

        const options = question.answers.map(ans => ({
            text: ans.text,
            isCorrect: ans.isCorrect || false,
        }));

        // const answersData = (userAnswers[question.id] || []).map(userAnswer => {
        //     const chosenAnswer = userAnswer.answer;
        //     let status = "no answer";
        //     if (chosenAnswer !== "no answer") {
        //         const correctOption = options.find(o => o.text.trim() === chosenAnswer.trim());
        //         status = correctOption && correctOption.isCorrect ? "correct" : "wrong";
        //     }
        //     const userObj = liveUsers.find(u => u.name === userAnswer.name);
        //     const score = userObj?.score || 0;

        //     return {
        //         name: userAnswer.name,
        //         chosenAnswer,
        //         status,
        //         score,
        //     };
        // });

        const payload = {
            question: question.question,
            options,
            number: qIndex + 1,
        };

        showCorrectOption(payload)
    };
    const handleShowCorrect2 = () => {
        if (qIndex === null) {
            alert('nooo')
            return
        };

        const question = questions[qIndex];
        if (!question) {
            alert('nooo')
            return
        };

        const options = question.answers.map(ans => ({
            text: ans.text,
            isCorrect: ans.isCorrect || false,
        }));

        // const answersData = (userAnswers[question.id] || []).map(userAnswer => {
        //     const chosenAnswer = userAnswer.answer;
        //     let status = "no answer";
        //     if (chosenAnswer !== "no answer") {
        //         const correctOption = options.find(o => o.text.trim() === chosenAnswer.trim());
        //         status = correctOption && correctOption.isCorrect ? "correct" : "wrong";
        //     }
        //     const userObj = liveUsers.find(u => u.name === userAnswer.name);
        //     const score = userObj?.score || 0;

        //     return {
        //         name: userAnswer.name,
        //         chosenAnswer,
        //         status,
        //         score,
        //     };
        // });

        const payload = {
            question: question.question,
            options,
            number: qIndex + 1,
        };

        showCorrectOption2(payload)
    };

    const handleShowScore = () => {
        if (qIndex === null) {
            alert('nooo')
            return
        };

        if (!liveUsers) {
            alert('loading, try again later')
            return
        };

        const data = { data: liveUsers.filter(u => u.role !== 'host') }

        // const answersData = (userAnswers[question.id] || []).map(userAnswer => {
        //     const chosenAnswer = userAnswer.answer;
        //     let status = "no answer";
        //     if (chosenAnswer !== "no answer") {
        //         const correctOption = options.find(o => o.text.trim() === chosenAnswer.trim());
        //         status = correctOption && correctOption.isCorrect ? "correct" : "wrong";
        //     }
        //     const userObj = liveUsers.find(u => u.name === userAnswer.name);
        //     const score = userObj?.score || 0;

        //     return {
        //         name: userAnswer.name,
        //         chosenAnswer,
        //         status,
        //         score,
        //     };
        // });



        showScore(data)
    };
    const handleShowScore2 = () => {
        if (qIndex === null) {
            alert('nooo')
            return
        };

        if (!liveUsers) {
            alert('loading, try again later')
            return
        };

        const data = { data: liveUsers.filter(u => u.role !== 'host') }

        // const answersData = (userAnswers[question.id] || []).map(userAnswer => {
        //     const chosenAnswer = userAnswer.answer;
        //     let status = "no answer";
        //     if (chosenAnswer !== "no answer") {
        //         const correctOption = options.find(o => o.text.trim() === chosenAnswer.trim());
        //         status = correctOption && correctOption.isCorrect ? "correct" : "wrong";
        //     }
        //     const userObj = liveUsers.find(u => u.name === userAnswer.name);
        //     const score = userObj?.score || 0;

        //     return {
        //         name: userAnswer.name,
        //         chosenAnswer,
        //         status,
        //         score,
        //     };
        // });



        showScore2(data)
    };


    const transformUserData = (users) => {
        const result = {};

        users.forEach(user => {
            if (Array.isArray(user.answers)) {
                user.answers.forEach(({ questionId, text }) => {
                    if (!result[questionId]) {
                        result[questionId] = [];
                    }

                    result[questionId].push({
                        name: user.name,
                        answer: text.trim()
                    });
                });
            }
        });

        return result;
    };



    useEffect(() => {
        if (data?.users) {
            setLiveUsers(data.users);



            const transformedData = transformUserData(data.users);
            setUserAnswers(transformedData);
        }
    }, [data]);





    useEffect(() => {
        if (!socket) return;

        const handleReceiveAnswer = ({ userId, answer, updatedScore }) => {
            console.log('receiveddd');
            const questionId = answer.questionId;

            setUserAnswers(prev => {
                const updated = { ...prev };

                if (!updated[questionId]) {
                    updated[questionId] = [];
                }

                const existingIndex = updated[questionId].findIndex(entry => entry.name === userId);

                if (existingIndex !== -1) {
                    updated[questionId][existingIndex].answer = answer.text.trim();
                } else {
                    updated[questionId].push({
                        name: userId,
                        answer: answer.text.trim()
                    });
                }

                return updated;
            });

            setLiveUsers(prevUsers =>
                prevUsers.map(user =>
                    user.name === userId ? { ...user, score: updatedScore } : user
                )
            );
        };

        socket.on('receive-answer', handleReceiveAnswer);

        return () => {
            socket.off('receive-answer', handleReceiveAnswer);
        };
    }, [socket]);


    useEffect(() => {
        console.log(userAnswers)
    }, [userAnswers])


    const incrementScoreHandle = async (id) => {
        await incrementScore({ id })
        await queryClient.refetchQueries(['data']);

        const newData = queryClient.getQueryData(['data']);
        console.log('Fresh data:', newData);

        setLiveUsers(newData.users);
        setUserAnswers(transformUserData(newData.users));
    }

    const startCountdown = () => {
        setTimeLeft(20);
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startRoundCountdown1 = () => {
        setRoundTimeLeft1(40);
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setRoundTimeLeft1(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    const startRoundCountdown2 = () => {
        setRoundTimeLeft2(40);
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setRoundTimeLeft2(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

    };


    useEffect(() => {
        if (qIndex !== null && qIndex >= 0 && qIndex < questions.length && isGameStarted) {
            handleShowStats();
            handleShowStats2();
        }
        else {
            stopQ();
            stopQ2();
        }

    }, [qIndex, isGameStarted])


    const handleStartClick = (eventName) => {
        socket.emit(eventName, qIndex);

        setIsGameStarted(true)
        startCountdown();
    };
    const handleNextClick = (eventName) => {
        socket.emit(eventName);
        setQIndex((prevIndex) => prevIndex !== questions.length - 1 ? prevIndex + 1 : prevIndex);
        startCountdown();
    };
    const handleResetClick = (eventName) => {
        if (qIndex !== null) {
            socket.emit(eventName, { questionId: questions[qIndex]?.id }, async (response) => {
                if (response?.success) {

                    await queryClient.refetchQueries(['data']);

                    // Get fresh data from cache
                    const newData = queryClient.getQueryData(['data']);
                    console.log('Fresh data:', newData);

                    setLiveUsers(newData.users);
                    setUserAnswers(transformUserData(newData.users));

                    if (timeLeft !== 20) startCountdown();
                } else {
                    console.error('Vote failed:', response?.error);
                }
            });

            if (timeLeft !== 20) startCountdown();
        }
    };

    const handleResetAll = async () => {

        const response = await resetAll()
        if (response === 'updated') {
            await queryClient.refetchQueries(['data']);

            // Get fresh data from cache
            const newData = queryClient.getQueryData(['data']);
            console.log('Fresh data:', newData);

            setLiveUsers(newData.users);
            setUserAnswers(transformUserData(newData.users));

        } else {
            console.error('Vote failed:', response?.error);
        }
        ;


    };

    useEffect(() => {
        console.log('Data updated from query', data);

    }, [data]);

    const handleReturnClick = (eventName) => {
        if (qIndex !== null && qIndex !== 0) {
            socket.emit(eventName, { questionId: questions[qIndex]?.id, questionIdB: questions[qIndex - 1]?.id }, async (response) => {
                if (response?.success) {
                    console.log(questions[qIndex]?.id, questions[qIndex - 1]?.id)
                    await queryClient.refetchQueries(['data']);

                    const newData = queryClient.getQueryData(['data']);
                    console.log('Fresh data:', newData);

                    setLiveUsers(newData.users);
                    setUserAnswers(transformUserData(newData.users));
                    if (timeLeft !== 20) startCountdown()


                } else {
                    console.error('Vote failed:', response?.error);
                }
            });
            setQIndex((prevIndex) => prevIndex !== 0 ? prevIndex - 1 : prevIndex);

            startCountdown();
        }

    };
    const handleStopClick = (eventName) => {
        socket.emit(eventName);
        setTimeLeft(20)
        clearInterval(intervalRef.current);
        setQIndex(null)
        setIsGameStarted(false)

    };

    const handleRefreshOnline = () => {
        socket.emit("check_connected_users", (response) => {
            if (response?.success === true) {
                setButtonsEnabled(true);
                if (response?.users.length > 0) {
                    setOnlineUserIds(response?.users)

                }
            } else {
                setButtonsEnabled(false);
                if (response?.users.length > 0) {
                    setOnlineUserIds(response?.users)

                }
            }
        });
    }

    const handleToggleResult = (clicked, opponent, index) => {
        setChallengeResults(prev => {
            const updated = [...prev];
            const current = updated[index - 1];

            const isWinner = current.winner.includes(clicked);
            const isLoser = current.loser.includes(clicked);

            let newWinners = current.winner.filter(u => u !== clicked && u !== opponent);
            let newLosers = current.loser.filter(u => u !== clicked && u !== opponent);

            if (isWinner) {
                // Make opponent the winner
                newWinners.push(opponent);
                newLosers.push(clicked);
            } else if (isLoser) {
                // Make clicked the winner
                newWinners.push(clicked);
                newLosers.push(opponent);
            } else {
                // Neutral → Make clicked winner, opponent loser
                newWinners.push(clicked);
                newLosers.push(opponent);
            }

            updated[index - 1] = {
                winner: newWinners,
                loser: newLosers,
            };

            return updated;
        });
    };




    if (isLoading) {
        return <div style={{ marginTop: '5rem' }}>loading...</div>
    }



    return (
        <div>
            <div className="manage-game">
                <div className="game-controls">
                    <button onClick={() => handleStartClick('start_game')} disabled={!buttonsEnabled || qIndex === null}>Start</button>
                    <button onClick={() => timeLeft === 0 ? handleNextClick('next_question') : null} disabled={!buttonsEnabled || qIndex === null || timeLeft !== 0}>Next</button>
                    <button onClick={() => handleResetClick('reset_question')} disabled={qIndex === null}>Reset</button>
                    <button onClick={() => handleResetAll()} >Reset All</button>

                    {/* <button onClick={() => handleReturnClick('return_question')} disabled={!buttonsEnabled || qIndex === null}>Return</button> */}
                    <button onClick={() => handleStopClick('stop_game')} disabled={qIndex === null}>Stop</button>
                    <button onClick={() => { socket.emit('round_time'); setIsRound(true), setIsChallenge(false) }} >Defi</button>
                    <button onClick={() => { socket.emit('between_round_time');; setIsRound(false), setIsChallenge(true) }} >Face a Face </button>
                    <button style={{ display: isChallenge || isRound ? '' : 'none' }} onClick={() => { setIsRound(false), setIsChallenge(false) }} >Return</button>


                    {qIndex !== null && !questionVisible && (
                        <button onClick={() => { handleShowStats(); handleShowStats2(); setquestionVisible(true) }} >
                            Show Question
                        </button>

                    )}
                    {qIndex !== null && questionVisible && (
                        <button onClick={() => { stopQ(); stopQ2(); setquestionVisible(false) }} >
                            Hide Question
                        </button>

                    )}
                    {/* {qIndex !== null && (
                    <button onClick={handleShowStats2} >
                        Show Question 2
                    </button>

                )} */}
                    {qIndex !== null && !questionVisible && (
                        <button onClick={() => { handleShowCorrect(); handleShowCorrect2(); setquestionVisible(true) }} >
                            Show Answer
                        </button>

                    )}
                    {/* {qIndex !== null && (
                    <button onClick={handleShowCorrect2} >
                        Show Answer 2
                    </button>

                )} */}
                    {qIndex !== null && !scoreVisible && (
                        <button onClick={() => { handleShowScore(); handleShowScore2(); setscoreVisible(true) }} >
                            Show Score
                        </button>

                    )}
                    {qIndex !== null && scoreVisible && (
                        <button onClick={() => { stopScore(); stopScore2(); setscoreVisible(false) }} >
                            Hide Score
                        </button>

                    )}
                    {/* {qIndex !== null && (
                    <button onClick={handleShowScore2} >
                        Show Score 2
                    </button>

                )} */}
                    {!backgroundVisible && <button onClick={() => { showBackground(); showBackground2(); setbackgroundVisible(true) }} >
                        Show Background
                    </button>}
                    {backgroundVisible && <button onClick={() => { stopBackground(); stopBackground2(); setbackgroundVisible(false) }} >
                        Hide Background
                    </button>}

                    {/* <button onClick={() => showBackground2()} >
                    Show Background 2
                </button> */}



                    {/* {qIndex !== null && (
                    <button onClick={() => stopQ2()} >
                        Hide Question 2
                    </button>

                )} */}

                    {/* {qIndex !== null && (
                    <button onClick={() => stopScore2()} >
                        Hide Score 2
                    </button>

                )} */}

                    {/* <button onClick={() => stopBackground2()} >
                    Hide Background 2
                </button> */}

                    {!logoVisible && <button onClick={() => { playLogo(); setlogoVisible(true) }} >
                        Show Logo
                    </button>}
                    {logoVisible && <button onClick={() => { stopLogo(); setlogoVisible(false) }} >
                        Hide Logo
                    </button>}



                </div>


                <div className="game-panel">
                    {!isChallenge && !isRound && <div className="realtime-questions">
                        <div className="question-buttons">
                            {questions.map((question, index) => (
                                <button
                                    key={question.id}
                                    className="circle-btn"
                                    style={{ backgroundColor: index === qIndex ? 'blue' : 'purple' }}
                                    onClick={() => setQIndex(index)}
                                >
                                    {index + 1}
                                </button>
                            ))}

                        </div>

                        {qIndex !== null ? <div className="question-box">
                            <div className="countdown-timer">Time Left: {timeLeft}s</div>
                            <button className="circle-btn" style={{ padding: '10px', width: '3.5rem', borderRadius: '5px' }} onClick={() => setOptionsVisible(prev => !prev)}>{optionsVisible ? 'Hide' : 'Show'}</button>
                            <h3 className="question-text" style={{ textAlign: '' }} >{questions[qIndex]?.question}</h3>
                            <ul className="answers-list" style={{ display: optionsVisible ? 'block' : 'none' }}>
                                {questions[qIndex]?.answers.map((option, idx) => (
                                    <li key={idx} className="answer-option" style={{ textAlign: '', backgroundColor: option.isCorrect ? 'green' : "red" }}>{option.text}</li>
                                ))}
                            </ul>
                        </div> : <div style={{ color: 'black' }}>Please start the game first</div>}
                        <div className="users-answers">
                            <table className="score-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Answer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAnswers.map((user, idx) => (
                                        <tr key={idx}>
                                            <td>{user.name}</td>
                                            <td style={{
                                                backgroundColor: (user.answer === 'no answer' ? 'yellow' :
                                                    questions.find(q => q.id === currentQuestionId)?.answers
                                                        .find(ans => ans.text.trim() === user.answer)?.isCorrect
                                                        ? 'green'
                                                        : 'red'
                                                )
                                            }}>
                                                {user.answer}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>}

                    {isRound && (
                        <div className="realtime-questions" style={{ display: 'flex', flexDirection: 'row', gap: '3rem', alignItems: 'center', padding: '1rem', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <button
                                    onClick={() => { play40sec(); startRoundCountdown1(); }}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        backgroundColor: '#4F46E5',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    Start {users[0].name}
                                </button>
                                <div style={{ color: '#111827', fontSize: '18px', fontWeight: '600', color: 'red', border: '5px solid red', padding: '1rem', borderRadius: '100px' }}>{RoundtimeLeft1}</div>
                                <button disabled={RoundtimeLeft1 !== 0} style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    backgroundColor: '#4F46E5',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }} onClick={() => incrementScoreHandle(users[0].id)}>+1</button>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <button
                                    onClick={() => { play40sec(); startRoundCountdown2(); }}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        backgroundColor: '#4F46E5',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    Start {users[1].name}
                                </button>
                                <div style={{ color: '#111827', fontSize: '18px', fontWeight: '600', color: 'red', border: '5px solid red', padding: '1rem', borderRadius: '100px' }}>{RoundtimeLeft2}</div>
                                <button disabled={RoundtimeLeft2 !== 0} style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    backgroundColor: '#4F46E5',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }} onClick={() => incrementScoreHandle(users[1].id)}>+1</button>

                            </div>


                        </div>
                    )}

                    {isChallenge && (
                        <div className="realtime-questions" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', padding: '1rem', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {users[0].members.map((m, idx) => (
                                    <div>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            {[1, 2, 3, 4, 5].map(index =>
                                                <div
                                                    key={index}
                                                    style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        border: '2px solid black',
                                                        backgroundColor: challengeResults[index - 1].winner.includes(m) ? 'green' : challengeResults[index - 1].loser.includes(m) ? 'red' : 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        flexDirection: 'row'
                                                    }}
                                                    onClick={() => handleToggleResult(m, users[1].members[idx], index)}



                                                > </div>
                                            )}
                                        </div>
                                        <button
                                            key={idx}
                                            onClick={() => incrementScoreHandle(users[0].id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                backgroundColor: '#10B981',
                                                color: '#fff',
                                                border: 'none',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                fontSize: '15px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                marginTop: '2rem',
                                                marginBottom: '2rem'

                                            }}
                                        >
                                            {m} +1
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {users[1].members.map((m, idx) => (
                                    <div>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            {[1, 2, 3, 4, 5].map(index =>
                                                <div style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    border: '2px solid black',
                                                    backgroundColor: challengeResults[index - 1].winner.includes(m) ? 'green' : challengeResults[index - 1].loser.includes(m) ? 'red' : 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'row'
                                                }}
                                                    onClick={() => handleToggleResult(m, users[0].members[idx], index)}


                                                > </div>
                                            )}
                                        </div>
                                        <button
                                            key={idx}
                                            onClick={() => incrementScoreHandle(users[1].id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                backgroundColor: '#EF4444',
                                                color: '#fff',
                                                border: 'none',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                fontSize: '15px',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                marginTop: '2rem',
                                                marginBottom: '2rem'
                                            }}
                                        >
                                            {m} +1
                                        </button>

                                        {!challengeShow && <button style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            backgroundColor: '#5529dbff',
                                            color: '#fff',
                                            border: 'none',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            fontSize: '15px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            marginLeft: '5rem'
                                        }} onClick={() => { playVS({ name1: users[0].members[idx], name2: users[1].members[idx] }), setChallengeShown(true) }}>Show</button>}

                                        {challengeShow && <button style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            backgroundColor: '#5529dbff',
                                            color: '#fff',
                                            border: 'none',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            fontSize: '15px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            marginLeft: '5rem'

                                        }} onClick={() => { stopVS({ name1: users[0].members[idx], name2: users[1].members[idx] }), setChallengeShown(false) }}>Hide</button>}

                                    </div>

                                ))}
                            </div>
                        </div>
                    )}



                    <div className="realtime-scores">
                        <button className="circle-btn" style={{ padding: '10px', width: '3.5rem', borderRadius: '5px' }} onClick={() => setUsersVisible(prev => !prev)}>{usersVisible ? 'Hide' : 'Show'}</button>
                        <button className="circle-btn" style={{ padding: '10px', width: '2.5rem', borderRadius: '5px', marginLeft: '8rem', color: 'white' }} onClick={() => handleRefreshOnline()}><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 30 30">
                            <path d="M 15 3 C 12.031398 3 9.3028202 4.0834384 7.2070312 5.875 A 1.0001 1.0001 0 1 0 8.5058594 7.3945312 C 10.25407 5.9000929 12.516602 5 15 5 C 20.19656 5 24.450989 8.9379267 24.951172 14 L 22 14 L 26 20 L 30 14 L 26.949219 14 C 26.437925 7.8516588 21.277839 3 15 3 z M 4 10 L 0 16 L 3.0507812 16 C 3.562075 22.148341 8.7221607 27 15 27 C 17.968602 27 20.69718 25.916562 22.792969 24.125 A 1.0001 1.0001 0 1 0 21.494141 22.605469 C 19.74593 24.099907 17.483398 25 15 25 C 9.80344 25 5.5490109 21.062074 5.0488281 16 L 8 16 L 4 10 z"></path>
                        </svg></button>

                        <table className="score-table" style={{ display: usersVisible ? '' : 'none' }}>
                            <thead>
                                <tr>
                                    <th>Participant</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {liveUsers.filter(u => u.role !== 'host').map((user, idx) => (
                                    <tr key={idx}>
                                        <td>{user.name}</td>
                                        <td>{user.score}</td>
                                        <td style={{ color: onlineUserIds.includes(String(user.name)) ? 'green' : 'red' }}>
                                            {onlineUserIds.includes(String(user.name)) ? '🟢' : '🔴'}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <table className="score-table" style={{ display: usersVisible ? '' : 'none' }}>
                            <thead>
                                <tr>

                                    <th>Animateur</th>

                                    <th>Status</th>

                                </tr>
                            </thead>
                            <tbody>
                                {liveUsers.filter(u => u.role === 'host').map((user, idx) => (
                                    <tr key={idx}>
                                        <td>{user.name}</td>

                                        <td style={{ color: onlineUserIds.includes(String(user.name)) ? 'green' : 'red' }}>
                                            {onlineUserIds.includes(String(user.name)) ? '🟢' : '🔴'}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>


        </div>
    );
};

export default ManageGame;
