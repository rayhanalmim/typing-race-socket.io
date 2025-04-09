export default function ParticipantsList({ participants, readyStatus }) {
    return (
      <div className="mb-4 p-4 bg-black rounded-lg shadow-lg">
        <h2 className="text-xl text-white mb-2">Participants (Ready Status):</h2>
        <ul className="text-gray-300">
          {participants.map((p, i) => (
            <li key={i}>{p} {readyStatus[p] ? "✔️ Ready" : "❌ Not Ready"}</li>
          ))}
        </ul>
      </div>
    );
  }
  