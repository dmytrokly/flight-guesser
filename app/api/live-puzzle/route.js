import Amadeus from 'amadeus';

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

const DESTINATIONS = ['BER', 'FRA', 'LIS', 'AMS', 'CDG'];

export async function GET() {
  try {
    const flightPromises = DESTINATIONS.map(async (destination) => {
      try {
        const response = await amadeus.shopping.flightOffersSearch.get({
          originLocationCode: 'MAD',
          destinationLocationCode: destination,
          departureDate: '2025-06-15',
          adults: '1',
          currencyCode: 'EUR',
          max: '1',
        });

        const offer = response.data?.[0];
        const segment = offer?.itineraries?.[0]?.segments?.[0];

        if (!offer || !segment || !offer.price?.total) return null;

        return {
          from: segment.departure.iataCode,
          to: segment.arrival.iataCode,
          departureDate: segment.departure.at.split('T')[0],
          price_eur: parseFloat(offer.price.total),
        };
      } catch (err) {
        console.warn(`Skipping ${destination} due to error:`, err?.description || err.message);
        return null;
      }
    });

    const resolved = await Promise.all(flightPromises);
    const results = resolved.filter(Boolean);

    if (results.length < 5) {
      return Response.json({ error: 'Could not gather enough flights' }, { status: 500 });
    }

    const correctIndex = Math.floor(Math.random() * results.length);
    const correctFlight = results[correctIndex];

    return Response.json({
      correct_index: correctIndex,
      price_eur: correctFlight.price_eur,
      options: results,
      flight_date: correctFlight.departureDate,
    });
  } catch (error) {
    console.error('❌ Live puzzle error:', JSON.stringify(error, null, 2));
    return Response.json(
      { error: error?.description || error?.message || 'Failed to generate live puzzle' },
      { status: 500 }
    );
  }
}
