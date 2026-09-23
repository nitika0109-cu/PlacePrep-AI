'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '../../../components/layout/Sidebar';
import {
  Trophy,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { api } from '../../../lib/api';
import { InterviewFinishResponse } from '../../../types';
import { ResponsibleAINotice } from '../../../components/interview/ResponsibleAINotice';

function InterviewResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [report, setReport] = useState<InterviewFinishResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQIndex, setExpandedQIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadReport() {
      if (!sessionId) {
        setError('No interview session ID was provided.');
        setLoading(false);
        return;
      }

      try {
        /*
         * The interview has already been completed.
         *
         * Do NOT call finishInterview() here because that endpoint is
         * intended to finish an active interview session. The dashboard
         * already receives completed evaluations from interview history.
         *
         * Instead, load the saved interview history and find the matching
         * completed session by sessionId.
         */
        const data = await api.getInterviewHistory();

        const matchingReport = data.interviews?.find(
          (interview) => interview.sessionId === sessionId
        );

        if (!matchingReport) {
          throw new Error(
            'No completed evaluation report was found for this interview session.'
          );
        }

        setReport(matchingReport);
      } catch (err: any) {
        console.warn('Failed loading interview evaluation:', err);
        setError(
          err.message ||
            'No interview evaluation report was found for this session.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-neutral-300">
            Loading interview evaluation...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex-1 flex bg-black min-h-[calc(100vh-4rem)] relative">
        <Sidebar />

        <div className="flex-1 p-8 max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Trophy className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-white">
            No Interview Session Found
          </h2>

          <p className="text-xs text-neutral-400">
            {error ||
              'No completed evaluation report was found for this interview session.'}
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/interview"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition shadow-md"
            >
              Start an Interview
            </Link>

            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-[#0E0E14] hover:bg-white/[0.08] text-neutral-300 hover:text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-black relative">
      <div className="ambient-purple-glow" />

      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Evaluation Complete</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interview Evaluation
            </h1>

            <p className="text-sm text-neutral-400 mt-1">
              Here&apos;s how you performed across technical, relevance, and
              communication rubrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-[#0E0E14] border border-white/10 text-xs font-semibold text-neutral-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* OVERALL PERFORMANCE & METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Overall Score */}
          <div className="card-surface p-6 bg-[#09090E]/90 border border-purple-500/30 flex flex-col justify-between rounded-2xl shadow-xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                Overall Performance
              </span>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-extrabold text-white font-mono">
                  {report.overallScore}%
                </span>

                <span className="text-xs text-neutral-400 font-mono">
                  / 100
                </span>
              </div>

              <p className="text-[11px] text-neutral-300 mt-2">
                Interview performance for {report.role} rounds.
              </p>
            </div>

            <div className="w-full bg-white/[0.06] rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                style={{ width: `${report.overallScore}%` }}
              />
            </div>
          </div>

          {/* Technical */}
          <div className="card-surface p-5 flex flex-col justify-between bg-[#0E0E14] border border-white/[0.08] rounded-xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Technical Depth
              </span>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white font-mono">
                  {report.technical}%
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 mt-1">
                Accuracy of concepts, data structures, and algorithms.
              </p>
            </div>

            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-purple-500 h-1.5 rounded-full"
                style={{ width: `${report.technical}%` }}
              />
            </div>
          </div>

          {/* Relevance */}
          <div className="card-surface p-5 flex flex-col justify-between bg-[#0E0E14] border border-white/[0.08] rounded-xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Answer Relevance
              </span>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white font-mono">
                  {report.relevance}%
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 mt-1">
                Directly answered the prompt without divergence.
              </p>
            </div>

            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-brand-cyan h-1.5 rounded-full"
                style={{ width: `${report.relevance}%` }}
              />
            </div>
          </div>

          {/* Communication */}
          <div className="card-surface p-5 flex flex-col justify-between bg-[#0E0E14] border border-white/[0.08] rounded-xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Communication
              </span>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white font-mono">
                  {report.communication}%
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 mt-1">
                Clarity, flow, and structured technical articulation.
              </p>
            </div>

            <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full"
                style={{ width: `${report.communication}%` }}
              />
            </div>
          </div>
        </div>

        {/* FEEDBACK BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="card-surface p-6 space-y-4 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                What You Did Well
              </h3>
            </div>

            <ul className="space-y-2.5">
              {report.strengths.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvements */}
          <div className="card-surface p-6 space-y-4 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Areas to Improve
              </h3>
            </div>

            <ul className="space-y-2.5">
              {report.improvements.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI RECOMMENDATIONS */}
        <div className="card-surface p-6 space-y-4 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl">
          <div className="flex items-center gap-2 text-purple-400">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">
              AI Recommendations
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {report.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="bg-[#0E0E14] p-3.5 rounded-xl border border-white/[0.07] flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    Action Item {idx + 1}
                  </span>

                  <p className="text-xs text-neutral-200 mt-1 font-medium">
                    {rec}
                  </p>
                </div>

                <Link
                  href="/chat"
                  className="mt-3 text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <span>Practice with Chatbot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* QUESTION-BY-QUESTION REVIEW */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">
            Question-by-Question Review
          </h3>

          <div className="space-y-3">
            {report.questionReviews.map((q, idx) => {
              const isExpanded = expandedQIndex === idx;

              return (
                <div
                  key={q.questionId || idx}
                  className="card-surface overflow-hidden bg-[#09090E]/90 border border-white/[0.08] rounded-xl"
                >
                  <button
                    onClick={() =>
                      setExpandedQIndex(isExpanded ? null : idx)
                    }
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-mono font-bold text-xs">
                        Q{idx + 1}
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-neutral-200 line-clamp-1">
                          {q.question}
                        </p>

                        <span className="text-[11px] text-neutral-400 font-mono">
                          Category: {q.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 font-mono text-xs text-purple-300 font-bold">
                        Score: {q.score}%
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-white/[0.07] space-y-4 text-xs bg-black/40">
                      {/* Transcript */}
                      <div>
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                          Your Recorded Transcript:
                        </span>

                        <p className="p-3 bg-[#0E0E14] rounded-lg border border-white/[0.07] text-neutral-300 italic leading-relaxed">
                          &ldquo;{q.transcript}&rdquo;
                        </p>
                      </div>

                      {/* AI Feedback */}
                      <div>
                        <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block mb-1">
                          AI Evaluator Feedback:
                        </span>

                        <p className="text-neutral-300 leading-relaxed">
                          {q.feedback}
                        </p>
                      </div>

                      {/* Ideal Answer Highlights */}
                      {q.idealAnswerHighlights &&
                        q.idealAnswerHighlights.length > 0 && (
                          <div>
                            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                              Key Concepts Interviewers Look For:
                            </span>

                            <ul className="space-y-1">
                              {q.idealAnswerHighlights.map((hl, hIdx) => (
                                <li
                                  key={hIdx}
                                  className="flex items-center gap-2 text-neutral-300"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>{hl}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.07]">
          <Link
            href="/chat"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-black" />
            <span>Practice Weak Topics in Chat</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0E0E14] hover:bg-white/[0.08] text-neutral-300 hover:text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Responsible AI Notice */}
        <ResponsibleAINotice />
      </div>
    </div>
  );
}

export default function InterviewResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-neutral-300">
              Loading interview evaluation results...
            </p>
          </div>
        </div>
      }
    >
      <InterviewResultContent />
    </Suspense>
  );
}
