import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getQuestions } from "../api";
import { useSocketStore } from "../socketStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GameScreen = ({ navigation }) => {
  const [qIndex, setQIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const timeoutRef = useRef(null);
  const { socket } = useSocketStore();
  const [answer, setAnswer] = useState(null);
  const [name, setName] = useState("");
  const [isRound, setIsRound] = useState(false);

  const [isChallenge, setIsChallenge] = useState(false);


  const gameStoppedRef = useRef(false);

  const answerRef = useRef(answer);
  const nameRef = useRef(name);
  const hasSubmittedRef = useRef(false);
  const currentQuestionIdRef = useRef(null);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  const { data, isLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: getQuestions,
  });

  useEffect(() => {
    const getName = async () => {
      const storedName = await AsyncStorage.getItem('name');
      setName(storedName);
    };
    getName();
  }, []);

  useEffect(() => {
    if (data && qIndex !== null && qIndex < data.length) {
      currentQuestionIdRef.current = data[qIndex].id;
      setAnswer(null);
      hasSubmittedRef.current = false;
    }
  }, [data, qIndex]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Tick the timer by reducing it every second
  useEffect(() => {
    if (timeLeft <= 0 || qIndex === null || gameStoppedRef.current) return;

    timeoutRef.current = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 900);

    return () => clearTimeout(timeoutRef.current);
  }, [timeLeft, qIndex]);

  useEffect(() => {
    if (timeLeft === 0 && !gameStoppedRef.current && !hasSubmittedRef.current && socket && nameRef.current) {
      if (answerRef.current) {
        console.log('save_answer', nameRef.current);
        socket.emit("save_answer", {
          userId: nameRef.current,
          answer: answerRef.current
        });
      } else {
        console.log('save_empty', nameRef.current);
        socket.emit("save_empty_answer", {
          userId: nameRef.current,
          questionId: currentQuestionIdRef.current,
        });
      }
      hasSubmittedRef.current = true;
    }
  }, [timeLeft]);

  const startTimer = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setTimeLeft(20);
  };




  const stopTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  // useEffect(() => {
  //   if (!data || qIndex >= data.length || qIndex === null) return;
  //   startTimer();
  //   return () => clearTimeout(timeoutRef.current);
  // }, [qIndex, data]);

  useEffect(() => {
    if (!socket) return;
    const handler = (qIndex) => {
      gameStoppedRef.current = false;
      setQIndex(qIndex);
      startTimer()
    };
    socket.on('start_game', handler);
    return () => socket.off('start_game', handler);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      setIsRound(true)
    };
    socket.on('round_time', handler);
    return () => socket.off('round_time', handler);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      setIsChallenge(true)
    };
    socket.on('between_round_time', handler);
    return () => socket.off('between_round_time', handler);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const nextQuestionHandler = () => {
      stopTimer();
      setAnswer(null);
      setIsChallenge(false)
      setIsRound(false)
      setQIndex(prev => prev + 1);
      startTimer()
    };

    const resetHandler = () => {
      stopTimer();
      setAnswer(null);
      answerRef.current = null; // <--- important!
      hasSubmittedRef.current = false;
      startTimer();
    };


    socket.on('next_question', nextQuestionHandler);
    socket.on('reset_question', resetHandler);

    return () => {
      socket.off('next_question', nextQuestionHandler);
      socket.off('reset_question', resetHandler);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const return_handler = () => {
      stopTimer();
      setAnswer(null);
      setQIndex(prev => (prev !== 0 ? prev - 1 : prev));
      setTimeLeft(20);
    };

    const stop_handler = () => {
      gameStoppedRef.current = true;
      stopTimer();
      setQIndex(null);
    };

    socket.on('return_question', return_handler);
    socket.on('stop_game', stop_handler);

    return () => {
      socket.off('return_question', return_handler);
      socket.off('stop_game', stop_handler);
    };
  }, [socket, navigation]);

  const handleAnswerSelect = (text) => {
    if (timeLeft > 0) {
      const newAnswer = {
        questionId: data[qIndex].id,
        text
      };
      setAnswer(newAnswer);
      answerRef.current = newAnswer;
    }
  };

  if (isLoading || !data) {
    return (
      <LinearGradient colors={['#00C6FF', '#FBD72B']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.pretitle}>جاري التحميل...</Text>
      </LinearGradient>
    );
  }

  if (isRound || isChallenge) {
    return (
      <LinearGradient colors={['#00C6FF', '#FBD72B']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.pretitle}> وقت التحدي</Text>
      </LinearGradient>
    );
  }

  if (qIndex >= data.length) {
    return (
      <LinearGradient colors={['#00C6FF', '#FBD72B']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.pretitle}>انتهت اللعبة</Text>
      </LinearGradient>
    );
  }

  if (qIndex === null) {
    return (
      <LinearGradient colors={['#00C6FF', '#FBD72B']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        {!name ? (
          <Text style={styles.pretitle}>جاري التحميل...</Text>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <Text style={styles.pretitle}>Hi {name}, {'\n'} Please Wait for the admin to start the game</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>🔙 back</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
    );
  }

  const currentQuestion = data[qIndex];

  return (
    <LinearGradient colors={["#00C6FF", "#FBD72B"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.name}>
        {name}
      </Text>
      <View style={styles.questionSectionTop}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{timeLeft}</Text>
        </View>

        <Text style={styles.questionNumber}>
          Question Number {qIndex !== null ? qIndex + 1 : ''}
        </Text>

      </View>

      <View style={styles.questionSectionMiddle}>
        <Text style={styles.title}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.gridContainer}>
        {currentQuestion.answers.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={item.text !== answer?.text ? styles.card : styles.selectedCard}
            onPress={() => handleAnswerSelect(item.text)}
          >
            <Text style={item.text !== answer?.text ? styles.cardText : styles.selectedCardText}>
              {item.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
  },
  questionSectionTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    marginBottom: 20,
    maxWidth: "90%",
  },
  questionSectionMiddle: {
    alignItems: "center",
    justifyContent: 'center',
    marginBottom: 20, // Keep original position
    maxWidth: "90%",
  },
  timerCircle: {
    width: 90, // Slightly adjusted for a more compact look
    height: 90, // Slightly adjusted
    borderRadius: 45, // Half of width/height for a perfect circle
    borderWidth: 3, // Slightly thinner border
    borderColor: "#e0f2f7", // Lighter, modern white-ish blue
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20, // Increased margin for separation
    backgroundColor: "#FBD72B", // A more vibrant, but not neon, blue
    shadowColor: "#1a2a40", // Darker shadow for depth
    shadowOpacity: 0.4, // Increased shadow visibility
    shadowRadius: 8, // Softer shadow blur
    shadowOffset: { width: 0, height: 4 }, // More pronounced shadow
  },
  timerText: {
    color: "#1e3a8a", // Deeper, more sophisticated blue
    fontSize: 48, // Slightly smaller, still prominent
    fontWeight: "800", // Bolder
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Black shadow with 75% opacity
    textShadowOffset: { width: 0.1, height: 0.1 }, // Offset 2 units right and down
    textShadowRadius: 1, // Blur radius of 5 units
  },
  title: {
    fontSize: 28, // Increased size for prominence
    color: "#1e3a8a", // Deep blue, matching timer text
    fontWeight: "bold",
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Black shadow with 75% opacity
    textShadowOffset: { width: 0.1, height: 0. }, // Offset 2 units right and down
    textShadowRadius: 1, // Blur radius of 5 units

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
  loading: { // Keep existing loading styles if needed elsewhere, not used in this snippet
    color: "#000",
    fontSize: 18,
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    // Adding a bit of top margin to ensure separation from question
    marginTop: 20,
  },
  card: {
    width: "46%", // Slightly increased width to fill space more
    backgroundColor: "#FBD72B", // Very light blue/white for default cards
    borderRadius: 12, // Slightly less rounded corners for a modern feel
    padding: 18, // Adjusted padding
    margin: 8, // Slightly reduced margin to fit more compactly
    borderWidth: 1,
    borderColor: "#93c5fd", // Soft blue border
    shadowColor: "#1a2a40", // Shadow for depth
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedCard: {
    width: "46%", // Keep consistent with regular card
    backgroundColor: "#1e3a8a", // Darker blue for selected card
    borderRadius: 12,
    padding: 18,
    margin: 8,
    borderWidth: 1,
    borderColor: "#93c5fd", // Consistent border color
    shadowColor: "#1a2a40",
    shadowOpacity: 0.4, // More pronounced shadow when selected
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardText: {
    color: "#1e3a8a", // Deep blue for default card text
    fontSize: 19, // Slightly larger for readability
    textAlign: "center",
    fontWeight: "600",
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Black shadow with 75% opacity
    textShadowOffset: { width: 0.1, height: 0.1 }, // Offset 2 units right and down
    textShadowRadius: 1, // Blur radius of 5 units
  },
  selectedCardText: {
    color: "#fff", // Light blue/white for selected card text
    fontSize: 19,
    textAlign: "center",
    fontWeight: "600",
  },
  questionNumber: {
    fontSize: 26, // Smaller, more refined
    fontWeight: '700', // Slightly less bold than timer
    color: '#1e3a8a', // Deep blue
    marginBottom: 0, // Removed extra margin as it's part of a flex row
    textAlign: 'center',
    backgroundColor: '#FBD72B', // Matches timer circle background
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25, // More rounded for modern pill-shape
    borderWidth: 3, // Consistent border thickness with timer
    borderColor: '#e0f2f7', // Consistent border color with timer
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Black shadow with 75% opacity
    textShadowOffset: { width: 0.1, height: 0.1 }, // Offset 2 units right and down
    textShadowRadius: 1, // Blur radius of 5 units
  },
  name: {
    fontSize: 26, // Smaller, more refined
    fontWeight: '700', // Slightly less bold than timer
    color: '#1e3a8a', // Deep blue
    marginBottom: 0, // Removed extra margin as it's part of a flex row
    textAlign: 'center',
    backgroundColor: '#FBD72B', // Matches timer circle background
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25, // More rounded for modern pill-shape
    borderWidth: 3, // Consistent border thickness with timer
    borderColor: '#e0f2f7', // Consistent border color with timer
    textShadowColor: 'rgba(0, 0, 0, 0.75)', // Black shadow with 75% opacity
    textShadowOffset: { width: 0.1, height: 0.1 }, // Offset 2 units right and down
    textShadowRadius: 1, // Blur radius of 5 units
    marginLeft: 40,
    position: "absolute",
    top: 40,
    right: 20,
  },
  backButton: {
    backgroundColor: '#ffffff50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff80',
    marginBottom: 20,
    width: 120
  },
  backButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Hacen-Samra',
  },

});

export default GameScreen;
