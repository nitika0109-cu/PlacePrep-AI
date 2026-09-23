'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  Play,
  Square,
  Send,
  ChevronRight,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Volume2
} from 'lucide-react';
import { VideoPreview } from '../../../components/interview/VideoPreview';
import { AudioVisualizer } from '../../../components/interview/AudioVisualizer';
import { ResponsibleAINotice } from '../../../components/interview/ResponsibleAINotice';
import { api } from '../../../lib/api';
import {
  InterviewStartResponse,
  InterviewAnswerResponse,
  DifficultyLevel
} from '../../../types';
import {
  ViolationType,
  GRACE_COUNTDOWN_TYPES,
  VIOLATION_COPY
} from '../../../lib/violations';

type InterviewState =
  | 'IDLE'
  | 'QUESTION'
  | 'RECORDING'
  | 'TRANSCRIBING'
  | 'REVIEW'
  | 'EVALUATING'
  | 'FEEDBACK'
  | 'NEXT_QUESTION'
  | 'COMPLETED';

const QUESTION_TIME_LIMITS: Record<DifficultyLevel, number> = {
  Beginner: 300,
  Intermediate: 180,
  Advanced: 120,
};

function InterviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // A real interview must always have a real session ID.
  const sessionId = searchParams.get('sessionId');

  const [currentState, setCurrentState] =
    useState<InterviewState>('QUESTION');

  const [isMicActive, setIsMicActive] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(
    'Explain the difference between an Array and a Linked List.'
  );
  const [currentQuestionId, setCurrentQuestionId] =
    useState('q-sw-1');
  const [category, setCategory] =
    useState('Data Structures');
  const [difficulty, setDifficulty] =
    useState<DifficultyLevel>('Intermediate');

  const [transcript, setTranscript] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [lastFeedback, setLastFeedback] =
    useState<InterviewAnswerResponse | null>(null);
  const [error, setError] =
    useState<string | null>(null);

  // ---- Per-question timer ----
  const [timeRemaining, setTimeRemaining] =
    useState<number>(
      QUESTION_TIME_LIMITS.Intermediate
    );
  const [timerActive, setTimerActive] =
    useState(false);

  // ---- Integrity / anti-cheating state ----
  const [activeWarning, setActiveWarning] =
    useState<ViolationType | null>(null);
  const [cancelCountdown, setCancelCountdown] =
    useState<number | null>(null);
  const [cancelReason, setCancelReason] =
    useState<ViolationType | null>(null);
  const [sessionTerminated, setSessionTerminated] =
    useState(false);
  const [terminationReason, setTerminationReason] =
    useState<ViolationType | null>(null);

  const strikesRef = useRef<
    Record<ViolationType, number>
  >({
    no_face: 0,
    multiple_faces: 0,
    phone_detected: 0,
    tab_switch: 0,
    dev_tools: 0,
    copy_paste: 0,
    right_click: 0,
  });

  const sessionTerminatedRef =
    useRef(false);

  const latestFaceCountRef =
    useRef<number>(1);

  const recognitionRef =
    useRef<any>(null);

  useEffect(() => {
    sessionTerminatedRef.current =
      sessionTerminated;
  }, [sessionTerminated]);

  // If there is no real session ID, stop the page
  // from behaving like a demo interview.
  useEffect(() => {
    if (!sessionId) {
      setError(
        'Interview session could not be found. Please start a new interview.'
      );
    }
  }, [sessionId]);

  // Load session from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored =
        sessionStorage.getItem(
          'active_interview_session'
        );

      if (stored) {
        try {
          const parsed: InterviewStartResponse =
            JSON.parse(stored);

          setQuestionIndex(
            parsed.questionIndex || 1
          );

          setTotalQuestions(
            parsed.totalQuestions || 5
          );

          setCurrentQuestion(
            parsed.question
          );

          setCurrentQuestionId(
            parsed.questionId
          );

          setCategory(
            parsed.category
          );

          const d =
            parsed.difficulty ||
            'Intermediate';

          setDifficulty(d);

          setTimeRemaining(
            QUESTION_TIME_LIMITS[d] ??
              QUESTION_TIME_LIMITS.Intermediate
          );
        } catch {
          // Keep defaults
        }
      }
    }
  }, []);

  // Session elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(
        prev => prev + 1
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Recording duration timer
  useEffect(() => {
    let recTimer: NodeJS.Timeout;

    if (currentState === 'RECORDING') {
      recTimer = setInterval(() => {
        setRecordingSeconds(
          prev => prev + 1
        );
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }

    return () =>
      clearInterval(recTimer);
  }, [currentState]);

  // Per-question countdown
  useEffect(() => {
    if (
      !timerActive ||
      sessionTerminated
    ) {
      return;
    }

    if (timeRemaining <= 0) {
      setTimerActive(false);
      submitCurrentAnswer({
        auto: true
      });
      return;
    }

    const t = setTimeout(
      () =>
        setTimeRemaining(
          s => s - 1
        ),
      1000
    );

    return () =>
      clearTimeout(t);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timerActive,
    timeRemaining,
    sessionTerminated
  ]);

  // Web Speech API setup
  useEffect(() => {
    if (
      typeof window !== 'undefined'
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any)
          .webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition =
          new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (
          event: any
        ) => {
          let currentTranscript = '';

          for (
            let i = 0;
            i < event.results.length;
            i++
          ) {
            currentTranscript +=
              event.results[i][0]
                .transcript + ' ';
          }

          if (
            currentTranscript.trim()
          ) {
            setTranscript(
              currentTranscript.trim()
            );
          }
        };

        recognition.onerror = (
          e: any
        ) => {
          console.warn(
            'Browser Speech recognition error or unsupported:',
            e
          );
        };

        recognitionRef.current =
          recognition;
      }
    }
  }, []);

  // ---- Integrity violation engine ----

  const terminateInterview = async (
    reason: ViolationType
  ) => {
    setSessionTerminated(true);
    setTerminationReason(reason);
    setTimerActive(false);

    if (!sessionId) {
      return;
    }

    try {
      await api.finishInterview(
        sessionId
      );
    } catch (err) {
      console.warn(
        'Failed to finalize terminated session:',
        err
      );
    }
  };

  const registerViolation = (
    type: ViolationType
  ) => {
    if (
      sessionTerminatedRef.current
    ) {
      return;
    }

    const count =
      (strikesRef.current[type] ||
        0) + 1;

    strikesRef.current[type] =
      count;

    if (count === 1) {
      setActiveWarning(type);
      return;
    }

    if (
      GRACE_COUNTDOWN_TYPES.includes(
        type
      )
    ) {
      setCancelReason(type);
      setCancelCountdown(5);
    } else {
      terminateInterview(type);
    }
  };

  const clearViolation = (
    type: ViolationType
  ) => {
    setActiveWarning(prev =>
      prev === type ? null : prev
    );

    setCancelReason(
      prevReason => {
        if (
          prevReason === type
        ) {
          setCancelCountdown(
            null
          );

          return null;
        }

        return prevReason;
      }
    );
  };

  useEffect(() => {
    if (
      cancelCountdown === null ||
      cancelReason === null
    ) {
      return;
    }

    if (cancelCountdown === 0) {
      terminateInterview(
        cancelReason
      );
      return;
    }

    const t = setTimeout(
      () =>
        setCancelCountdown(
          c =>
            c !== null
              ? c - 1
              : null
        ),
      1000
    );

    return () =>
      clearTimeout(t);
  }, [
    cancelCountdown,
    cancelReason
  ]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        registerViolation(
          'tab_switch'
        );
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibility
    );

    return () =>
      document.removeEventListener(
        'visibilitychange',
        handleVisibility
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let wasOpen = false;

    const THRESHOLD = 160;

    const check = () => {
      const widthDiff =
        window.outerWidth -
        window.innerWidth;

      const heightDiff =
        window.outerHeight -
        window.innerHeight;

      const isOpen =
        widthDiff > THRESHOLD ||
        heightDiff > THRESHOLD;

      if (
        isOpen &&
        !wasOpen
      ) {
        wasOpen = true;

        registerViolation(
          'dev_tools'
        );
      } else if (!isOpen) {
        wasOpen = false;
      }
    };

    const interval =
      setInterval(check, 1000);

    return () =>
      clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleContextMenu = (
      e: MouseEvent
    ) => {
      e.preventDefault();

      registerViolation(
        'right_click'
      );
    };

    document.addEventListener(
      'contextmenu',
      handleContextMenu
    );

    return () =>
      document.removeEventListener(
        'contextmenu',
        handleContextMenu
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (
    secs: number
  ) => {
    const mins = Math.floor(
      secs / 60
    );

    const remaining =
      secs % 60;

    return `${mins
      .toString()
      .padStart(
        2,
        '0'
      )}:${remaining
      .toString()
      .padStart(
        2,
        '0'
      )}`;
  };

  const startQuestionTimerIfNeeded =
    () => {
      if (!timerActive) {
        setTimerActive(true);
      }
    };

  const handleStartAnswer =
    () => {
      setError(null);
      setLastFeedback(null);
      setCurrentState(
        'RECORDING'
      );
      setTranscript('');
      startQuestionTimerIfNeeded();

      if (
        recognitionRef.current &&
        isMicActive
      ) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.warn(
            'SpeechRecognition start error:',
            err
          );
        }
      }
    };

  const handleStopAnswer =
    () => {
      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      setCurrentState(
        'TRANSCRIBING'
      );

      setTimeout(() => {
        if (
          !transcript ||
          transcript.trim()
            .length === 0
        ) {
          setError(
            'No speech detected. You can record again or type your answer directly in the box below.'
          );
        }

        setCurrentState(
          'REVIEW'
        );
      }, 800);
    };

  const handleTranscriptChange =
    (value: string) => {
      setTranscript(value);

      if (
        value.trim().length > 0
      ) {
        startQuestionTimerIfNeeded();
      }
    };

  const submitCurrentAnswer =
    async (
      options?: {
        auto?: boolean;
      }
    ) => {
      if (!sessionId) {
        setError(
          'Interview session ID is missing. Please start a new interview.'
        );
        return;
      }

      const isAuto =
        options?.auto ?? false;

      const finalTranscript =
        transcript.trim() ||
        (isAuto
          ? 'No answer provided within the time limit.'
          : '');

      if (!finalTranscript) {
        setError(
          'Please provide your answer before submitting.'
        );
        return;
      }

      setTimerActive(false);

      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      setCurrentState(
        'EVALUATING'
      );

      setError(null);

      try {
        const res =
          await api.submitInterviewAnswer(
            {
              sessionId,
              questionId:
                currentQuestionId,
              transcript:
                finalTranscript,
              durationSeconds:
                recordingSeconds,
              visionSignals: {
                faceCenteredScore:
                  latestFaceCountRef.current ===
                  1
                    ? 90
                    : 15,
                lightingQuality:
                  'good',
                interactionActive:
                  isCameraActive
              }
            }
          );

        setLastFeedback(res);
        setCurrentState(
          'FEEDBACK'
        );

        /*
         * IMPORTANT:
         * When the final question is completed,
         * finish the interview first so the backend
         * generates and stores the permanent report.
         *
         * Only after /finish succeeds do we open
         * the result page.
         */
        if (
          res.isCompleted ||
          questionIndex >=
            totalQuestions
        ) {
          setTimeout(
            async () => {
              try {
                if (!sessionId) {
                  throw new Error(
                    'Interview session ID is missing.'
                  );
                }

                setCurrentState(
                  'EVALUATING'
                );

                const report =
                  await api.finishInterview(
                    sessionId
                  );

                if (
                  typeof window !==
                  'undefined'
                ) {
                  sessionStorage.removeItem(
                    'active_interview_session'
                  );
                }

                setCurrentState(
                  'COMPLETED'
                );

                router.push(
                  `/interview/result?sessionId=${encodeURIComponent(
                    report.sessionId ||
                      sessionId
                  )}`
                );
              } catch (
                finishError: any
              ) {
                console.error(
                  'Failed to finish interview:',
                  finishError
                );

                setError(
                  finishError?.message ||
                    'Unable to generate the final interview evaluation. Please try again.'
                );

                setCurrentState(
                  'REVIEW'
                );
              }
            },
            1500
          );
        } else {
          if (
            res.nextQuestion
          ) {
            setTimeout(() => {
              setCurrentQuestion(
                res.nextQuestion!
                  .question
              );

              setCurrentQuestionId(
                res.nextQuestion!
                  .questionId
              );

              setQuestionIndex(
                res.nextQuestion!
                  .questionIndex
              );

              setCategory(
                res.nextQuestion!
                  .category
              );

              setTranscript('');
              setLastFeedback(null);

              setCurrentState(
                'QUESTION'
              );

              setTimeRemaining(
                QUESTION_TIME_LIMITS[
                  difficulty
                ] ??
                  QUESTION_TIME_LIMITS.Intermediate
              );

              setTimerActive(
                false
              );
            }, 2000);
          }
        }
      } catch (err: any) {
        console.error(
          'Answer submission error:',
          err
        );

        setError(
          err.message ||
            'Error evaluating answer. Please try again.'
        );

        setCurrentState(
          'REVIEW'
        );
      }
    };

  const handleSubmitAnswer =
    () =>
      submitCurrentAnswer();

  /*
   * Manual End Session button.
   *
   * This is different from a violation termination.
   * It explicitly finishes the active interview,
   * saves the report through the backend,
   * and opens the permanent evaluation page.
   */
  const handleEndSession =
    async () => {
      if (!sessionId) {
        setError(
          'Interview session ID is missing. Please start a new interview.'
        );
        return;
      }

      if (
        recognitionRef.current
      ) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      setTimerActive(false);
      setError(null);
      setCurrentState(
        'EVALUATING'
      );

      try {
        const report =
          await api.finishInterview(
            sessionId
          );

        if (
          typeof window !==
          'undefined'
        ) {
          sessionStorage.removeItem(
            'active_interview_session'
          );
        }

        router.push(
          `/interview/result?sessionId=${encodeURIComponent(
            report.sessionId ||
              sessionId
          )}`
        );
      } catch (err: any) {
        console.error(
          'Failed to end interview:',
          err
        );

        setError(
          err.message ||
            'Unable to finish the interview. Please try again.'
        );

        setCurrentState(
          'REVIEW'
        );
      }
    };

  const handlePaste: React.ClipboardEventHandler<
    HTMLTextAreaElement
  > = e => {
    e.preventDefault();

    registerViolation(
      'copy_paste'
    );
  };

  const timerUrgency =
    timeRemaining <= 20
      ? 'critical'
      : timeRemaining <=
          (QUESTION_TIME_LIMITS[
            difficulty
          ] ?? 180) *
            0.3
        ? 'warning'
        : 'normal';

  if (sessionTerminated) {
    return (
      <div className="min-h-screen bg-black text-neutral-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <XCircle className="w-14 h-14 text-red-400 mx-auto" />

          <h1 className="text-2xl font-bold text-white">
            Interview Cancelled
          </h1>

          <p className="text-sm text-neutral-400">
            {terminationReason
              ? VIOLATION_COPY[
                  terminationReason
                ].terminated
              : 'This session was ended due to a policy violation.'}
            {' '}
            You can start a new mock interview whenever you're ready.
          </p>

          <Link
            href="/interview"
            className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all"
          >
            Start New Interview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col relative">
      <div className="ambient-purple-glow" />

      <header className="h-16 border-b border-white/[0.07] bg-[#060608]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <span className="font-bold text-white text-sm tracking-tight flex items-center gap-1">
              PlacePrep
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            </span>
          </Link>

          <span className="text-white/20">
            |
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-400">
              AI Mock Interview
            </span>

            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-neutral-300 font-mono">
              Question {questionIndex} /{' '}
              {totalQuestions}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0E0E14] px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>
              {formatTime(
                elapsedSeconds
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={
              handleEndSession
            }
            disabled={
              currentState ===
              'EVALUATING'
            }
            className="text-xs text-neutral-400 hover:text-red-400 disabled:opacity-50 font-medium px-2 py-1 transition-colors"
          >
            End Session
          </button>
        </div>
      </header>

      {activeWarning &&
        cancelCountdown ===
          null && (
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 relative z-10">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-sm text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />

              <span>
                {
                  VIOLATION_COPY[
                    activeWarning
                  ].warning
                }
              </span>
            </div>
          </div>
        )}

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        <div className="lg:col-span-7 space-y-6">
          <div className="card-surface p-6 sm:p-8 space-y-6 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl relative shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                  <Bot className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white">
                    AI Interviewer
                  </h2>

                  <span className="text-xs text-purple-400 font-mono uppercase">
                    {category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 ${
                    timerUrgency ===
                    'critical'
                      ? 'bg-red-500/15 border-red-500/40 text-red-300 animate-pulse'
                      : timerUrgency ===
                        'warning'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-black/60 border-white/10 text-neutral-300'
                  }`}
                  title={
                    timerActive
                      ? 'Time remaining for this question'
                      : `You'll have ${formatTime(
                          QUESTION_TIME_LIMITS[
                            difficulty
                          ]
                        )} once you begin answering`
                  }
                >
                  <Clock className="w-3.5 h-3.5" />

                  <span>
                    {formatTime(
                      timeRemaining
                    )}
                  </span>
                </div>

                <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono font-medium text-neutral-300 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentState ===
                      'RECORDING'
                        ? 'bg-red-500 animate-ping'
                        : currentState ===
                              'EVALUATING' ||
                            currentState ===
                              'TRANSCRIBING'
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-emerald-400'
                    }`}
                  />

                  <span>
                    STATE:{' '}
                    {currentState}
                  </span>
                </div>
              </div>
            </div>

            <AnimatePresence
              mode="wait"
              initial={false}
            >
              <motion.div
                key={currentQuestionId}
                initial={{
                  opacity: 0,
                  y: 24,
                  scale: 0.96
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  y: -18,
                  scale: 0.98
                }}
                transition={{
                  duration: 0.55,
                  ease: [
                    0.16,
                    1,
                    0.3,
                    1
                  ]
                }}
                className="bg-[#0E0E14] p-5 rounded-xl border border-white/[0.08]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                    Question{' '}
                    {questionIndex}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      api.playQuestionSpeech(
                        currentQuestion
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs flex items-center gap-1.5 transition-colors border border-purple-500/20"
                    title="Listen to interviewer read question (Azure Speech TTS)"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />

                    <span>
                      Listen
                    </span>
                  </button>
                </div>

                <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                  &ldquo;
                  {currentQuestion}
                  &rdquo;
                </p>

                {!timerActive && (
                  <p className="text-[11px] text-neutral-500 mt-3">
                    Take your time to think — the{' '}
                    {formatTime(
                      QUESTION_TIME_LIMITS[
                        difficulty
                      ]
                    )}{' '}
                    clock starts once you begin answering.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {currentState ===
              'TRANSCRIBING' && (
              <div className="p-3 rounded-lg bg-[#0E0E14] border border-purple-500/30 text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-purple-400" />

                <span>
                  Transcribing candidate speech using Azure AI Speech...
                </span>
              </div>
            )}

            {currentState ===
              'EVALUATING' && (
              <div className="p-3 rounded-lg bg-[#0E0E14] border border-amber-500/30 text-xs text-amber-400 flex items-center gap-2 animate-pulse">
                <Bot className="w-4 h-4" />

                <span>
                  Generating your interview evaluation...
                </span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>
                  Candidate Response (Voice Transcript / Editable)
                </span>

                {currentState ===
                  'RECORDING' && (
                  <span className="text-red-400 font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />

                    Recording:{' '}
                    {formatTime(
                      recordingSeconds
                    )}
                  </span>
                )}
              </div>

              <textarea
                value={transcript}
                onChange={e =>
                  handleTranscriptChange(
                    e.target.value
                  )
                }
                onPaste={
                  handlePaste
                }
                placeholder="Click 'Start Answer' to record voice, or type your answer here..."
                disabled={
                  currentState ===
                    'RECORDING' ||
                  currentState ===
                    'EVALUATING'
                }
                rows={4}
                className="w-full p-3.5 rounded-xl bg-[#0E0E14] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-purple-500/60 transition-colors disabled:opacity-80"
              />
            </div>

            <AnimatePresence
              mode="wait"
              initial={false}
            >
              {lastFeedback &&
                currentState ===
                  'FEEDBACK' && (
                  <motion.div
                    key={`feedback-${currentQuestionId}`}
                    initial={{
                      opacity: 0,
                      y: 30,
                      scale: 0.9
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      scale: 0.98
                    }}
                    transition={{
                      duration: 0.62,
                      ease: [
                        0.16,
                        1,
                        0.3,
                        1
                      ]
                    }}
                    className="p-4 rounded-xl bg-[#0E0E14] border border-emerald-500/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-emerald-400 font-semibold">
                      <span>
                        Question Score:{' '}
                        {
                          lastFeedback.score
                        }
                        /100
                      </span>

                      <span className="text-neutral-400">
                        Ready for next
                      </span>
                    </div>

                    <p className="text-neutral-200 leading-relaxed">
                      {
                        lastFeedback.feedback
                      }
                    </p>

                    <p className="text-[11px] text-purple-400 mt-1">
                      {
                        lastFeedback.suggestedImprovement
                      }
                    </p>
                  </motion.div>
                )}
            </AnimatePresence>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />

                <span>
                  {error}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.07]">
              <div className="flex items-center gap-2">
                {currentState ===
                'RECORDING' ? (
                  <button
                    onClick={
                      handleStopAnswer
                    }
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />

                    <span>
                      Stop Answer
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={
                      handleStartAnswer
                    }
                    type="button"
                    disabled={
                      currentState ===
                        'EVALUATING' ||
                      currentState ===
                        'FEEDBACK' ||
                      !sessionId
                    }
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-black" />

                    <span>
                      Start Answer
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={
                    handleSubmitAnswer
                  }
                  disabled={
                    currentState ===
                      'RECORDING' ||
                    currentState ===
                      'EVALUATING' ||
                    currentState ===
                      'FEEDBACK' ||
                    !transcript.trim() ||
                    !sessionId
                  }
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
                >
                  <span>
                    Submit Answer
                  </span>

                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <ResponsibleAINotice compact />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Candidate Camera Feed
              </span>

              <span className="text-[11px] text-purple-400">
                Azure Vision Telemetry Ready
              </span>
            </div>

            <VideoPreview
              isCameraActive={
                isCameraActive
              }
              isMicActive={
                isMicActive
              }
              onToggleCamera={() =>
                setIsCameraActive(
                  !isCameraActive
                )
              }
              onToggleMic={() =>
                setIsMicActive(
                  !isMicActive
                )
              }
              onViolation={
                registerViolation
              }
              onViolationCleared={
                clearViolation
              }
              onFaceCountChange={count => {
                latestFaceCountRef.current =
                  count;
              }}
            />
          </div>

          <AudioVisualizer
            isRecording={
              currentState ===
              'RECORDING'
            }
            statusText={
              currentState ===
              'RECORDING'
                ? 'Listening...'
                : currentState ===
                    'TRANSCRIBING'
                  ? 'Transcribing...'
                  : currentState ===
                      'EVALUATING'
                    ? 'Generating evaluation...'
                    : 'Microphone Idle'
            }
          />

          <div className="card-surface p-5 text-xs space-y-3 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl">
            <h4 className="font-semibold text-neutral-200">
              Evaluation Flow
            </h4>

            <div className="space-y-2 text-neutral-400">
              <div className="flex items-center justify-between">
                <span>
                  1. Question Delivery
                </span>

                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="flex items-center justify-between">
                <span>
                  2. Speech STT Transcription
                </span>

                <span
                  className={
                    currentState ===
                      'RECORDING' ||
                    currentState ===
                      'TRANSCRIBING'
                      ? 'text-purple-400 font-bold'
                      : 'text-neutral-500'
                  }
                >
                  {currentState ===
                  'RECORDING'
                    ? 'Active'
                    : 'Standby'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>
                  3. Interaction Presence Signal
                </span>

                <span className="text-emerald-400 font-mono">
                  Live
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>
                  4. Rubric-based Scoring
                </span>

                <span className="text-neutral-500">
                  Multi-criteria
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cancelCountdown !==
        null &&
        cancelReason &&
        GRACE_COUNTDOWN_TYPES.includes(
          cancelReason
        ) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-[#0B0B0F] border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />

              <h3 className="text-lg font-bold text-white">
                {
                  VIOLATION_COPY[
                    cancelReason
                  ].cancelTitle
                }
              </h3>

              <p className="text-sm text-neutral-400">
                {
                  VIOLATION_COPY[
                    cancelReason
                  ].cancelBody
                }
              </p>

              <div className="text-5xl font-black text-red-400 font-mono">
                {cancelCountdown}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-navy-950 min-h-screen">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-sm text-slate-300">
              Loading interview room...
            </p>
          </div>
        </div>
      }
    >
      <InterviewSessionContent />
    </Suspense>
  );
}
