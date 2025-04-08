import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Confetti from 'react-confetti'; // To add firework effect
import { useWindowSize } from 'react-use';

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
    const [celebrationVisible, setCelebrationVisible] = useState(false); // Manage celebration visibility

    const inputRef = useRef();
    const { width, height } = useWindowSize(); // For confetti size

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
            setWinner(winnerName);
            setRaceStarted(false);
            setCelebrationVisible(true);
            setTimeout(() => {
                setCelebrationVisible(false);
            }, 15000);
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

    const handlePaste = (e) => {
        e.preventDefault(); // Prevent paste action
    };

    if (!isEligible) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-800">
                <div className="bg-black p-8 rounded-lg shadow-2xl w-full max-w-sm transform hover:scale-105 transition duration-300">
                    <h2 className="text-3xl font-extrabold mb-6 text-center text-gradient bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Enter Your Name
                    </h2>
                    <input
                        type="text"
                        className="w-full p-4 border-2 border-gray-600 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm hover:shadow-lg transition duration-200"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                    <button
                        className="w-full bg-gradient-to-r from-gray-600 to-gray-400 text-white p-4 rounded-md shadow-lg hover:from-gray-500 hover:to-gray-300 transform hover:scale-105 transition duration-300 ease-in-out"
                        onClick={handleJoin}
                    >
                        Join Race
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-800 p-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-6 text-center text-gradient bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                    Typing Race
                </h1>

                <div className="mb-4 p-4 bg-black rounded-lg shadow-2xl">
                    <h2 className="text-xl font-semibold mb-2 text-white">Participants (Ready Status):</h2>
                    <ul className="list-disc list-inside text-gray-300">
                        {participants.map((p, i) => (
                            <li key={i} className="text-lg">
                                {p} {readyStatus[p] ? "✔️ Ready" : "❌ Not Ready"}
                            </li>
                        ))}
                    </ul>
                </div>

                {!raceStarted && !winner && (
                    <button
                        onClick={handleStart}
                        className={`w-full py-3 rounded-md text-white text-xl ${startedBy.includes(name) ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} transition duration-300`}
                    >
                        {startedBy.includes(name) ? "Stop Race" : "Start Race"}
                    </button>
                )}

                {countdown !== null && (
                    <div className="text-center text-6xl font-bold mt-6 text-yellow-500 animate-pulse">{countdown}</div>
                )}

                {raceStarted && typingSentence && (
                    <div className="mt-6 p-4 bg-black rounded-lg shadow-2xl">
                        <p className="text-xl font-semibold mb-2 text-white">Type this sentence:</p>
                        <p className="text-gray-300 italic mb-4">{typingSentence}</p>
                        <input
                            type="text"
                            className="w-full p-3 border-2 border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white bg-gray-800"
                            value={inputText}
                            onChange={handleTyping}
                            ref={inputRef}
                            onPaste={handlePaste}
                            disabled={!raceStarted || winner}
                        />
                    </div>
                )}

                {Object.keys(progress).length > 0 && (
                    <div className="mt-6 p-4 bg-black rounded-lg shadow-2xl">
                        <h2 className="text-xl font-semibold mb-2 text-white">Live Progress</h2>
                        {Object.entries(progress).map(([user, len]) => {
                            const percentage = Math.floor((len / typingSentence.length) * 100);
                            return (
                                <div key={user} className="mb-2">
                                    <p className="font-medium text-white">{user}: {percentage}%</p>
                                    <div className="w-full h-2 bg-gray-700 rounded">
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
                    <>
                        {winner === name ? (
                            <div className="mt-6 text-center text-4xl font-bold text-green-500">
                                🏁 {winner} has won the race!
                                {celebrationVisible && <Confetti width={width} height={height} />}
                            </div>
                        ) : (
                            <div className="mt-6 text-center text-4xl font-bold text-red-500">
                                💔 You lost the race. Better luck next time!
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
