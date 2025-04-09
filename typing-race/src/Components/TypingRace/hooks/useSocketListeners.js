import { useEffect } from "react";
import socket from "../../../socket/socket";

const useSocketListeners = ({
  setParticipants,
  setReadyStatus,
  setCountdown,
  setRaceStarted,
  setTypingSentence,
  setInputText,
  setWinner,
  setProgress,
  setCelebrationVisible,
  inputRef,
}) => {
  useEffect(() => {
    socket.on("user-joined", setParticipants);
    socket.on("ready-status", setReadyStatus);

    socket.on("start-countdown", () => {
      let count = 3;
      setCountdown(count);
      const interval = setInterval(() => {
        count--;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          setCountdown(null);
          setRaceStarted(true);
          socket.emit("start-race");
        }
      }, 1000);
    });

    socket.on("start-typing", (sentence) => {
      setTypingSentence(sentence);
      setInputText("");
      setWinner(null);
      setProgress({});
      inputRef.current?.focus();
    });

    socket.on("update-progress", setProgress);

    socket.on("race-complete", (winnerName) => {
      setWinner(winnerName);
      setRaceStarted(false);
      setCelebrationVisible(true);
      setTimeout(() => setCelebrationVisible(false), 9500);
    });

    return () => {
      socket.off("user-joined");
      socket.off("ready-status");
      socket.off("start-countdown");
      socket.off("start-typing");
      socket.off("update-progress");
      socket.off("race-complete");
    };
  }, []);
};

export default useSocketListeners;
