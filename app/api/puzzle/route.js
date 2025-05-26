import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('german_flights')
    .select('id, departure_city, arrival_city, price_eur, departure_date')
    .limit(500); // larger pool

  if (error || !data || data.length < 5) {
    return Response.json({ error: 'Failed to load flights', details: error }, { status: 500 });
  }

  // Filter out invalid or duplicate price rows
  const cleanData = data.filter(
    (f) => f.price_eur && f.departure_city && f.arrival_city && !isNaN(parseFloat(f.price_eur))
  );

  // Shuffle
  const shuffled = cleanData.sort(() => Math.random() - 0.5);

  let selected = null;

  // Try to find one correct + 4 distractors with unique prices
  for (let i = 0; i < shuffled.length; i++) {
    const correct = shuffled[i];
    const correctPrice = parseFloat(correct.price_eur);

    const distractors = shuffled
      .filter(
        (f, j) =>
          i !== j &&
          parseFloat(f.price_eur) !== correctPrice &&
          `${f.departure_city}-${f.arrival_city}` !== `${correct.departure_city}-${correct.arrival_city}`
      )
      .filter((f, index, self) =>
        index === self.findIndex(other => parseFloat(other.price_eur) === parseFloat(f.price_eur))
      ) // ensure all distractors have unique prices
      .slice(0, 4);

    if (distractors.length === 4) {
      selected = [correct, ...distractors];
      break;
    }
  }

  if (!selected || selected.length < 5) {
    return Response.json({ error: 'Could not find 5 unique-price flights' }, { status: 500 });
  }

  // Shuffle and find correct index again
  const shuffledOptions = selected.sort(() => Math.random() - 0.5);
  const correctFlight = selected[0];
  const correctIndex = shuffledOptions.findIndex(f => f.id === correctFlight.id);

  const options = shuffledOptions.map(f => ({
    from: f.departure_city,
    to: f.arrival_city,
  }));

  const puzzle = {
    price_eur: parseFloat(correctFlight.price_eur),
    flight_date: correctFlight.departure_date,
    options,
    correct_index: correctIndex,
    hint: `This destination is ${correctFlight.arrival_city}`,
  };

  return Response.json(puzzle);
}
