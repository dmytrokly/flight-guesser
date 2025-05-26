// app/layout.js or app/layout.tsx
import './globals.css'; // or wherever your global styles are

export const metadata = {
  title: 'Flight Guesser',
  description: 'Guess the flight route based on the price!',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
