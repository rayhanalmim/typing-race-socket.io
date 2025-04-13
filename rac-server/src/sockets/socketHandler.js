const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Socket.IO makes real-time apps possible.",
    "Typing fast takes practice and patience.",
    "JavaScript is the language of the web.",
];

const getRandomSentence = () => {
    return sentences[Math.floor(Math.random() * sentences.length)];
};

module.exports = function socketHandler(io) {
    let countdownStarted = false;
    let participants = [];
    let readyToStart = [];
    let progressMap = {};
    let currentSentence = "";
    let winnerDeclared = false;
    let readyStatusMap = {};

    io.on("connection", (socket) => {

        socket.on("join", (name) => {
            socket.data.name = name;
            if (!participants.includes(name)) {
                participants.push(name);
                progressMap[name] = 0;
                readyStatusMap[name] = false;
                io.emit("user-joined", participants);
                io.emit("ready-status", readyStatusMap);
            }
        });

        socket.on("request-start", (name) => {
            if (!readyToStart.includes(name)) {
                readyToStart.push(name);
                readyStatusMap[name] = true;
            }
            io.emit("ready-status", readyStatusMap);

            if (readyToStart.length === participants.length && !countdownStarted) {
                countdownStarted = true;
                io.emit("start-countdown");
            }
        });

        socket.on("cancel-start", (name) => {
            if (countdownStarted) {
                countdownStarted = false;
                io.emit("start-countdown-cancelled");
            }
            readyToStart = readyToStart.filter((n) => n !== name);
            readyStatusMap[name] = false;
            io.emit("ready-status", readyStatusMap);
        });

        socket.on("start-race", () => {
            currentSentence = getRandomSentence();
            winnerDeclared = false;
            Object.keys(progressMap).forEach((name) => {
                progressMap[name] = 0;
            });
            readyToStart = [];
            Object.keys(readyStatusMap).forEach((name) => (readyStatusMap[name] = false));
            countdownStarted = false;
            io.emit("ready-status", readyStatusMap);
            io.emit("start-typing", currentSentence);
        });

        socket.on("typing-progress", ({ name, typed }) => {
            if (!winnerDeclared) {
                progressMap[name] = typed.length;
                io.emit("update-progress", progressMap);

                if (typed === currentSentence) {
                    winnerDeclared = true;
                    io.emit("race-complete", name);
                }
            }
        });

        socket.on("disconnect", () => {
            const name = socket.data.name;
            participants = participants.filter((p) => p !== name);
            readyToStart = readyToStart.filter((n) => n !== name);
            delete progressMap[name];
            delete readyStatusMap[name];
            io.emit("user-joined", participants);
            io.emit("ready-status", readyStatusMap);
        });
    });
};









