import type { Metadata } from 'next';
import { Space_Mono, Dancing_Script, Montserrat } from 'next/font/google';
import './globals.css';

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-dancing-script',
  display: 'swap',
});

const montserrat = Montserrat({
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Digital Bullet Journal',
    template: '%s | Digital Bullet Journal',
  },
  description: 'Track your moods, habits, and journal entries — privately.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${dancingScript.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen text-gray-900 antialiased" style={{ backgroundColor: '#252122' }} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
