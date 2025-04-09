import socket from "../../../socket/socket";

export const handleJoin = ({ name, setIsEligible }) => {
  if (name.trim()) {
    setIsEligible(true);
    socket.emit("join", name);
  }
};

export const handleStart = ({ name, startedBy, setStartedBy }) => {
  const updated = startedBy.includes(name)
    ? startedBy.filter((n) => n !== name)
    : [...startedBy, name];

  setStartedBy(updated);
  socket.emit(startedBy.includes(name) ? "cancel-start" : "request-start", name);
};

export const handleTyping = ({ e, name, typingSentence, setInputText }) => {
  const value = e.target.value;
  if (value.length > typingSentence.length) return;
  setInputText(value);
  socket.emit("typing-progress", { name, typed: value });
};

export const handlePaste = (e) => {
  e.preventDefault();
};
