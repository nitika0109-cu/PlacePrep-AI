import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';
import { PageTransition } from '../components/layout/PageTransition';
import { NavProgress } from '../components/layout/NavProgress';
import { ToastProvider } from '../components/ToastProvider';
import { CommandPalette } from '../components/CommandPalette';

export const metadata: Metadata = {
  title: 'PlacePrep — AI-Powered Campus Placement Preparation Assistant',
  description: 'Prepare Smarter. Interview Better. Get Placement Ready. Practice with AI Chat, realistic AI Speech + Vision Mock Interviews, and dynamic Personalized Placement Roadmaps.',
  keywords: ['placement preparation', 'AI mock interview', 'campus placements', 'DSA roadmap', 'Azure AI', 'technical interview'],
  authors: [{ name: 'PlacePrep Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#07111F] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.15),transparent)] text-white flex flex-col selection:bg-purple-600 selection:text-white antialiased">
        <ToastProvider>
          <NavProgress />
          <CommandPalette />
          <Navbar />
          <main className="flex-1 flex flex-col">
            <PageTransition>{children}</PageTransition>
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}