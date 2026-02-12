import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Policy Flight Simulator',
  description: 'Interactive UBI + Token Tax policy explorer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-deep-navy">
        {children}
      </body>
    </html>
  );
}
