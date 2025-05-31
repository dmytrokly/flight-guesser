import Amadeus from 'amadeus';

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
});

export async function GET() {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: 'MAD',
      destinationLocationCode: 'BER',
      departureDate: '2025-06-15',
      adults: '1',
      max: '5',
    });

    return Response.json({ flights: response.data });
  } catch (error) {
    console.error('❌ Amadeus API error:', error);
    return Response.json({ error: 'Failed to fetch offers from Amadeus' }, { status: 500 });
  }
}
