export default function JoinForm({ name, setName, handleJoin }) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-800">
        <div className="bg-black p-6 rounded-lg shadow-2xl w-full max-w-sm transform hover:scale-105 transition duration-300">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-white">Enter Your Name</h2>
          <input
            type="text"
            className="w-full p-4 border border-gray-600 rounded mb-6"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <button className="w-full bg-gray-600 text-white p-4 rounded hover:bg-gray-500" onClick={handleJoin}>
            Join Race
          </button>
        </div>
      </div>
    );
  }
  

  