import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

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

  const inputRef = useRef();

  console.log('ready status ', readyStatus);

  useEffect(() => {
    socket.on("user-joined", (updatedList) => {
      setParticipants(updatedList);
    });

    socket.on("ready-status", (statusMap) => {
      setReadyStatus(statusMap);
    });

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

    socket.on("update-progress", (updatedProgress) => {
      setProgress(updatedProgress);
    });

    socket.on("race-complete", (winnerName) => {

        console.log('race will be complete , ', winnerName);
      setWinner(winnerName);
      setRaceStarted(false);
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

  const handleJoin = () => {
    if (name.trim()) {
      setIsEligible(true);
      socket.emit("join", name);
    }
  };

  const handleStart = () => {
    if (!startedBy.includes(name)) {
      const updated = [...startedBy, name];
      setStartedBy(updated);
      socket.emit("request-start", name);
    } else {
      const updated = startedBy.filter((n) => n !== name);
      setStartedBy(updated);
      socket.emit("cancel-start", name);
    }
  };

  useEffect(() => {
    if (
      participants.length > 0 &&
      startedBy.length === participants.length
    ) {
      socket.emit("start-countdown");
    }
  }, [startedBy, participants]);

  const handleTyping = (e) => {
    const value = e.target.value;
    if (value.length > typingSentence.length) return;
    setInputText(value);
    socket.emit("typing-progress", { name, typed: value });
  };

  if (!isEligible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-center">Enter Your Name</h2>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <button
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={handleJoin}
          >
            Join Race
          </button>
        </div>
      </div>
    );
  }
  
  const handlePaste = (e) => {
    e.preventDefault(); // Prevent paste action
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Typing Race</h1>

        <div className="mb-4 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Participants (Ready Status):</h2>
          <ul className="list-disc list-inside">
            {participants.map((p, i) => (
              <li key={i}>
                {p} {readyStatus[p] ? "✔️ Ready" : "❌ Not Ready"}
              </li>
            ))}
          </ul>
        </div>

        {!raceStarted && !winner && (
          <button
            onClick={handleStart}
            className={`w-full ${
              startedBy.includes(name) ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            } text-white py-2 rounded text-lg`}
          >
            {startedBy.includes(name) ? "Stop Race" : "Start Race"}
          </button>
        )}

        {countdown !== null && (
          <div className="text-center text-4xl font-bold mt-6">{countdown}</div>
        )}

        {raceStarted && typingSentence && (
          <div className="mt-6 p-4 bg-white rounded shadow">
            <p className="text-lg font-semibold mb-2">Type this sentence:</p>
            <p className="text-gray-700 italic mb-2">{typingSentence}</p>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={inputText}
              onChange={handleTyping}
              ref={inputRef}
              onPaste={handlePaste}
              disabled={!raceStarted || winner}
            />
          </div>
        )}

        {Object.keys(progress).length > 0 && (
          <div className="mt-6 p-4 bg-white rounded shadow">
            <h2 className="text-lg font-semibold mb-2">Live Progress</h2>
            {Object.entries(progress).map(([user, len]) => {
              const percentage = Math.floor((len / typingSentence.length) * 100);
              return (
                <div key={user} className="mb-2">
                  <p className="font-medium">{user}: {percentage}%</p>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-blue-500 rounded"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {winner && (
          <div className="mt-6 text-center text-xl font-bold text-green-600">
            🏁 {winner} has won the race!
          </div>
        )}
      </div>
    </div>
  );
}
