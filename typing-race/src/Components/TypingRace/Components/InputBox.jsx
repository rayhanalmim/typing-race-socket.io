export default function InputBox({ typingSentence, inputText, handleTyping, inputRef, handlePaste, disabled }) {
    return (
      <div className="mt-6 p-4 bg-black rounded-lg shadow-2xl">
        <p className="text-xl font-semibold text-white">Type this sentence:</p>
        <p className="text-gray-300 italic mb-4">{typingSentence}</p>
        <input
          type="text"
          className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-white"
          value={inputText}
          onChange={handleTyping}
          onPaste={handlePaste}
          ref={inputRef}
          disabled={disabled}
        />
      </div>
    );
  }
  