'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { api } from '../../lib/api';
import { ScrollReveal } from '../../components/animations/ScrollReveal';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.login({ email, password });
      const redirect = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;
      router.push(redirect && redirect.startsWith('/') ? redirect : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    const demoEmail = 'student@college.edu';
    const demoPass = 'password123';
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setIsLoading(true);

    try {
      await api.login({ email: demoEmail, password: demoPass });
      const redirect = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;
      router.push(redirect && redirect.startsWith('/') ? redirect : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-black relative overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[420px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Centered Login Card */}
      <ScrollReveal className="relative w-full max-w-md bg-[#09090F]/95 border border-white/[0.1] rounded-2xl shadow-2xl shadow-purple-950/40 backdrop-blur-xl p-7 sm:p-8 overflow-hidden z-10">
        {/* Top subtle glow line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />

        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
              PlacePrep
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Login</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Sign in to continue your placement preparation &amp; mock interviews.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              College Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-white/[0.09] text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border border-white/[0.09] text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-neutral-500 hover:text-neutral-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-black border-white/[0.15] text-purple-600 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => alert('Password reset link sent to your college email.')}
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm shadow-xl shadow-purple-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick 1-Click Demo Login */}
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>1-Click Demo Student Sign In</span>
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] text-center text-xs text-neutral-400">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="text-purple-400 font-semibold hover:underline">
            Create an account
          </Link>
        </div>

      </ScrollReveal>
    </div>
  );
}
