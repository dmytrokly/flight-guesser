# Flight Guesser

A daily and live-flight guessing game where players match airfares to the correct flight route. Built with Next.js, Supabase, and the Amadeus Flight Offers API, designed to be interactive, responsive, and easy to extend.

## What I Learned

While building this project, I gained experience with:

- Creating a unique daily puzzle system using historical datasets in Supabase
- Integrating the Amadeus Flights API to fetch live flight prices
- Randomizing flight route options while ensuring unique prices and routes
- Handling puzzle state with React hooks and conditional UI feedback
- Building a hint system backed by AI-generated content (OpenAI)
- Using Next.js API routes for server-side puzzle generation
- Managing and querying flight data in a PostgreSQL database (Supabase)
- Designing an interactive guessing UI with correct/wrong feedback logic
- Handling multi-attempt gameplay with reveal and retry mechanics

## Features

### Public (User-Facing)

**Daily Puzzle**  
A new puzzle every day with historical flight prices.  
Three guesses allowed before revealing the correct route.  
One AI-powered hint per puzzle.

**Live Puzzle**  
Generates puzzles in real-time using live flight prices from the Amadeus API.  
Dynamically fetches flight offers with a random date for realistic challenges.

**Interactive Gameplay**  
Immediate feedback on correct or incorrect guesses.  
Hints displayed on demand.  
Tracks remaining guesses with reveal logic.

**Next Puzzle**  
Instantly generate the next puzzle with a button click.

**Flight Metadata**  
Displays flight date, booking timing (historical), and price in EUR.  
Prices are formatted for the German locale (de-DE).

### Future (Planned)

- User streaks and score tracking
- Shareable puzzle results similar to Wordle
- Leaderboards for daily and live puzzles
- Basic user accounts for personalization
- AI-assisted automatic puzzle generation


## Getting Started

Install dependencies:

npm install

Start the development server:

npm run dev

Visit: http://localhost:3000

## Tech Stack

- Next.js (App Router)
- Supabase (PostgreSQL)
- Tailwind CSS
- Amadeus Self-Service API (Flight Offers)
- OpenAI (for generating hints)

No authentication required for gameplay; daily and live puzzles are open to all users.
