import type {Metadata} from 'next';
import './globals.css'; // Global styles
import Navbar from '@/components/Navbar';
import { FirebaseProvider } from '@/components/FirebaseProvider';
import WhatsAppWidget from '@/components/WhatsAppWidget';

export const metadata: Metadata = {
  title: 'Pehchan Digital - Digital Business Cards',
  description: 'Create and share your professional digital business card.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-gray-100 font-sans selection:bg-blue-500/30" suppressHydrationWarning>
        <FirebaseProvider>
          <Navbar />
          {children}
          <WhatsAppWidget />
        </FirebaseProvider>
      </body>
    </html>
  );
}
