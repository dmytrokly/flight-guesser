import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase
    .from('german_flights')
    .select('id, departure_city, arrival_city, price_eur, departure_date, departure_date_distance')
    .limit(1000);

  if (error || !data || data.length < 5) {
    return Response.json({ error: 'Failed to load flights', details: error }, { status: 500 });
  }

  const cleanData = data
    .filter(f =>
      f.departure_city &&
      f.arrival_city &&
      f.price_eur &&
      f.departure_date &&
      f.departure_date_distance &&
      !isNaN(parseFloat(f.price_eur))
    )
    .sort(() => Math.random() - 0.5);

  let selected = null;

  for (let i = 0; i < cleanData.length; i++) {
    const correct = cleanData[i];
    const correctPrice = parseFloat(correct.price_eur);
    const correctRoute = `${correct.departure_city.trim().toLowerCase()}-${correct.arrival_city.trim().toLowerCase()}`;

    const distractors = cleanData
  .filter((f, j) => {
    if (i === j) return false;

    const price = parseFloat(f.price_eur);
    const route = `${f.departure_city.trim().toLowerCase()}-${f.arrival_city.trim().toLowerCase()}`;
    const correctRoute = `${correct.departure_city.trim().toLowerCase()}-${correct.arrival_city.trim().toLowerCase()}`;

    return price !== correctPrice && route !== correctRoute;
  })
  .filter((f, index, self) => {
    const comboKey = `${f.departure_city.trim().toLowerCase()}-${f.arrival_city.trim().toLowerCase()}-${f.departure_date}`;
    return index === self.findIndex(other =>
      `${other.departure_city.trim().toLowerCase()}-${other.arrival_city.trim().toLowerCase()}-${other.departure_date}` === comboKey
    );
  })
  .slice(0, 4);


    if (distractors.length === 4) {
      selected = [correct, ...distractors];
      break;
    }
  }

  if (!selected || selected.length < 5) {
    return Response.json({ error: 'Could not find a unique puzzle' }, { status: 500 });
  }

  const shuffledOptions = selected.sort(() => Math.random() - 0.5);
  const correctFlight = selected[0];
  const correctIndex = shuffledOptions.findIndex(f => f.id === correctFlight.id);

  const options = shuffledOptions.map(f => ({
    from: f.departure_city,
    to: f.arrival_city,
    price_eur: parseFloat(f.price_eur),
    flight_date: f.departure_date,
    departure_date_distance: f.departure_date_distance,
  }));

  const puzzle = {
    price_eur: parseFloat(correctFlight.price_eur),
    correct_index: correctIndex,
    options,
    hint: `This destination is ${correctFlight.arrival_city}`,
  };
  console.log('Selected puzzle options:');
console.log(JSON.stringify(options, null, 2));

  return Response.json(puzzle);
}
