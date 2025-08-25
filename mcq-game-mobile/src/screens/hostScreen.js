import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import { useSocketStore } from "../socketStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAll } from "../api";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from '@react-native-async-storage/async-storage';

const HostScreen = ({ navigation }) => {
    const { socket } = useSocketStore();
    const [qIndex, setQIndex] = useState(null);
    const [timeLeft, setTimeLeft] = useState(20);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [liveUsers, setLiveUsers] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [name, setName] = useState()
    const [questions, setQuestions] = useState([]);


    const intervalRef = useRef(null);
    const queryClient = useQueryClient()

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['data'],
        queryFn: getAll,
    });

    useEffect(() => {
        if (data) {
            setQuestions(data)
        }
    }, data)
    const users = data?.users || [];

    useEffect(() => {
        const getName = async () => {
            const name = await AsyncStorage.getItem('name');
            setName(name);
        };
        getName();
    }, []);

    const startCountdown = useCallback(() => {
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
    }, [])

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handler = (category) => {
            console.log(category)
            setQuestions(
                category
                    ? data?.filter((q) => q.category === category)
                    : data
            );
        };
        socket.on('update_category', handler);
        return () => socket.off('update_category', handler);
    }, [socket, data]);

    useEffect(() => {
        if (!socket) return;

        socket.on('start_game', (index) => setQIndex(index));
        socket.on('online-users', (ids) => setOnlineUserIds(ids));
        socket.on('receive-answer', ({ userId, answer, updatedScore }) => {
            setUserAnswers((prev) => {
                const updated = { ...prev };
                if (!updated[answer.questionId]) updated[answer.questionId] = [];

                const existingIndex = updated[answer.questionId].findIndex(u => u.name === userId);
                if (existingIndex !== -1) {
                    updated[answer.questionId][existingIndex].answer = answer.text;
                } else {
                    updated[answer.questionId].push({ name: userId, answer: answer.text });
                }
                return updated;
            });

            setLiveUsers(prevUsers =>
                prevUsers.map(user =>
                    user.name === userId ? { ...user, score: updatedScore } : user
                )
            );
        });

        return () => {
            socket.off('start_game');
            socket.off('online-users');
            socket.off('receive-answer');
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        const nextQuestionHandler = () => {
            stopTimer();
            setQIndex(prev => prev + 1);
            setTimeLeft(20);
        };

        const resetHandler = async () => {
            stopTimer();
            const newData = await queryClient.fetchQuery({
                queryKey: ['data'],
                queryFn: getAll,
            });

            setLiveUsers(newData.users);
            const transformed = {};
            newData.users.forEach(user => {
                user.answers?.forEach(({ questionId, text }) => {
                    if (!transformed[questionId]) transformed[questionId] = [];
                    transformed[questionId].push({ name: user.name, answer: text.trim() });
                });
            });
            setUserAnswers(transformed);
            setTimeLeft(20);
            startCountdown();
        };

        socket.on('next_question', nextQuestionHandler);
        socket.on('reset_question', resetHandler);

        return () => {
            socket.off('next_question', nextQuestionHandler);
            socket.off('reset_question', resetHandler);
        };
    }, [socket, data, qIndex]);

    useEffect(() => {
        if (!socket) return;

        const return_handler = async () => {
            stopTimer();
            const newData = await queryClient.fetchQuery({
                queryKey: ['data'],
                queryFn: getAll,
            });

            setLiveUsers(newData.users);
            const transformed = {};
            newData.users.forEach(user => {
                user.answers?.forEach(({ questionId, text }) => {
                    if (!transformed[questionId]) transformed[questionId] = [];
                    transformed[questionId].push({ name: user.name, answer: text.trim() });
                });
            });
            setUserAnswers(transformed);
            setQIndex(prev => (prev !== 0 ? prev - 1 : prev));
            setTimeLeft(20);
        };

        const stop_handler = () => {
            stopTimer();
            setQIndex(null);
            navigation.replace('Hello');

        };

        socket.on('return_question', return_handler);
        socket.on('stop_game', stop_handler);

        return () => {
            socket.off('return_question', return_handler);
            socket.off('stop_game', stop_handler);
        };
    }, [socket]);

    useEffect(() => {
        if (data?.users) {
            setLiveUsers(data.users);

            const transformed = {};
            data.users.forEach(user => {
                user.answers?.forEach(({ questionId, text }) => {
                    if (!transformed[questionId]) transformed[questionId] = [];
                    transformed[questionId].push({ name: user.name, answer: text.trim() });
                });
            });
            setUserAnswers(transformed);
        }
    }, [data]);

    useEffect(() => {
        if (!data || qIndex >= questions.length) return;
        startCountdown();
        return () => clearInterval(intervalRef.current);
    }, [qIndex, data]);

    const currentQuestion = questions[qIndex];
    const currentAnswers = userAnswers[currentQuestion?.id] || [];


    if (isError) return <Text style={styles.centeredTitle}>Erreur : {error?.message || "Une erreur est survenue"}</Text>;

    // if (qIndex === null) {
    //     return (
    //         <LinearGradient colors={['#FBD72B', '#00C6FF']} style={styles.container}>
    //             <StatusBar style="light" />
    //             {!name ? (
    //                 <Text style={styles.loading}>Chargement...</Text>
    //             ) : (
    //                 <View>
    //                     <Text style={styles.title}>Bonjour {name}</Text>
    //                     <Text style={styles.title}>Veuillez patienter jusqu'au démarrage du jeu</Text>
    //                 </View>
    //             )}
    //         </LinearGradient>
    //     );




    if (!data || isLoading) {
        return (
            <LinearGradient colors={['#00C6FF', '#FBD72B']} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <Text style={styles.pretitle}>جاري التحميل... </Text>
            </LinearGradient>
        );
    }
    if (qIndex >= data?.length) {
        return (
            <LinearGradient colors={['#00C6FF', '#FBD72B']} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <Text style={styles.pretitle}>انتهت اللعبة</Text>
            </LinearGradient>
        );
    }
    return (
        <LinearGradient colors={['#FBD72B', '#00C6FF']} style={styles.fullContainer}>
            {qIndex === null ? (
                <View style={styles.centeredView}>
                    <StatusBar style="light" />
                    {isLoading && <Text style={styles.centeredTitle}>جاري التحميل...</Text>}
                    <Text style={styles.centeredTitle}>
                        {name && !isLoading ? `مرحبا ${name} ${'\n \n'} يرجى الانتظار حتى يبدأ المشرف اللعبة` : 'جاري التحميل...'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.replace('Home')}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>🔙 رجوع</Text>
                    </TouchableOpacity>
                    {/* {name && !isLoading && (
                        <Text style={styles.centeredSubtitle}>يرجى انتظار بدء اللعبة من طرف المنسق</Text>
                    )} */}
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.centeredVertical}>
                        <View style={styles.mainRow}>
                            <View style={styles.leftColumn}>
                                <Text style={styles.sectionTitle}>السؤال {qIndex + 1} / {questions.length}</Text>
                                <View style={styles.timerCircle}>
                                    <Text style={styles.timerText}>{timeLeft}</Text>
                                    <Text style={styles.timerSubText}>ثواني</Text>
                                </View>                                <Text style={styles.questionText}>{currentQuestion.question}</Text>

                                <View style={styles.optionsWrapper}>
                                    {currentQuestion.answers.map((a, i) => (
                                        <Text
                                            key={i}
                                            style={a.isCorrect ? styles.correctAnswerOption : styles.wrongAnswerOption}
                                        >
                                            {a.text}
                                        </Text>
                                    ))}
                                </View>

                                <Text style={styles.sectionTitle}>إجابات اللاعبين</Text>
                                <ScrollView style={{ maxHeight: 200 }}>
                                    {currentAnswers.map((user, idx) => {
                                        const isCorrect = currentQuestion.answers.find(
                                            a => a.text.trim() === user.answer?.trim()
                                        )?.isCorrect;

                                        const bgColor =
                                            user.answer === 'no answer' ? '#FFD700' : isCorrect ? '#32CD32' : '#FF6347';

                                        return (
                                            <Text key={idx} style={[styles.responseItem, { backgroundColor: bgColor }]}>
                                                {user.name} : {user.answer}
                                            </Text>
                                        );
                                    })}
                                </ScrollView>
                            </View>

                            <View style={styles.rightColumn}>
                                <Text style={styles.sectionTitle}>جدول النقاط</Text>
                                <View style={styles.tableHeader}>
                                    <Text style={styles.tableHeaderText}>الاسم</Text>
                                    <Text style={styles.tableHeaderText}>النقاط</Text>
                                </View>
                                <ScrollView style={{ maxHeight: 300 }}>
                                    {liveUsers.filter(u => u.role !== 'host').sort((a, b) => b.score - a.score).map((u, idx) => (
                                        <View key={idx} style={styles.tableRow}>
                                            <Text style={styles.tableCell}>{u.name}</Text>
                                            <Text style={styles.tableCell}>{u.score}</Text>

                                        </View>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            )}
        </LinearGradient>
    );


};

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
    },
    scrollContainer: {
        padding: 20,
        flexGrow: 1,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    pretitle: {
        fontSize: 28, // Increased size for prominence
        color: "#1e3a8a", // Deep blue, matching timer text
        fontWeight: "bold",
        textAlign: 'center',
        backgroundColor: '#FBD72B', // Light blue background
        padding: 50,
        borderWidth: 2,
        borderColor: '#93c5fd', // Soft blue border
        borderRadius: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.75)', // Black shadow with 75% opacity
        textShadowOffset: { width: 0.1, height: 0.1 }, // Offset 2 units right and down
        textShadowRadius: 1, // Blur radius of 5 units

    },
    centeredTitle: {
        fontSize: 28,
        color: '#3507c2',
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: '#FBD72B',
        padding: 30,
        borderWidth: 4,
        borderColor: '#ffffff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 2, height: 2 },
        shadowRadius: 6,
        marginBottom: 30,
    },
    centeredVertical: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 20,
    },
    leftColumn: {
        flex: 1,
        paddingRight: 20,
        height: Dimensions.get('window').height * 0.8,
        justifyContent: 'space-between',
    },
    rightColumn: {
        width: 260,
        paddingLeft: 10,
    },
    sectionTitle: {
        backgroundColor: '#FBD72B',
        color: '#3507c2',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#fff',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    questionText: {
        backgroundColor: '#FBD72B',
        color: '#3507c2',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 16,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        marginBottom: 10,
    },
    timerCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#FBD72B',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 12,
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    timerText: {
        color: '#3507c2',
        fontSize: 30,
        fontWeight: 'bold',
    },
    timerSubText: {
        color: '#3507c2',
        fontSize: 12,
        marginTop: 4,
    },
    optionsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    correctAnswerOption: {
        backgroundColor: '#32CD32',
        color: '#fff',
        padding: 10,
        width: '47%',
        textAlign: 'center',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: '500',
        margin: 4,
    },
    wrongAnswerOption: {
        backgroundColor: '#FF4C4C',
        color: '#fff',
        padding: 10,
        width: '47%',
        textAlign: 'center',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: '500',
        margin: 4,
    },
    responseItem: {
        color: '#000',
        fontWeight: '600',
        padding: 8,
        borderRadius: 6,
        marginBottom: 6,
        fontSize: 14,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#fff',
        paddingBottom: 5,
        marginBottom: 8,
    },
    tableHeaderText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        width: '33%',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    tableCell: {
        color: '#fff',
        fontSize: 14,
        width: '33%',
        textAlign: 'center',
    },
    loading: {
        color: '#000',
        fontSize: 18,
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#ffffff50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ffffff80',
        marginTop: 30,
        width: 120,
        alignSelf: 'center',
    },
    backButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});




export default HostScreen;
