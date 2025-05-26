'use client';

import { useState } from 'react';

export default function Home() {
  const options = [
    "New York → London",
    "Paris → Tokyo",
    "Berlin → Rome",
    "Madrid → Dubai",
    "Toronto → Lisbon",
  ];

  const correctIndex = 1; // Option 2 is correct
  const [wrongGuesses, setWrongGuesses] = useState([]);
  const [guesses, setGuesses] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correctGuessed, setCorrectGuessed] = useState(false);

  const [hintShown, setHintShown] = useState(false);
  const hintText = "This city is famous for sushi, cherry blossoms, and high-speed trains.";

  function handleClick(index) {
    if (revealed || wrongGuesses.includes(index) || (index === correctIndex && correctGuessed)) return;

    const newGuessCount = guesses + 1;
    setGuesses(newGuessCount);

    if (index === correctIndex) {
      setCorrectGuessed(true);
      setRevealed(true);
    } else {
      setWrongGuesses([...wrongGuesses, index]);
      if (newGuessCount >= 3) {
        setRevealed(true);
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">✈️ Flight Guesser</h1>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        {/* Choices Section */}
        <div className="flex-1 space-y-4">
          {options.map((text, idx) => {
            const isCorrect = idx === correctIndex;
            const isWrong = wrongGuesses.includes(idx);
            const isCorrectGuess = correctGuessed && isCorrect;
            const showCorrectAfterReveal = revealed && isCorrect;

            let cardClass =
              "bg-white border border-gray-200 rounded-xl shadow transition cursor-pointer px-6 py-6 text-lg h-24 flex items-center";

            if (isCorrectGuess || showCorrectAfterReveal) {
              cardClass += " bg-green-100 border-green-400 text-green-700";
            } else if (isWrong) {
              cardClass += " bg-red-100 border-red-400 text-red-700";
            } else if (!revealed) {
              cardClass += " hover:bg-[#e0f7f7]";
            }

            return (
              <div key={idx} onClick={() => handleClick(idx)} className={cardClass}>
                {text}
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-64 bg-white border border-gray-200 p-4 rounded-xl shadow space-y-4">
          <div>
            <div className="text-sm text-gray-500">Price</div>
            <div className="text-2xl font-bold text-teal-600">$349</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Flight Date</div>
            <div className="text-md text-gray-700">June 12, 2025</div>
          </div>

          <button
            onClick={() => setHintShown(true)}
            className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-xl transition"
          >
            🎁 Get a Hint
          </button>

          {hintShown && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 border border-yellow-300 rounded">
              💡 Hint: {hintText}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
