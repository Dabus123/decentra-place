import { NEXT_PUBLIC_URL } from '../config';
import OnchainProviders from '../components/OnchainProviders';
import type { Metadata } from 'next';
import { AppKit } from '../context/web3modal'
import './global.css';
import '@coinbase/onchainkit/styles.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export const metadata: Metadata = {
  title: 'ArtGridz',
  description: 'Color Pixels for free on the blockchain and earn crypto.',
  openGraph: {
    title: 'ArtGridz',
    description: 'Color Pixels for free on the blockchain and earn crypto.',
    images: [`${NEXT_PUBLIC_URL}/vibes/vibes-19.png`],
  },
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex items-center justify-center">
        <AppKit>{children}</AppKit>
      </body>
    </html>
  );
}
