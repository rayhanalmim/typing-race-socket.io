export default function ProgressBoard({ progress, typingSentence }) {
    return (
      <div className="mt-6 p-4 bg-black rounded-lg shadow-2xl">
        <h2 className="text-xl font-semibold text-white">Live Progress</h2>
        {Object.entries(progress).map(([user, len]) => {
          const percentage = Math.floor((len / typingSentence.length) * 100);
          return (
            <div key={user} className="mb-2">
              <p className="text-white">{user}: {percentage}%</p>
              <div className="w-full h-2 bg-gray-700 rounded">
                <div className="h-2 bg-blue-500 rounded" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  