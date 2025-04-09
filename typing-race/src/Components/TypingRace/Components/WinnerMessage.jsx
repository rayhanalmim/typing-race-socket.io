import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function WinnerMessage({ winner, name, celebrationVisible }) {
  const { width, height } = useWindowSize();
  return (
    <div className="mt-6 text-center text-4xl font-bold">
      {winner === name ? (
        <div className="text-green-500">
          🏁 {winner} has won the race!
          {celebrationVisible && <Confetti width={width} height={height} />}
        </div>
      ) : (
        <div className="text-red-500">
          💔 You lost the race. Better luck next time!
          <br />
          <span className="text-green-400">Winner: {winner}</span>
        </div>
      )}
    </div>
  );
}
