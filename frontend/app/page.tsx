'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import {
  MessageSquare,
  Video,
  Map,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Calendar,
  Search,
  ChevronDown,
  Download,
  TrendingUp,
  User
} from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { AnimatedSection } from '../components/AnimatedSection';
import { ScrollReveal } from '../components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '../components/animations/StaggerContainer';
import { authStorage } from '../lib/api';

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState <
    'overview' | 'analytics' | 'reports' | 'notifications'
  >('overview');

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!authStorage.getToken());
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-[#07111F] text-white selection:bg-purple-600 selection:text-white">

      {/* ========================================================= */}
      {/* HERO SECTION WITH AMBIENT PURPLE GLOW */}
      {/* ========================================================= */}

      <section className="relative overflow-hidden pt-16 pb-24 md:pt-28 md:pb-36 bg-[#07111F] border-b border-white/[0.06]">

        <div className="ambient-purple-glow" />

        <div className="absolute top-12 right-0 w-[580px] h-[580px] bg-purple-600/30 blur-[130px] rounded-full pointer-events-none -z-0" />

        <div className="absolute top-44 right-1/4 w-[420px] h-[420px] bg-fuchsia-600/20 blur-[140px] rounded-full pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          {/* Announcement */}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.5, ease: EASE }}
          >
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8 hover:border-purple-500/40 transition-all cursor-pointer group shadow-sm"
            >
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                new
              </span>

              <span className="text-xs text-neutral-300 group-hover:text-white transition-colors flex items-center gap-1 font-medium">
                Checkout our new placement modules &gt;
              </span>
            </Link>
          </motion.div>

          {/* Hero Heading */}

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
            className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08] text-balance"
          >
            AI Assistant That <br />
            Prepares.
          </motion.h1>

          {/* Subtitle */}

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.5, delay: 0.16, ease: EASE }}
            className="mt-6 text-base sm:text-lg text-neutral-400 max-w-xl mx-auto font-normal leading-relaxed"
          >
            The all-in-one AI platform for technical interviews, real-time speech & vision telemetry, and personalized campus placement roadmaps.
          </motion.p>

          {/* ========================================================= */}
          {/* HERO CTA */}
          {/* ========================================================= */}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ duration: 0.5, delay: 0.24, ease: EASE }}
            className="mt-9 flex items-center justify-center gap-3.5"
          >

            <Link
              href={isLoggedIn ? '/dashboard' : '/signup'}
              className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-neutral-200 transition-all text-sm shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
            </Link>

            <a
              href="#features"
              className="bg-neutral-900/90 border border-neutral-800 text-neutral-200 hover:text-white font-medium px-6 py-2.5 rounded-lg hover:bg-neutral-800 hover:border-neutral-700 transition-all text-sm"
            >
              Explore Features
            </a>

          </motion.div>

          {/* ========================================================= */}
          {/* FLOATING DASHBOARD MOCKUP */}
          {/* ========================================================= */}

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
            className="mt-16 sm:mt-24 max-w-5xl mx-auto rounded-2xl border border-white/10 bg-[#060608]/95 p-3.5 sm:p-5 shadow-2xl shadow-purple-950/25 backdrop-blur-2xl relative overflow-hidden text-left"
          >

            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">

              {/* Row 1 */}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">

                <div className="flex items-center gap-2">

                  <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-medium text-neutral-200 hover:bg-white/[0.07] transition cursor-pointer">

                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
                      P
                    </div>

                    <span>Placement Candidate</span>

                    <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />

                  </div>

                </div>

                <div className="hidden md:flex items-center gap-6 text-xs text-neutral-400 font-medium">

                  <span className="text-white font-semibold cursor-pointer">
                    Overview
                  </span>

                  <Link
                    href="/interview"
                    className="hover:text-white transition cursor-pointer"
                  >
                    Interviews
                  </Link>

                  <Link
                    href="/roadmap"
                    className="hover:text-white transition cursor-pointer"
                  >
                    Roadmap
                  </Link>

                  <Link
                    href="/chat"
                    className="hover:text-white transition cursor-pointer"
                  >
                    AI Chat
                  </Link>

                  <Link
                    href="/profile"
                    className="hover:text-white transition cursor-pointer"
                  >
                    Profile
                  </Link>

                </div>

                <div className="flex items-center gap-2.5">

                  <div className="relative hidden sm:block">

                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />

                    <input
                      type="text"
                      placeholder="Search..."
                      readOnly
                      className="bg-white/[0.04] border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-neutral-300 placeholder-neutral-500 focus:outline-none w-44"
                    />

                  </div>

                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer">
                    <User className="w-3.5 h-3.5" />
                  </div>

                </div>

              </div>

              {/* Row 2 */}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Dashboard
                  </h2>
                </div>

                <div className="flex items-center gap-2.5">

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-neutral-300">

                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />

                    <span>Jan 20, 2026 - Feb 09, 2026</span>

                  </div>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 bg-white text-black font-semibold text-xs px-3.5 py-1.5 rounded-lg hover:bg-neutral-200 transition shadow-sm"
                  >
                    <Download className="w-3 h-3 text-black" />
                    <span>Download</span>
                  </Link>

                </div>

              </div>

              {/* Row 3 */}

              <div className="flex items-center gap-1.5 pt-1">

                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Overview
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Analytics
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'reports'
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Reports
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-white/10 text-white border border-white/10'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  Notifications
                </button>

              </div>

              {/* Row 4 */}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">

                <div className="bg-[#0D0D12] border border-white/[0.07] p-3.5 rounded-xl">
                  <div className="text-[11px] font-medium text-neutral-400">
                    Readiness Score
                  </div>

                  <div className="text-xl font-bold text-white mt-1">
                    86.4%
                  </div>

                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3 h-3" />
                    +4.2% this week
                  </div>
                </div>

                <div className="bg-[#0D0D12] border border-white/[0.07] p-3.5 rounded-xl">

                  <div className="text-[11px] font-medium text-neutral-400">
                    Mock Interviews
                  </div>

                  <div className="text-xl font-bold text-white mt-1">
                    12 / 15
                  </div>

                  <div className="text-[10px] text-purple-400 mt-1 font-medium">
                    Speech & Vision active
                  </div>

                </div>

                <div className="bg-[#0D0D12] border border-white/[0.07] p-3.5 rounded-xl">

                  <div className="text-[11px] font-medium text-neutral-400">
                    DSA Questions
                  </div>

                  <div className="text-xl font-bold text-white mt-1">
                    148 Solved
                  </div>

                  <div className="text-[10px] text-neutral-400 mt-1">
                    38 Hard &bull; 82 Medium
                  </div>

                </div>

                <div className="bg-[#0D0D12] border border-white/[0.07] p-3.5 rounded-xl">

                  <div className="text-[11px] font-medium text-neutral-400">
                    Roadmap Sprint
                  </div>

                  <div className="text-xl font-bold text-white mt-1">
                    Day 22 / 60
                  </div>

                  <div className="text-[10px] text-brand-cyan mt-1 font-medium">
                    On track for placements
                  </div>

                </div>

              </div>

              {/* Row 5 */}

              <div className="bg-[#09090E] border border-white/[0.07] p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Video className="w-4 h-4" />
                  </div>

                  <div>

                    <div className="text-xs font-semibold text-white flex items-center gap-2">

                      Recent Mock: Full Stack Engineer Simulation

                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Score 88/100
                      </span>

                    </div>

                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Speech Clarity: 92% &bull; Technical Depth: 85% &bull; Interaction Telemetry: Stable
                    </div>

                  </div>

                </div>

                <Link
                  href="/interview"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition"
                >
                  <span>Launch New Interview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 3 CORE PILLARS / MODULES SECTION */}
      {/* ========================================================= */}

      <AnimatedSection
        className="py-24 bg-[#07111F] relative border-b border-white/[0.06]"
      >
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-16">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-purple-300 mb-3">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Full Preparation Suite</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Everything You Need To Get Hired
            </h2>

            <p className="mt-4 text-neutral-400 text-sm sm:text-base leading-relaxed">
              Engineered strictly around the three core pillars of modern technical campus placements.
            </p>

          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature 1 */}

            <StaggerItem className="card-elevated p-7 flex flex-col justify-between group">

              <div>

                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  1. AI Placement Chatbot
                </h3>

                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Get instant, placement-focused answers powered by AI and grounded in curated placement resources.
                </p>

                <div className="space-y-2 mb-8 text-xs text-neutral-400">

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>RAG knowledge grounding & citations</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>DSA, DBMS, OOP & System Design</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Complexity & code analysis</span>
                  </div>

                </div>

              </div>

              <Link
                href="/chat"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold border border-white/10 transition-colors"
              >
                <span>Try AI Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

            </StaggerItem>

            {/* Feature 2 */}

            <StaggerItem className="card-elevated p-7 flex flex-col justify-between relative group border-purple-500/30">

              <div className="absolute -top-2.5 right-5 bg-gradient-to-r from-purple-500 to-pink-500 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full shadow">
                Voice + Vision
              </div>

              <div>

                <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-5 group-hover:scale-105 transition-transform">
                  <Video className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  2. AI Mock Interview
                </h3>

                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Practice realistic technical interviews using AI Speech and AI Vision with instant feedback.
                </p>

                <div className="space-y-2 mb-8 text-xs text-neutral-400">

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Real-time voice speech transcription</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Defensible visual interaction signals</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Technical & relevance score breakdown</span>
                  </div>

                </div>

              </div>

              <Link
                href="/interview"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs sm:text-sm font-semibold shadow-md transition-all"
              >
                <span>Start Interview</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </Link>

            </StaggerItem>

            {/* Feature 3 */}

            <StaggerItem className="card-elevated p-7 flex flex-col justify-between group">

              <div>

                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition-transform">
                  <Map className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  3. Personalized Roadmap
                </h3>

                <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
                  Generate a preparation plan based on your target role, current level, available time, and goals.
                </p>

                <div className="space-y-2 mb-8 text-xs text-neutral-400">

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Custom 30, 45, 60, or 90 day schedule</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Day-by-day task checklist</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Live dynamic progress tracking</span>
                  </div>

                </div>

              </div>

              <Link
                href="/roadmap"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold border border-white/10 transition-colors"
              >
                <span>Build My Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

            </StaggerItem>

          </StaggerContainer>

        </div>
      </AnimatedSection>

      {/* ========================================================= */}
      {/* 4-STEP METHODOLOGY SECTION */}
      {/* ========================================================= */}

      <AnimatedSection className="py-24 bg-[#07111F] relative border-b border-white/[0.06]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-16">

            <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">
              Structured Methodology
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How PlacePrep Works
            </h2>

            <p className="mt-3 text-neutral-400 text-sm">
              From your current skill baseline to placement-day readiness in four clear steps.
            </p>

          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {[
              { num: '01', title: 'Tell us your goal', desc: 'Select your target placement role, current skill baseline, and daily study hours.' },
              { num: '02', title: 'Practice with AI', desc: 'Clear conceptual doubts via grounded Chatbot and simulate live voice/video interviews.' },
              { num: '03', title: 'Follow your roadmap', desc: 'Track daily milestones, complete focused problem sets, and log your progress.' },
              { num: '04', title: 'Improve continuously', desc: 'Review question-by-question technical evaluations and strengthen targeted weak spots.' },
            ].map((step, i) => (
              <StaggerItem key={step.num} className="card-surface p-6 relative">
                <div className="text-3xl font-black text-purple-500/40 mb-3 font-mono">
                  {step.num}
                </div>

                <h4 className="text-base font-bold text-white mb-2">
                  {step.title}
                </h4>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {step.desc}
                </p>
              </StaggerItem>
            ))}

          </StaggerContainer>

        </div>

      </AnimatedSection>

      {/* ========================================================= */}
      {/* AI PRACTICE MODULES */}
      {/* ========================================================= */}

      <AnimatedSection className="py-24 bg-[#07111F] relative border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6">
          <ScrollReveal className="card-elevated p-7 sm:p-9 relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Mock Interview Studio</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Practice the pressure before it counts.</h2>
              <p className="mt-4 text-sm text-neutral-400 leading-relaxed max-w-lg">Run realistic voice and vision simulations, then turn every answer into a sharper next attempt.</p>
              <Link href="/interview" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-purple-300 transition-colors">
                Enter Mock Interview Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="card-elevated p-7 sm:p-9 relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-3">Adaptive Roadmap</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">A clear next step, every day.</h2>
              <p className="mt-4 text-sm text-neutral-400 leading-relaxed max-w-lg">Translate your role, level, and available time into a focused preparation plan that keeps moving with you.</p>
              <Link href="/roadmap" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-cyan-300 transition-colors">
                Build Your Roadmap <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </AnimatedSection>

      {/* ========================================================= */}
      {/* FINAL CTA */}
      {/* ========================================================= */}

      <AnimatedSection className="py-24 bg-[#07111F] relative overflow-hidden">

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-purple-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Ace Your Campus Placements?
          </h2>

          <p className="mt-4 text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
            Join students using PlacePrep to practice live interviews, solve coding doubts, and execute personalized preparation roadmaps.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">

            <Link
              href={isLoggedIn ? '/dashboard' : '/signup'}
              className="bg-white text-black font-semibold px-7 py-3 rounded-lg hover:bg-neutral-200 transition-all text-sm shadow-lg hover:scale-[1.02]"
            >
              {isLoggedIn ? 'Go to Dashboard' : 'Get Started Now'}
            </Link>

            <Link
              href="/dashboard"
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 hover:text-white font-medium px-7 py-3 rounded-lg hover:bg-neutral-800 transition-all text-sm"
            >
              Go to Dashboard
            </Link>

          </div>

        </div>

      </AnimatedSection>

      {/* FOOTER */}

      <Footer />

    </div>
  );
}