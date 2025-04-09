import { useEffect, useRef, useState } from "react";
import socket from "../../socket/socket.js";
import useSocketListeners from "./hooks/useSocketListeners.js";
import ParticipantsList from "./Components/ParticipantsList.jsx";
import Countdown from "./Components/Countdown.jsx";
import InputBox from "./Components/InputBox.jsx";
import ProgressBoard from "./Components/ProgressBoard.jsx";
import WinnerMessage from "./Components/WinnerMessage.jsx";
import JoinForm from "./Components/JoinForm.jsx";

import {
  handleJoin,
  handleStart,
  handleTyping,
  handlePaste,
} from "./Utils/raceUtils.js";

export default function TypingRace() {
  const [name, setName] = useState("");
  const [isEligible, setIsEligible] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [startedBy, setStartedBy] = useState([]);
  const [readyStatus, setReadyStatus] = useState({});
  const [countdown, setCountdown] = useState(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [typingSentence, setTypingSentence] = useState("");
  const [inputText, setInputText] = useState("");
  const [progress, setProgress] = useState({});
  const [winner, setWinner] = useState(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  const inputRef = useRef();

  useSocketListeners({
    setParticipants,
    setReadyStatus,
    setCountdown,
    setRaceStarted,
    setTypingSentence,
    setInputText,
    setWinner,
    setProgress,
    setStartedBy,
    setCelebrationVisible,
    inputRef,
  });

  useEffect(() => {
    if (participants.length > 0 && startedBy.length === participants.length) {
      socket.emit("start-countdown");
    }
  }, [startedBy, participants]);

  if (!isEligible) {
    return (
      <JoinForm
        name={name}
        setName={setName}
        handleJoin={() => handleJoin({ name, setIsEligible })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl text-center text-white mb-6">Typing Race</h1>
        <ParticipantsList participants={participants} readyStatus={readyStatus} />
        {!raceStarted && !winner && (
          <button
            onClick={() => handleStart({ name, startedBy, setStartedBy })}
            className={`w-full py-3 rounded text-white mb-4 ${
              startedBy.includes(name) ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {startedBy.includes(name) ? "Stop Race" : "Start Race"}
          </button>
        )}
        <Countdown countdown={countdown} />
        {raceStarted && typingSentence && (
          <InputBox
            typingSentence={typingSentence}
            inputText={inputText}
            handleTyping={(e) =>
              handleTyping({ e, name, typingSentence, setInputText })
            }
            inputRef={inputRef}
            handlePaste={handlePaste}
            disabled={!raceStarted || winner}
          />
        )}
        {Object.keys(progress).length > 0 && (
          <ProgressBoard progress={progress} typingSentence={typingSentence} />
        )}
        {winner && (
          <WinnerMessage
            winner={winner}
            name={name}
            celebrationVisible={celebrationVisible}
          />
        )}
      </div>
    </div>
  );
}
