
'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wrongGuesses, setWrongGuesses] = useState([]);
  const [guesses, setGuesses] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correctGuessed, setCorrectGuessed] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  useEffect(() => {
    loadNewPuzzle();
  }, []);

  async function loadNewPuzzle() {
    setLoading(true);
    setPuzzle(null);
    setWrongGuesses([]);
    setGuesses(0);
    setRevealed(false);
    setCorrectGuessed(false);
    setHintShown(false);

    const res = await fetch('/api/puzzle');
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">✈️ Flight Guesser</h1>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        <div className="flex-1 space-y-4">
          {options.map((option, idx) => {
            const label = `${option.from.trim()} → ${option.to.trim()}`;
            const isCorrect = idx === puzzle.correct_index;
            const isWrong = wrongGuesses.includes(idx);
            const isCorrectGuess = correctGuessed && isCorrect;
            const showCorrectAfterReveal = revealed && isCorrect;

            let cardClass = "bg-white border border-gray-200 rounded-xl shadow transition cursor-pointer px-6 py-6 text-lg h-24 flex items-center";
            if (isCorrectGuess || showCorrectAfterReveal) cardClass += " bg-green-100 border-green-400 text-green-700";
            else if (isWrong) cardClass += " bg-red-100 border-red-400 text-red-700";
            else if (!revealed) cardClass += " hover:bg-[#e0f7f7]";

            return <div key={idx} onClick={() => handleClick(idx)} className={cardClass}>{label}</div>;
          })}
        </div>

        <div className="w-full md:w-64 bg-white border border-gray-200 p-4 rounded-xl shadow space-y-4">
          <div>
            <div className="text-sm text-gray-500">Price</div>
            <div className="text-2xl font-bold text-teal-600">
              {Number(correctMeta.price_eur).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Flight Date</div>
            <div className="text-md text-gray-700">{correctMeta.flight_date || 'Unknown'}</div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Booking Timing</div>
            <div className="text-md text-gray-700">Ticket price {correctMeta.departure_date_distance || '?'} before departure</div>
          </div>

          <button onClick={() => setHintShown(true)} className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-xl transition">
            🎁 Get a Hint
          </button>

          {hintShown && <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 border border-yellow-300 rounded">💡 Hint: {puzzle.hint}</div>}
        </div>
      </div>

      <button onClick={loadNewPuzzle} disabled={loading} className="mt-10 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition">
        🔁 Next Puzzle
      </button>
    </main>
  );
}