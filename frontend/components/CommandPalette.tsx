'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  Video,
  Map,
  User,
  LogIn,
  UserPlus,
  Home,
} from 'lucide-react';

interface CommandItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  keywords: string;
}

const ITEMS: CommandItem[] = [
  { label: 'Home', href: '/', icon: <Home className="w-4 h-4" />, keywords: 'home landing' },
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, keywords: 'dashboard overview' },
  { label: 'AI Placement Chatbot', href: '/chat', icon: <MessageSquare className="w-4 h-4" />, keywords: 'chat ai chatbot dsa questions' },
  { label: 'Mock Interview Studio', href: '/interview', icon: <Video className="w-4 h-4" />, keywords: 'interview mock practice video' },
  { label: 'Placement Roadmap', href: '/roadmap', icon: <Map className="w-4 h-4" />, keywords: 'roadmap plan schedule' },
  { label: 'Profile', href: '/profile', icon: <User className="w-4 h-4" />, keywords: 'profile account settings' },
  { label: 'Sign In', href: '/login', icon: <LogIn className="w-4 h-4" />, keywords: 'login signin' },
  { label: 'Sign Up', href: '/signup', icon: <UserPlus className="w-4 h-4" />, keywords: 'signup register create account' },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.keywords.includes(q)
    );
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) navigate(filtered[activeIndex].href);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[300] flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0B0B0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/[0.08]">
              <Search className="w-4 h-4 text-neutral-500 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyNav}
                placeholder="Jump to a page..."
                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
              <kbd className="text-[10px] text-neutral-500 border border-white/10 rounded px-1.5 py-0.5">Esc</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-6">No matches found.</p>
              ) : (
                filtered.map((item, idx) => (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${
                      idx === activeIndex
                        ? 'bg-purple-500/15 text-white'
                        : 'text-neutral-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={idx === activeIndex ? 'text-purple-400' : 'text-neutral-500'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}