'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wrongGuesses, setWrongGuesses] = useState([]);
  const [guesses, setGuesses] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correctGuessed, setCorrectGuessed] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [useLivePuzzle, setUseLivePuzzle] = useState(false);

  useEffect(() => {
    loadNewPuzzle();
  }, [useLivePuzzle]);

  async function loadNewPuzzle() {
    setLoading(true);
    setPuzzle(null);
    setWrongGuesses([]);
    setGuesses(0);
    setRevealed(false);
    setCorrectGuessed(false);
    setHintShown(false);

    const res = await fetch(useLivePuzzle ? '/api/live-puzzle' : '/api/puzzle');
    const data = await res.json();
    setPuzzle(data);
    setLoading(false);
  }

  function handleClick(index) {
    if (!puzzle || revealed || wrongGuesses.includes(index) || (index === puzzle.correct_index && correctGuessed)) return;

    const newGuessCount = guesses + 1;
    setGuesses(newGuessCount);

    if (index === puzzle.correct_index) {
      setCorrectGuessed(true);
      setRevealed(true);
    } else {
      setWrongGuesses([...wrongGuesses, index]);
      if (newGuessCount >= 3) {
        setRevealed(true);
      }
    }
  }

  if (loading) return <main className="flex min-h-screen items-center justify-center text-xl">Loading puzzle...</main>;
  if (!puzzle || !puzzle.options) return <main className="flex min-h-screen items-center justify-center text-xl text-red-600">Error loading puzzle</main>;

  const options = puzzle.options;
  const correctMeta = options[puzzle.correct_index];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 tracking-tight">✈️ Flight Guesser</h1>

      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setUseLivePuzzle(false)}
          className={`px-4 py-2 rounded-xl font-medium ${!useLivePuzzle ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          🕓 Daily
        </button>
        <button
          onClick={() => setUseLivePuzzle(true)}
          className={`px-4 py-2 rounded-xl font-medium ${useLivePuzzle ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          📡 Live
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        <div className="flex-1 space-y-4">
          {options.map((option, idx) => {
            const isCorrect = idx === puzzle.correct_index;
            const isWrong = wrongGuesses.includes(idx);
            const isCorrectGuess = correctGuessed && isCorrect;
            const showCorrectAfterReveal = revealed && isCorrect;

            let cardClass =
              "bg-white border border-gray-200 rounded-xl shadow-sm transition-all cursor-pointer px-6 py-5 flex items-center hover:scale-[1.01] hover:shadow-md duration-150";
            if (isCorrectGuess || showCorrectAfterReveal) cardClass += " bg-green-100 border-green-400 text-green-800";
            else if (isWrong) cardClass += " bg-red-100 border-red-400 text-red-700";
            else if (!revealed) cardClass += " hover:bg-[#e6fafa]";

            return (
              <div key={idx} onClick={() => handleClick(idx)} className={cardClass}>
                <div className="text-xl mr-4">🛫</div>
                <div>
                  <div className="text-sm text-gray-500">{option.from}</div>
                  <div className="text-lg font-medium">{option.to}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full md:w-72 bg-white border border-gray-200 p-5 rounded-xl shadow space-y-4">
          <div>
            <div className="text-sm text-gray-500">Price</div>
            <div className="text-3xl font-extrabold text-teal-600 tracking-tight">
              {Number(correctMeta.price_eur).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Flight Date</div>
            <div className="text-md text-gray-700">{correctMeta.flight_date || correctMeta.departureDate || 'Unknown'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Booking Timing</div>
            <div className="text-md text-gray-700">
              {useLivePuzzle
                ? '🔴 Live API data from Amadeus'
                : `Ticket price ${correctMeta.departure_date_distance || '?'} before departure`}
            </div>
          </div>

          <button
            onClick={() => setHintShown(true)}
            disabled={hintShown}
            className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            🎁 Get a Hint
          </button>

          {hintShown && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-yellow-50 text-yellow-800 border border-yellow-300 rounded text-sm"
            >
              💡 <strong>Hint:</strong> {puzzle.hint || 'This destination is ' + correctMeta.to}
            </motion.div>
          )}
        </div>
      </div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 p-4 bg-blue-50 text-blue-800 border border-blue-300 rounded-lg text-center"
        >
          ✅ The correct route was <strong>{correctMeta.from} → {correctMeta.to}</strong>
        </motion.div>
      )}

      <button
        onClick={loadNewPuzzle}
        disabled={loading}
        className="mt-8 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
      >
        🔁 Next Puzzle
      </button>
    </main>
  );
}

async function loadNewPuzzle() {
  setLoading(true);
  setPuzzle(null);
  setWrongGuesses([]);
  setGuesses(0);
  setRevealed(false);
  setCorrectGuessed(false);
  setHintShown(false);

  try {
    const res = await fetch(useLivePuzzle ? '/api/live-puzzle' : '/api/puzzle');
    const data = await res.json();

    console.log("🔍 Loaded puzzle:", data); // ← Add this

    if (!data || !data.options || !Array.isArray(data.options)) {
      throw new Error("Invalid puzzle format");
    }

    setPuzzle(data);
  } catch (err) {
    console.error("❌ Puzzle fetch failed:", err); // ← See this in DevTools console
    setPuzzle(null);
  } finally {
    setLoading(false);
  }
}
