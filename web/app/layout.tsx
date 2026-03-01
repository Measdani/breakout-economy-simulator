import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The National AI Economy Resiliency Model (NAIERM)',
  description: 'Interactive UBI + Token Tax policy explorer for AI-era economic resilience',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-deep-navy"
        style={{
          background: 'radial-gradient(ellipse 900px 500px at center, rgba(255,255,255,0.25) 0%, #2A4A7F 40%, #1E3A5F 70%, #0F172A 100%)',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}

