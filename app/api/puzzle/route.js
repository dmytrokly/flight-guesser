import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  const { data, error } = await supabase.rpc('get_random_flights', { count: 100 });

  if (error || !data || data.length < 5) {
    console.error('Supabase error:', error);
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

  const correctFlight = selected[0];
  const shuffledOptions = [...selected].sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.findIndex(f => f.id === correctFlight.id);

  const options = shuffledOptions.map(f => ({
    id: f.id,
    from: f.departure_city,
    to: f.arrival_city,
    price_eur: parseFloat(f.price_eur),
    flight_date: f.departure_date,
    departure_date_distance: f.departure_date_distance,
  }));

  // 🧠 Generate smart hint
  const arrivalCityRaw = correctFlight.arrival_city || '';
  const arrivalParts = arrivalCityRaw.trim().split(' ');
  const arrivalCode = arrivalParts[0];
  const arrivalName = arrivalParts.slice(1).join(' ') || arrivalCityRaw;

  let smartHint = `This destination is ${arrivalName}`;

  try {
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that creates short, clever hints for travel destinations based on airport or city names.',
          },
          {
            role: 'user',
            content: `Generate a 1-sentence fun or clever hint for a city called "${arrivalName}" (IATA code: ${arrivalCode}). Make it indirect or geographic.`,
          },
        ],
        temperature: 0.80,
      }),
    });

    const gptData = await gptResponse.json();

    console.log('GPT API response:', JSON.stringify(gptData, null, 2));

    const gptHint = gptData.choices?.[0]?.message?.content;
    if (gptHint) smartHint = gptHint.trim();
    else console.warn('GPT response missing content');
  } catch (err) {
    console.error('GPT Hint Error:', err);
  }

  return Response.json({
    correct_index: correctIndex,
    options,
    hint: smartHint,

  });
}

