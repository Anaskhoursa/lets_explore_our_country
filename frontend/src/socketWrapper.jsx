import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

const SocketWrapper = ({ userId, children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null); 

  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      withCredentials: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket); 

    newSocket.on("connect", () => {
      console.log("Connected to socket:", newSocket.id);
      if (userId) {
        newSocket.emit("register_user", userId);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket");
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketWrapper;
