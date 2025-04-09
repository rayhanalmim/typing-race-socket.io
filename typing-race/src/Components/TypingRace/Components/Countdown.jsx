export default function Countdown({ countdown }) {
    return (
      countdown !== null && (
        <div className="text-center text-6xl font-bold mt-6 text-yellow-500 animate-pulse">
          {countdown}
        </div>
      )
    );
  }
  