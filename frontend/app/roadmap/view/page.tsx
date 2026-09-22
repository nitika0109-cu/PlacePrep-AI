'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '../../../components/layout/Sidebar';
import {
  Map,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../../../lib/api';
import { RoadmapGenerateResponse, RoadmapTask } from '../../../types';
import { ScrollReveal } from '../../../components/animations/ScrollReveal';

export default function RoadmapViewPage() {
  const [roadmap, setRoadmap] = useState<RoadmapGenerateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    async function loadData() {
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem('active_placement_roadmap');
        if (stored) {
          try {
            setRoadmap(JSON.parse(stored));
            setLoading(false);
            return;
          } catch {}
        }
      }

      // Check backend for logged-in user's saved roadmap
      try {
        const latestRes = await api.getLatestRoadmap();
        if (latestRes.roadmap) {
          setRoadmap(latestRes.roadmap);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('active_placement_roadmap', JSON.stringify(latestRes.roadmap));
          }
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback load via backend api
      try {
        const res = await api.generateRoadmap({
          role: 'Software Developer',
          level: 'Beginner',
          dailyHours: 2,
          duration: 60,
          topics: ['DSA', 'OOP', 'DBMS', 'OS', 'SQL']
        });
        setRoadmap(res);
      } catch (err) {
        console.warn('Roadmap API call failed, generating fallback template:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const toggleTask = (weekNumber: number, dayNumber: number, taskId: string) => {
    if (!roadmap) return;

    const newWeeks = roadmap.weeks.map(week => {
      if (week.weekNumber !== weekNumber) return week;
      return {
        ...week,
        days: week.days.map(day => {
          if (day.dayNumber !== dayNumber) return day;
          return {
            ...day,
            tasks: day.tasks.map(task => {
              if (task.id !== taskId) return task;
              return {
                ...task,
                status: task.status === 'completed' ? 'pending' : 'completed'
              } as RoadmapTask;
            })
          };
        })
      };
    });

    // Recompute dynamic progress percentage
    let totalTasks = 0;
    let completedTasks = 0;
    newWeeks.forEach(w => {
      w.days.forEach(d => {
        d.tasks.forEach(t => {
          totalTasks++;
          if (t.status === 'completed') completedTasks++;
        });
      });
    });

    const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const updatedRoadmap = {
      ...roadmap,
      progressPercentage: newProgress,
      weeks: newWeeks
    };

    setRoadmap(updatedRoadmap);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('active_placement_roadmap', JSON.stringify(updatedRoadmap));
    }
  };

  const toggleWeekExpand = (weekNum: number) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNum]: !prev[weekNum]
    }));
  };

  if (loading || !roadmap) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-[calc(100vh-4rem)] relative overflow-hidden">
        <div className="ambient-center-glow opacity-30 pointer-events-none" />
        <div className="text-center space-y-3 relative z-10">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-300">Assembling placement roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-black min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <Sidebar />

      {/* Ambient background glow */}
      <div className="ambient-center-glow opacity-30 pointer-events-none" />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto relative z-10">
        {/* Header */}
        <ScrollReveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold text-purple-300 mb-3">
              <Map className="w-3.5 h-3.5 text-purple-400" />
              <span>Personalized Curriculum</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Your {roadmap.durationDays}-Day Placement Roadmap
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Target: <strong className="text-slate-200">{roadmap.targetRole}</strong> &bull; Level: <strong className="text-slate-200">{roadmap.level}</strong> &bull; Daily Commitment: <strong className="text-slate-200">{roadmap.dailyHours} Hours/day</strong>
            </p>
          </div>

          <Link
            href="/roadmap"
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-2 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>Customize Plan</span>
          </Link>
        </ScrollReveal>

        {/* OVERALL PROGRESS BAR CARD */}
        <ScrollReveal className="p-6 rounded-2xl bg-[#09090E]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                Roadmap Completion Status
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {roadmap.progressPercentage}%
                </span>
                <span className="text-xs text-slate-400">Preparation milestones achieved</span>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.08]">
              {roadmap.totalWeeks} Weeks Total
            </span>
          </div>

          <div className="w-full bg-black/60 rounded-full h-2.5 overflow-hidden border border-white/[0.08]">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 h-2.5 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
              style={{ width: `${roadmap.progressPercentage}%` }}
            />
          </div>
        </ScrollReveal>

        {/* FILTER TABS */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            All Weeks
          </button>
          <button
            onClick={() => setActiveFilter('today')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'today'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            Today&apos;s Tasks
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'upcoming'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'completed'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            Completed
          </button>
        </div>

        {/* ROADMAP GROUPED BY WEEKS */}
        <div className="space-y-6">
          {roadmap.weeks.map(week => {
            const isExpanded = expandedWeeks[week.weekNumber] ?? true;

            // Filter days/tasks if filter is active
            const filteredDays = week.days.map(day => {
              if (activeFilter === 'today') {
                return day.dayNumber === 2 ? day : null;
              }
              if (activeFilter === 'upcoming') {
                const pendingTasks = day.tasks.filter(t => t.status !== 'completed');
                return pendingTasks.length > 0 ? { ...day, tasks: pendingTasks } : null;
              }
              if (activeFilter === 'completed') {
                const doneTasks = day.tasks.filter(t => t.status === 'completed');
                return doneTasks.length > 0 ? { ...day, tasks: doneTasks } : null;
              }
              return day;
            }).filter(Boolean);

            if (filteredDays.length === 0) return null;

            return (
              <div key={week.weekNumber} className="rounded-2xl bg-[#09090E]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Week Header */}
                <button
                  onClick={() => toggleWeekExpand(week.weekNumber)}
                  className="w-full p-5 text-left bg-[#0D0D14]/90 hover:bg-[#13131D] flex items-center justify-between border-b border-white/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-xs font-mono">
                      W{week.weekNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{week.theme}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{week.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                      {week.days.reduce((acc, d) => acc + d.tasks.filter(t => t.status === 'completed').length, 0)} / {week.days.reduce((acc, d) => acc + d.tasks.length, 0)} Tasks
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Week Days Content */}
                {isExpanded && (
                  <div className="p-5 space-y-6 divide-y divide-white/[0.06]">
                    {filteredDays.map((day: any) => (
                      <div key={day.dayNumber} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                            <span>Day {day.dayNumber}:</span>
                            <span className="text-slate-200">{day.focusArea}</span>
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {day.tasks.length} topics
                          </span>
                        </div>

                        {/* Task Checklist Items */}
                        <div className="grid grid-cols-1 gap-2.5">
                          {day.tasks.map((task: RoadmapTask) => {
                            const isComplete = task.status === 'completed';
                            return (
                              <div
                                key={task.id}
                                onClick={() => toggleTask(week.weekNumber, day.dayNumber, task.id)}
                                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                  isComplete
                                    ? 'bg-[#06060A]/80 border-white/[0.04] opacity-75'
                                    : 'bg-[#0D0D14]/80 border-white/[0.08] hover:border-purple-500/40 hover:bg-[#13131D]'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    className="text-slate-400 hover:text-purple-400 transition-colors mt-0.5"
                                  >
                                    {isComplete ? (
                                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-slate-500" />
                                    )}
                                  </button>
                                  <div>
                                    <p className={`text-xs font-medium ${isComplete ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                      {task.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                      <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-purple-300 font-mono border border-white/[0.06]">
                                        {task.topic}
                                      </span>
                                      <span>&bull;</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {task.estimatedMinutes} mins
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/chat?q=${encodeURIComponent(`Explain ${task.title}`)}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1.5 rounded text-slate-400 hover:text-purple-300 hover:bg-white/[0.06] text-[11px] flex items-center gap-1 transition-colors"
                                    title="Open preparation notes in chat"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Notes</span>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
