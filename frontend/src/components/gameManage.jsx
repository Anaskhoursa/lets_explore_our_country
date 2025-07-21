import React, { createContext, useContext, useState } from "react";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [qIndex, setQIndex] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [liveUsers, setLiveUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [optionsVisible, setOptionsVisible] = useState(true);

  return (
    <GameContext.Provider value={{
      qIndex, setQIndex,
      userAnswers, setUserAnswers,
      liveUsers, setLiveUsers,
      onlineUserIds, setOnlineUserIds,
      isGameStarted, setIsGameStarted,
      timeLeft, setTimeLeft,
      optionsVisible, setOptionsVisible,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
