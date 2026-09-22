'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  MessageSquare,
  Video,
  Map,
  ArrowRight,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Layers,
  Sparkles,
  ChevronRight,
  Cloud,
  RefreshCw,
  Trophy,
  Award,
  BookOpen
} from 'lucide-react';
import { authStorage, api } from '../../lib/api';
import { InterviewFinishResponse, RoadmapGenerateResponse } from '../../types';
import { ScrollReveal } from '../../components/animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '../../components/animations/StaggerContainer';

export default function DashboardPage() {
  const [studentName, setStudentName] = useState('Student');
  const [azureStatus, setAzureStatus] = useState<any>(null);
  const [isRefreshingAzure, setIsRefreshingAzure] = useState(false);

  const loadAzureStatus = async () => {
    try {
      setIsRefreshingAzure(true);
      const data = await api.getAzureDiagnostics();
      setAzureStatus(data);
    } catch {
      // ignore
    } finally {
      setIsRefreshingAzure(false);
    }
  };

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapGenerateResponse | null>(null);
  const [recentInterviews, setRecentInterviews] = useState<InterviewFinishResponse[]>([]);

  useEffect(() => {
    const user = authStorage.getUser();
    if (user) {
      setCurrentUser(user);
      if (user.name) setStudentName(user.name.split(' ')[0]);
    }
    api.getMe().then(res => {
      if (res.user) {
        setCurrentUser(res.user);
        if (res.user.name) setStudentName(res.user.name.split(' ')[0]);
      }
    }).catch(() => {});

    // Check sessionStorage first for active roadmap
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('active_placement_roadmap');
      if (stored) {
        try {
          setActiveRoadmap(JSON.parse(stored));
        } catch {}
      }
    }

    // If authenticated, fetch latest saved roadmap and interview history from backend
    const token = authStorage.getToken();
    if (token) {
      api.getLatestRoadmap().then(res => {
        if (res.roadmap) {
          setActiveRoadmap(res.roadmap);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('active_placement_roadmap', JSON.stringify(res.roadmap));
          }
        }
      }).catch(() => {});

      api.getInterviewHistory().then(res => {
        if (res.interviews) {
          setRecentInterviews(res.interviews);
        }
      }).catch(() => {});
    }

    loadAzureStatus();
  }, []);

  // Dynamically map today's focus items from active roadmap if present
  const todayFocusItems = (activeRoadmap?.weeks?.[0]?.days?.[0]?.tasks && activeRoadmap.weeks[0].days[0].tasks.length > 0)
    ? activeRoadmap.weeks[0].days[0].tasks.slice(0, 3).map((task, idx) => ({
        subject: task.topic || activeRoadmap.targetRole || 'Core Tech',
        topic: task.title,
        detail: `Day 1 milestone for ${activeRoadmap.targetRole} placement readiness`,
        duration: `${task.estimatedMinutes || 30} mins`,
        completed: task.status === 'completed',
        icon: idx === 0 ? Code2 : idx === 1 ? Layers : Database,
        color: idx === 0 ? 'text-purple-400' : idx === 1 ? 'text-cyan-400' : 'text-amber-400'
      }))
    : [
        {
          subject: 'DSA',
          topic: 'Arrays & Two Pointers',
          detail: 'Solve key foundational problems: Maximum Subarray, 2Sum, and Two Pointers',
          duration: '45 mins',
          completed: false,
          icon: Code2,
          color: 'text-purple-400'
        },
        {
          subject: 'OOP',
          topic: 'Inheritance & Polymorphism',
          detail: 'Review virtual methods, dynamic dispatch, and interface vs abstract class',
          duration: '30 mins',
          completed: false,
          icon: Layers,
          color: 'text-cyan-400'
        },
        {
          subject: 'SQL',
          topic: 'Joins & Aggregation Queries',
          detail: 'Practice writing queries with INNER, LEFT, and aggregate GROUP BY filters',
          duration: '30 mins',
          completed: false,
          icon: Database,
          color: 'text-amber-400'
        }
      ];

  const targetRoleDisplay = currentUser?.targetRole || activeRoadmap?.targetRole || 'Software Developer';
  const readinessScore =
    (currentUser?.interviewsCompleted === 0 && (!activeRoadmap || activeRoadmap.progressPercentage === 0))
      ? 0
      : (currentUser?.preparationProgress ?? (activeRoadmap?.progressPercentage || (recentInterviews[0]?.overallScore ? Math.round(recentInterviews[0].overallScore * 0.9) : 0)));
  const interviewsCount = recentInterviews.length || currentUser?.interviewsCompleted || 0;

  return (
    <div className="flex-1 flex bg-black min-h-[calc(100vh-4rem)] relative">
      {/* Subtle ambient purple glow */}
      <div className="ambient-purple-glow" />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Dashboard Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto relative z-10">
        {/* Header Greeting */}
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Good morning, {studentName}
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Let&apos;s make progress toward your {targetRoleDisplay} placement goal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Campus Hiring Sprint 2026</span>
            </span>
            <Link
              href="/interview"
              className="bg-white text-black font-semibold text-xs px-4 py-2 rounded-lg hover:bg-neutral-200 transition shadow-sm inline-flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-black" />
              <span>New Mock Session</span>
            </Link>
          </div>
        </ScrollReveal>

        {/* Hero / Summary Card: Your Placement Journey */}
        <ScrollReveal className="card-surface p-6 sm:p-8 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl relative overflow-hidden shadow-xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Overview
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                  Your Placement Journey
                </h2>
              </div>
              <span className="text-xs text-neutral-300 bg-black/60 px-3.5 py-1.5 rounded-full border border-white/10">
                {activeRoadmap ? `Placement Window: Day 1 of ${activeRoadmap.durationDays} (${activeRoadmap.targetRole})` : 'Placement Sprint: Active'}
              </span>
            </div>

            {/* Metrics Grid */}
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <StaggerItem className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Readiness Score</span>
                <p className="text-2xl font-bold text-white mt-1">{readinessScore}%</p>
                <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3 h-3" /> Real-time tracking
                </span>
              </StaggerItem>

              <StaggerItem className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Mock Interviews</span>
                <p className="text-2xl font-bold text-white mt-1">{interviewsCount} Completed</p>
                <span className="text-[11px] text-purple-400 mt-1 font-medium block truncate">
                  {recentInterviews[0] ? `Last score: ${recentInterviews[0].overallScore}%` : 'Speech & Vision active'}
                </span>
              </StaggerItem>

              <StaggerItem className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Target Role</span>
                <p className="text-lg sm:text-xl font-bold text-white mt-1 truncate" title={targetRoleDisplay}>
                  {targetRoleDisplay}
                </p>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  {activeRoadmap ? `${activeRoadmap.durationDays}-Day Prep Plan` : 'Placement Curriculum'}
                </span>
              </StaggerItem>

              <StaggerItem className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl">
                <span className="text-xs text-neutral-400 font-medium">Daily Streak</span>
                <p className="text-2xl font-bold text-white mt-1">{currentUser?.dailyStreak ?? 1} Days</p>
                <span className="text-[11px] text-cyan-400 mt-1 font-medium block">
                  Consistent preparation
                </span>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </ScrollReveal>

        {/* RECENT MOCK INTERVIEW ACTIVITY SECTION */}
        <div className="card-surface p-6 space-y-4 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Recent Mock Interview Performance</h3>
                {recentInterviews.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {recentInterviews.length} Recorded
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                Track your AI Speech, Vision, and Technical evaluation history.
              </p>
            </div>
            <Link
              href="/interview"
              className="text-xs text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-purple-400" />
              <span>Start New Interview</span>
            </Link>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="space-y-3 pt-2">
              {/* Featured Latest Interview Result Card */}
              {(() => {
                const latest = recentInterviews[0];
                const scoreColor = latest.overallScore >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : latest.overallScore >= 60 ? 'text-purple-300 bg-purple-500/10 border-purple-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

                return (
                  <div className="p-4 sm:p-5 rounded-xl bg-[#0E0E14] border border-white/[0.07] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${scoreColor}`}>
                        <span className="text-xl font-extrabold leading-none">{latest.overallScore}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Score</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{latest.role}</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300">
                            {latest.difficulty}
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {new Date(latest.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 pt-0.5">
                          <span>Technical: <strong className="text-neutral-200">{latest.technical}%</strong></span>
                          <span>&bull;</span>
                          <span>Relevance: <strong className="text-neutral-200">{latest.relevance}%</strong></span>
                          <span>&bull;</span>
                          <span>Communication: <strong className="text-neutral-200">{latest.communication}%</strong></span>
                        </div>
                        {latest.strengths && latest.strengths.length > 0 && (
                          <p className="text-[11px] text-neutral-400 line-clamp-1 italic pt-0.5">
                            Strength: &ldquo;{latest.strengths[0]}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/interview/result?sessionId=${latest.sessionId}`}
                      className="w-full md:w-auto px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-colors text-center inline-flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <span>View Full Evaluation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })()}

              {/* Previous interviews list if more than 1 */}
              {recentInterviews.length > 1 && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 px-1">
                    Previous Sessions
                  </div>
                  <div className="divide-y divide-white/[0.05] rounded-xl bg-[#0B0B10] border border-white/[0.06] overflow-hidden">
                    {recentInterviews.slice(1, 4).map((item) => (
                      <div key={item.sessionId} className="p-3 sm:px-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${item.overallScore >= 75 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-purple-300 bg-purple-500/10 border-purple-500/20'}`}>
                            {item.overallScore}%
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-white">{item.role}</span>
                            <span className="text-[11px] text-neutral-400 ml-2">({item.difficulty})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-neutral-400 hidden sm:inline">
                            {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <Link
                            href={`/interview/result?sessionId=${item.sessionId}`}
                            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                          >
                            Review &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#0E0E14] border border-white/[0.06] text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">No Mock Interviews Completed Yet</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                  Practice with Azure Speech &amp; Vision AI to get real-time feedback on technical accuracy, body language, and communication.
                </p>
              </div>
              <Link
                href="/interview"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-sm"
              >
                <Video className="w-3.5 h-3.5 text-black" />
                <span>Start Your First Interview</span>
              </Link>
            </div>
          )}
        </div>

        {/* AZURE AI CLOUD INTEGRATION STATUS */}
        <div className="bg-[#09090E]/90 border border-white/[0.08] p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Microsoft Azure AI Integration</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      azureStatus?.overallMode?.includes('Azure Production')
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {azureStatus?.overallMode || 'Checking mode...'}
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Keys managed in <code className="text-purple-300 font-mono">backend/.env</code>
                </p>
              </div>
            </div>

            <button
              onClick={loadAzureStatus}
              disabled={isRefreshingAzure}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-neutral-300 hover:text-white flex items-center gap-1.5 self-start sm:self-auto transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingAzure ? 'animate-spin' : ''}`} />
              <span>{isRefreshingAzure ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            <div className="bg-[#0E0E14] border border-white/[0.06] p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Azure OpenAI</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    azureStatus?.services?.azureOpenAI?.status === 'connected'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block truncate">
                {azureStatus?.services?.azureOpenAI?.status === 'connected'
                  ? `Active (${azureStatus?.services?.azureOpenAI?.deployment})`
                  : 'Mock Mode Active'}
              </span>
            </div>

            <div className="bg-[#0E0E14] border border-white/[0.06] p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Azure AI Search</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    azureStatus?.services?.azureSearch?.status === 'connected'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block truncate">
                {azureStatus?.services?.azureSearch?.status === 'connected'
                  ? 'Index Connected'
                  : 'Local KB Grounding'}
              </span>
            </div>

            <div className="bg-[#0E0E14] border border-white/[0.06] p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Azure AI Speech</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    azureStatus?.services?.azureSpeech?.status === 'connected'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block truncate">
                {azureStatus?.services?.azureSpeech?.status === 'connected'
                  ? 'Neural STT & TTS'
                  : 'Web Speech API'}
              </span>
            </div>

            <div className="bg-[#0E0E14] border border-white/[0.06] p-3 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Azure AI Vision</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    azureStatus?.services?.azureVision?.configured
                      ? 'bg-emerald-400'
                      : 'bg-blue-400'
                  }`}
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-1 block truncate">
                {azureStatus?.services?.azureVision?.configured
                  ? 'Cloud Vision Telemetry'
                  : 'Browser Framing'}
              </span>
            </div>
          </div>
        </div>

        {/* THREE CORE FEATURE MODULES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Core Preparation Modules</h3>
            <span className="text-xs text-neutral-400">3 AI Engines Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: AI Placement Chatbot */}
            <div className="card-elevated p-6 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">AI Placement Chatbot</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Ask placement questions and learn with AI grounded in curated curriculum notes.
                </p>
                <div className="bg-[#060608] rounded-lg p-2.5 border border-white/[0.07] mb-6 text-[11px] text-neutral-400">
                  <span className="text-neutral-200 font-semibold block mb-0.5">Popular doubt:</span>
                  &quot;Explain Binary Search on rotated arrays&quot;
                </div>
              </div>

              <Link
                href="/chat"
                className="w-full py-2.5 px-4 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-200 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <span>Open Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2: AI Mock Interview */}
            <div className="card-elevated p-6 flex flex-col justify-between group border-purple-500/30">
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-4 group-hover:scale-105 transition-transform">
                  <Video className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">AI Mock Interview</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Practice realistic interviews with Speech + Vision AI and get instant multi-criteria feedback.
                </p>
                <div className="bg-[#060608] rounded-lg p-2.5 border border-white/[0.07] mb-6 text-[11px] text-neutral-400">
                  <span className="text-neutral-200 font-semibold block mb-0.5">
                    {recentInterviews[0] ? 'Last Completed:' : 'Next Recommended:'}
                  </span>
                  {recentInterviews[0]
                    ? `${recentInterviews[0].role} (${recentInterviews[0].overallScore}% score)`
                    : `${targetRoleDisplay} Technical Round`}
                </div>
              </div>

              <Link
                href="/interview"
                className="w-full py-2.5 px-4 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{recentInterviews.length > 0 ? 'Practice Again' : 'Start Interview'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </Link>
            </div>

            {/* Feature 3: AI Roadmap */}
            <div className="card-elevated p-6 flex flex-col justify-between group">
              <div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                  <Map className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">AI Roadmap</h4>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  Follow your personalized preparation plan customized to your target role and timeline.
                </p>
                <div className="bg-[#060608] rounded-lg p-2.5 border border-white/[0.07] mb-6 text-[11px] text-neutral-400 truncate">
                  <span className="text-neutral-200 font-semibold block mb-0.5">Current Focus:</span>
                  {activeRoadmap?.weeks?.[0]?.theme || `${targetRoleDisplay} Placement Prep`}
                </div>
              </div>

              <Link
                href={activeRoadmap ? '/roadmap/view' : '/roadmap'}
                className="w-full py-2.5 px-4 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-200 hover:text-white text-xs font-semibold border border-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <span>{activeRoadmap ? 'View Roadmap' : 'Build Roadmap'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* TODAY'S FOCUS SECTION */}
        <div className="card-surface p-6 space-y-4 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Today&apos;s Focus</h3>
              <p className="text-xs text-neutral-400">
                {activeRoadmap
                  ? `Daily syllabus targets aligned with your ${activeRoadmap.durationDays}-day ${activeRoadmap.targetRole} roadmap.`
                  : `Daily syllabus targets aligned with your ${targetRoleDisplay} preparation.`}
              </p>
            </div>
            <Link href={activeRoadmap ? '/roadmap/view' : '/roadmap'} className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1">
              <span>{activeRoadmap ? 'Full Roadmap' : 'Create Roadmap'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {todayFocusItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#0E0E14] border border-white/[0.07] p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-purple-500/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold ${item.color} uppercase tracking-wider`}>
                        {item.subject}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration}</span>
                      </div>
                    </div>
                    <h5 className="text-sm font-semibold text-white">{item.topic}</h5>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <span className={`w-2 h-2 rounded-full ${item.completed ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span>{item.completed ? 'Completed' : 'Pending Practice'}</span>
                    </div>
                    <Link
                      href="/chat"
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Study Notes &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
