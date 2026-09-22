import {
  DifficultyLevel,
  InterviewType,
  InterviewStartResponse,
  InterviewAnswerResponse,
  InterviewFinishResponse,
  QuestionReview
} from '../models/types.js';
import { visionService } from './visionService.js';
import { aiService } from './aiService.js';
import { config } from '../config/env.js';

interface QuestionTemplate {
  id: string;
  role: string[];
  difficulty: DifficultyLevel;
  type: InterviewType;
  question: string;
  category: string;
  idealKeywords: string[];
  idealSummary: string[];
}

interface ActiveSession {
  sessionId: string;
  role: string;
  difficulty: DifficultyLevel;
  type: InterviewType;
  totalQuestions: number;
  currentQuestionIndex: number;
  questions: QuestionTemplate[];
  answers: {
    questionId: string;
    questionIndex: number;
    transcript: string;
    score: number;
    technicalScore: number;
    relevanceScore: number;
    communicationScore: number;
    feedback: string;
    keyPointsCovered: string[];
    suggestedImprovement: string;
  }[];
  createdAt: number;
}

const QUESTION_BANK: QuestionTemplate[] = [
  // Software Developer - Technical
  {
    id: 'q-sw-1',
    role: ['Software Developer', 'Web Developer', 'Java Developer', 'Python Developer'],
    difficulty: 'Beginner',
    type: 'Technical',
    question: 'Explain the difference between an Array and a Linked List, along with their time complexities for insertion and access.',
    category: 'Data Structures',
    idealKeywords: ['contiguous', 'pointer', 'index', 'O(1)', 'O(n)', 'random access', 'traversal', 'memory'],
    idealSummary: [
      'Arrays use contiguous memory enabling O(1) indexed access but O(N) insertion/deletion.',
      'Linked Lists use node pointers enabling O(1) insertion if node pointer is known, but O(N) sequential search.',
      'Arrays have superior CPU cache locality.'
    ]
  },
  {
    id: 'q-sw-2',
    role: ['Software Developer', 'Java Developer', 'Python Developer'],
    difficulty: 'Beginner',
    type: 'Technical',
    question: 'What are the ACID properties in database management systems and why are they critical?',
    category: 'DBMS',
    idealKeywords: ['atomicity', 'consistency', 'isolation', 'durability', 'transaction', 'rollback', 'wal', 'commit'],
    idealSummary: [
      'Atomicity ensures all-or-nothing execution.',
      'Consistency guarantees database integrity constraints are preserved.',
      'Isolation prevents concurrent transaction anomalies.',
      'Durability ensures committed data survives system failures.'
    ]
  },
  {
    id: 'q-sw-3',
    role: ['Software Developer', 'Java Developer', 'Web Developer'],
    difficulty: 'Intermediate',
    type: 'Technical',
    question: 'Describe the core OOP principles and explain the difference between method overloading and method overriding.',
    category: 'Object-Oriented Programming',
    idealKeywords: ['encapsulation', 'abstraction', 'inheritance', 'polymorphism', 'compile-time', 'runtime', 'vtable', 'signature'],
    idealSummary: [
      'Encapsulation bundles state with behavior; Abstraction conceals complexity.',
      'Overloading is static/compile-time polymorphism with different parameter signatures in same class.',
      'Overriding is runtime polymorphism where subclass modifies parent method behavior.'
    ]
  },
  {
    id: 'q-sw-4',
    role: ['Software Developer', 'Python Developer', 'Data Analyst'],
    difficulty: 'Intermediate',
    type: 'Technical',
    question: 'How does Binary Search work, and what preconditions must be met before applying it?',
    category: 'Algorithms',
    idealKeywords: ['sorted', 'divide and conquer', 'O(log n)', 'mid', 'pointers', 'monotonic'],
    idealSummary: [
      'Collection must be monotonically sorted or possess binary searchable search space.',
      'Repeatedly halves search space by comparing target with midpoint.',
      'Guarantees O(log N) time complexity and O(1) auxiliary space iteratively.'
    ]
  },
  {
    id: 'q-sw-5',
    role: ['Software Developer', 'Java Developer', 'Python Developer', 'Web Developer'],
    difficulty: 'Advanced',
    type: 'Technical',
    question: 'What is the difference between a Process and a Thread, and how does context switching differ between them?',
    category: 'Operating Systems',
    idealKeywords: ['process', 'thread', 'address space', 'memory', 'pcb', 'tcb', 'context switch', 'overhead', 'ipc'],
    idealSummary: [
      'Processes have isolated virtual address spaces; threads share heap and code segments within same process.',
      'Process context switching flushes TLB and updates page tables, incurring heavy CPU overhead.',
      'Thread context switching preserves memory mapping, saving CPU cycles.'
    ]
  },

  // Web Developer
  {
    id: 'q-web-1',
    role: ['Web Developer', 'Software Developer'],
    difficulty: 'Beginner',
    type: 'Technical',
    question: 'Explain the difference between client-side rendering (CSR) and server-side rendering (SSR).',
    category: 'Web Architecture',
    idealKeywords: ['csr', 'ssr', 'seo', 'hydration', 'bundle', 'ttfb', 'first contentful paint', 'server'],
    idealSummary: [
      'SSR renders HTML on server giving fast initial paint and excellent SEO.',
      'CSR ships JavaScript bundle executed by browser, enabling rich SPAs after initial load.'
    ]
  },
  {
    id: 'q-web-2',
    role: ['Web Developer'],
    difficulty: 'Intermediate',
    type: 'Technical',
    question: 'How does the JavaScript Event Loop handle microtasks vs macrotasks?',
    category: 'JavaScript Core',
    idealKeywords: ['call stack', 'event loop', 'microtask', 'macrotask', 'promise', 'settimeout', 'callback queue'],
    idealSummary: [
      'Call stack executes synchronous code.',
      'Microtasks (Promise callbacks, queueMicrotask) take strict priority over macrotasks (setTimeout, setInterval).',
      'Microtask queue empties completely before next macrotask runs.'
    ]
  },

  // Data Analyst
  {
    id: 'q-da-1',
    role: ['Data Analyst', 'Software Developer'],
    difficulty: 'Beginner',
    type: 'Technical',
    question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with practical examples.',
    category: 'SQL & Databases',
    idealKeywords: ['inner join', 'left join', 'outer join', 'null', 'matched', 'table', 'foreign key'],
    idealSummary: [
      'INNER JOIN produces only matching records.',
      'LEFT JOIN includes all left table rows, filling nulls for unmatched right rows.',
      'FULL OUTER JOIN unions both datasets including unmatched rows from either.'
    ]
  },
  {
    id: 'q-da-2',
    role: ['Data Analyst'],
    difficulty: 'Intermediate',
    type: 'Technical',
    question: 'What are SQL window functions and when would you use ROW_NUMBER() vs RANK() vs DENSE_RANK()?',
    category: 'SQL & Analytics',
    idealKeywords: ['window', 'partition by', 'order by', 'row_number', 'rank', 'dense_rank', 'ties', 'gap'],
    idealSummary: [
      'ROW_NUMBER assigns strictly sequential integers.',
      'RANK leaves gaps when values tie (e.g. 1, 2, 2, 4).',
      'DENSE_RANK handles ties without gaps (e.g. 1, 2, 2, 3).'
    ]
  },

  // HR & Mixed
  {
    id: 'q-hr-1',
    role: ['Software Developer', 'Java Developer', 'Python Developer', 'Data Analyst', 'Web Developer'],
    difficulty: 'Beginner',
    type: 'HR',
    question: 'Tell me about a challenging technical project you built, an obstacle you faced, and how you resolved it.',
    category: 'Behavioral / STAR Method',
    idealKeywords: ['situation', 'task', 'action', 'result', 'learning', 'team', 'debugging', 'impact'],
    idealSummary: [
      'Used STAR method (Situation, Task, Action, Result).',
      'Described specific architectural/technical bottleneck.',
      'Demonstrated ownership, problem-solving, and measurable outcome.'
    ]
  },
  {
    id: 'q-hr-2',
    role: ['Software Developer', 'Java Developer', 'Python Developer', 'Data Analyst', 'Web Developer'],
    difficulty: 'Intermediate',
    type: 'HR',
    question: 'How do you handle disagreements on technical architecture or design choices within a team?',
    category: 'Collaboration & Communication',
    idealKeywords: ['data-driven', 'listening', 'trade-offs', 'consensus', 'respect', 'documentation', 'prototype'],
    idealSummary: [
      'Focus on objective trade-offs (scalability, complexity, delivery speed).',
      'Active listening and respectful technical debate.',
      'Building small proofs of concept (PoC) to validate hypotheses.'
    ]
  }
];

export class InterviewService {
  private sessions: Map<string, ActiveSession> = new Map();

  startSession(params: {
    role: string;
    difficulty: DifficultyLevel;
    type: InterviewType;
    questions: number;
  }): InterviewStartResponse {
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();

    // Filter relevant questions by role, type, and difficulty
    let pool = QUESTION_BANK.filter(q => {
      const roleMatch = q.role.some(r => r.toLowerCase().includes(params.role.toLowerCase()) || params.role.toLowerCase().includes(r.toLowerCase()));
      const typeMatch = params.type === 'Mixed' ? true : q.type === params.type;
      return roleMatch && typeMatch;
    });

    // Fallback pool if role filter is too restrictive
    if (pool.length === 0) {
      pool = QUESTION_BANK.filter(q => params.type === 'Mixed' ? true : q.type === params.type);
    }
    if (pool.length === 0) {
      pool = [...QUESTION_BANK];
    }

    // Select questions
    const selectedQuestions: QuestionTemplate[] = [];
    const count = Math.min(params.questions || 5, pool.length);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) {
      selectedQuestions.push(shuffled[i]);
    }

    const session: ActiveSession = {
      sessionId,
      role: params.role,
      difficulty: params.difficulty,
      type: params.type,
      totalQuestions: selectedQuestions.length,
      currentQuestionIndex: 0,
      questions: selectedQuestions,
      answers: [],
      createdAt: Date.now()
    };

    this.sessions.set(sessionId, session);

    const firstQ = selectedQuestions[0];

    return {
      sessionId,
      role: params.role,
      difficulty: params.difficulty,
      type: params.type,
      totalQuestions: selectedQuestions.length,
      questionIndex: 1,
      questionId: firstQ.id,
      question: firstQ.question,
      category: firstQ.category
    };
  }

  async submitAnswer(params: {
    sessionId: string;
    questionId: string;
    transcript: string;
    durationSeconds?: number;
    visionSignals?: {
      faceCenteredScore?: number;
      lightingQuality?: 'good' | 'fair' | 'poor';
      interactionActive?: boolean;
    };
  }): Promise<InterviewAnswerResponse> {
    const session = this.sessions.get(params.sessionId);

    if (!session) {
      throw new Error('Interview session not found or expired.');
    }

    const currentQ =
      session.questions.find(q => q.id === params.questionId) ||
      session.questions[session.currentQuestionIndex];

    if (!currentQ) {
      throw new Error('Interview question not found.');
    }

    /*
     * Prevent accidental duplicate submissions for the same question.
     */
    const alreadyAnswered = session.answers.some(
      answer => answer.questionId === currentQ.id
    );

    if (alreadyAnswered) {
      throw new Error('This interview question has already been evaluated.');
    }

    const transcript = (params.transcript || '').trim();

    /*
     * A missing/very short transcript is evaluated honestly rather than
     * receiving an artificial passing score.
     */
    const candidateAnswer =
      transcript.length > 0
        ? transcript
        : 'Candidate provided no audible or typed response.';

    let technicalScore = 0;
    let relevanceScore = 0;
    let communicationScore = 0;
    let depthScore = 0;

    let feedback = '';
    let keyPointsCovered: string[] = [];
    let suggestedImprovement = '';
    let evaluatedWithAzure = false;

    /*
     * ------------------------------------------------------------
     * AZURE AI EVALUATION
     * ------------------------------------------------------------
     *
     * Azure evaluates evidence from the actual answer.
     * The model is NOT asked to invent an overall score.
     * The backend calculates the final weighted score.
     */
    if (!config.useMockAI) {
      try {
        const evalPrompt = `
You are a senior technical interviewer evaluating one candidate answer.

Evaluate ONLY what the candidate actually said.
Do not give credit for concepts that were not expressed or reasonably implied.
Do not penalize a concise answer merely because it is short.
Do not reward an answer merely because it is long.
Do not require the candidate to use the exact wording of the reference.
Accept technically valid alternative explanations.

INTERVIEW ROLE:
${session.role}

QUESTION:
${currentQ.question}

QUESTION CATEGORY:
${currentQ.category}

EXPECTED CONCEPTS:
${currentQ.idealSummary.map(item => `- ${item}`).join('\n')}

REFERENCE KEYWORDS:
${currentQ.idealKeywords.join(', ')}

CANDIDATE ANSWER:
${candidateAnswer}

Evaluate these four dimensions independently from 0 to 100:

1. technicalScore
   Technical correctness and accuracy.
   Penalize factual errors, contradictions, incorrect complexity claims,
   and technically misleading statements.

2. relevanceScore
   How directly and completely the candidate answers the question.
   Reward coverage of important aspects of the question.

3. communicationScore
   Clarity, coherence, structure, and understandable explanation.
   Do NOT use answer length as a substitute for communication quality.

4. depthScore
   Reasoning, examples, trade-offs, complexity analysis, practical details,
   or "why" explanations when appropriate to this question.
   A short answer can still receive a high depth score if it demonstrates
   the necessary reasoning.

Also identify:
- concepts actually covered
- important concepts missing
- factual errors, if any
- one concise evidence-based feedback message
- one actionable improvement

IMPORTANT:
A score must be supported by the candidate's actual response.
Do not default all categories to the same number.
Do not give a high score simply because the answer sounds confident.

Return ONLY valid JSON:

{
  "technicalScore": 0,
  "relevanceScore": 0,
  "communicationScore": 0,
  "depthScore": 0,
  "keyPointsCovered": [],
  "missingKeyPoints": [],
  "factualErrors": [],
  "feedback": "",
  "suggestedImprovement": ""
}
`;

        const rawJson = await aiService.completePrompt(
          [
            {
              role: 'system',
              content:
                'You are a rigorous but fair interview grading engine. Return JSON only. Never use markdown fences.',
            },
            {
              role: 'user',
              content: evalPrompt,
            },
          ],
          {
            /*
             * Low temperature keeps evaluation consistent while still
             * allowing the model to judge different answers differently.
             */
            temperature: 0.15,
            maxTokens: 700,
          }
        );

        if (rawJson) {
          const cleaned = rawJson
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();

          const parsed = JSON.parse(cleaned);

          const numeric = (value: unknown): number | null => {
            const n = Number(value);
            return Number.isFinite(n) ? n : null;
          };

          const parsedTechnical = numeric(parsed.technicalScore);
          const parsedRelevance = numeric(parsed.relevanceScore);
          const parsedCommunication = numeric(parsed.communicationScore);
          const parsedDepth = numeric(parsed.depthScore);

          /*
           * Require ALL four dimensions.
           * We do not silently turn missing dimensions into 70.
           */
          if (
            parsedTechnical !== null &&
            parsedRelevance !== null &&
            parsedCommunication !== null &&
            parsedDepth !== null &&
            typeof parsed.feedback === 'string'
          ) {
            technicalScore = Math.round(
              Math.min(100, Math.max(0, parsedTechnical))
            );

            relevanceScore = Math.round(
              Math.min(100, Math.max(0, parsedRelevance))
            );

            communicationScore = Math.round(
              Math.min(100, Math.max(0, parsedCommunication))
            );

            depthScore = Math.round(
              Math.min(100, Math.max(0, parsedDepth))
            );

            keyPointsCovered = Array.isArray(parsed.keyPointsCovered)
              ? parsed.keyPointsCovered
                  .filter((item: unknown) => typeof item === 'string')
                  .slice(0, 6)
              : [];

            const missingKeyPoints = Array.isArray(parsed.missingKeyPoints)
              ? parsed.missingKeyPoints
                  .filter((item: unknown) => typeof item === 'string')
                  .slice(0, 4)
              : [];

            const factualErrors = Array.isArray(parsed.factualErrors)
              ? parsed.factualErrors
                  .filter((item: unknown) => typeof item === 'string')
                  .slice(0, 4)
              : [];

            feedback = parsed.feedback.trim();

            /*
             * Add concrete missing/error evidence to the feedback when
             * the model identified it.
             */
            if (factualErrors.length > 0) {
              feedback += ` Factual issue to review: ${factualErrors[0]}`;
            }

            suggestedImprovement =
              typeof parsed.suggestedImprovement === 'string' &&
              parsed.suggestedImprovement.trim().length > 0
                ? parsed.suggestedImprovement.trim()
                : missingKeyPoints.length > 0
                  ? `Strengthen the answer by covering: ${missingKeyPoints
                      .slice(0, 2)
                      .join('; ')}.`
                  : 'Add one concrete example or explain the relevant trade-off more explicitly.';

            /*
             * Keep this as a real signal, not a hard-coded score.
             */
            if (keyPointsCovered.length === 0) {
              keyPointsCovered.push('No clearly demonstrated reference concept was identified.');
            }

            evaluatedWithAzure = true;
          }
        }
      } catch (azureErr) {
        console.warn(
          '[InterviewService] Azure evaluation failed; using transparent local rubric fallback:',
          azureErr
        );
      }
    }

    /*
     * ------------------------------------------------------------
     * LOCAL RUBRIC FALLBACK
     * ------------------------------------------------------------
     *
     * This is only used when Azure is unavailable.
     * It is deliberately conservative and does NOT pretend to be
     * equivalent to semantic Azure evaluation.
     */
    if (!evaluatedWithAzure) {
      const normalizedTranscript = transcript.toLowerCase();

      const matchedKeywords = currentQ.idealKeywords.filter(keyword =>
        normalizedTranscript.includes(keyword.toLowerCase())
      );

      const keywordCoverage =
        currentQ.idealKeywords.length > 0
          ? matchedKeywords.length / currentQ.idealKeywords.length
          : 0;

      const wordCount = transcript
        ? transcript.split(/\s+/).filter(Boolean).length
        : 0;

      /*
       * Technical score:
       * Starts from evidence coverage, then applies a penalty for
       * extremely short answers.
       */
      technicalScore = Math.round(35 + keywordCoverage * 60);

      if (wordCount === 0) {
        technicalScore = 0;
      } else if (wordCount < 12) {
        technicalScore = Math.min(technicalScore, 45);
      }

      /*
       * Relevance:
       * Keyword evidence is useful as an offline approximation.
       */
      relevanceScore = Math.round(40 + keywordCoverage * 55);

      if (wordCount === 0) {
        relevanceScore = 0;
      } else if (wordCount < 8) {
        relevanceScore = Math.min(relevanceScore, 40);
      }

      /*
       * Communication:
       * Do not equate length with communication.
       * We use basic structural signals only in fallback mode.
       */
      if (wordCount === 0) {
        communicationScore = 0;
      } else {
        const sentenceCount = Math.max(
          1,
          transcript.split(/[.!?]+/).filter(Boolean).length
        );

        const hasStructure =
          sentenceCount >= 2 ||
          /\b(first|second|because|therefore|however|for example|whereas|while)\b/i.test(
            transcript
          );

        communicationScore = hasStructure ? 75 : 60;

        if (wordCount < 8) {
          communicationScore = Math.min(communicationScore, 45);
        }
      }

      /*
       * Depth:
       * Look for reasoning/example/complexity signals rather than raw length.
       */
      const hasReasoning =
        /\b(because|therefore|why|trade[- ]off|advantage|disadvantage|when|if)\b/i.test(
          transcript
        );

      const hasExample =
        /\b(example|for instance|such as|in practice|e\.g\.)\b/i.test(
          transcript
        );

      const hasComplexity =
        /\bO\([^)]+\)|complexity|time|space|memory|latency|scalability\b/i.test(
          transcript
        );

      depthScore =
        wordCount === 0
          ? 0
          : 35 +
            (hasReasoning ? 20 : 0) +
            (hasExample ? 20 : 0) +
            (hasComplexity ? 20 : 0);

      depthScore = Math.min(100, depthScore);

      keyPointsCovered = matchedKeywords
        .slice(0, 4)
        .map(keyword => `Addressed concept: "${keyword}"`);

      if (keyPointsCovered.length === 0) {
        keyPointsCovered.push(
          'No reference keyword was detected by the offline evaluator.'
        );
      }

      const missingKeywords = currentQ.idealKeywords.filter(
        keyword => !normalizedTranscript.includes(keyword.toLowerCase())
      );

      suggestedImprovement =
        missingKeywords.length > 0
          ? `Strengthen the answer by covering: ${missingKeywords
              .slice(0, 3)
              .join(', ')}.`
          : 'Add a concrete example and explain one practical trade-off.';

      feedback =
        wordCount === 0
          ? 'No usable answer was detected, so the response could not demonstrate the required concepts.'
          : keywordCoverage >= 0.65
            ? 'The response covers several expected concepts. Improve it further with precise reasoning, examples, and relevant trade-offs.'
            : 'The response addresses only part of the expected material. Add the missing technical concepts and explain them with greater precision.';
    }

    /*
     * ------------------------------------------------------------
     * FINAL QUESTION SCORE
     * ------------------------------------------------------------
     *
     * Backend owns the formula. Azure supplies evidence for the
     * four dimensions; Azure does NOT choose the final weighted score.
     */
    const overallQScore = Math.round(
      technicalScore * 0.40 +
        relevanceScore * 0.30 +
        communicationScore * 0.20 +
        depthScore * 0.10
    );

    /*
     * Save the evaluated answer before moving to the next question.
     */
    session.answers.push({
      questionId: currentQ.id,
      questionIndex: session.currentQuestionIndex + 1,
      transcript: transcript || 'No answer transcribed.',
      score: overallQScore,
      technicalScore,
      relevanceScore,
      communicationScore,
      feedback,
      keyPointsCovered,
      suggestedImprovement,
    });

    session.currentQuestionIndex += 1;

    const isCompleted =
      session.currentQuestionIndex >= session.totalQuestions;

    let nextQuestion;

    if (!isCompleted) {
      const nq = session.questions[session.currentQuestionIndex];

      nextQuestion = {
        questionId: nq.id,
        questionIndex: session.currentQuestionIndex + 1,
        question: nq.question,
        category: nq.category,
      };
    }

    return {
      score: overallQScore,
      feedback,
      keyPointsCovered,
      suggestedImprovement,
      nextQuestion,
      isCompleted,
    };
  }

  finishSession(sessionId: string): InterviewFinishResponse {
    const session = this.sessions.get(sessionId);

    /*
     * Never fabricate a final score if the real session is missing.
     */
    if (!session) {
      throw new Error('Interview session not found or expired.');
    }

    if (session.answers.length === 0) {
      throw new Error('No evaluated answers found for this interview.');
    }

    /*
     * Final scores are averages of the actual evaluated questions.
     */
    const technicalAvg = Math.round(
      session.answers.reduce(
        (acc, answer) => acc + answer.technicalScore,
        0
      ) / session.answers.length
    );

    const relevanceAvg = Math.round(
      session.answers.reduce(
        (acc, answer) => acc + answer.relevanceScore,
        0
      ) / session.answers.length
    );

    const communicationAvg = Math.round(
      session.answers.reduce(
        (acc, answer) => acc + answer.communicationScore,
        0
      ) / session.answers.length
    );

    /*
     * Each question score already includes the 40/30/20/10 rubric,
     * so the final score is the average of the real evaluated questions.
     */
    const finalScore = Math.round(
      session.answers.reduce((acc, answer) => acc + answer.score, 0) /
        session.answers.length
    );

    const questionReviews: QuestionReview[] = session.answers.map(ans => {
      const qTemplate =
        session.questions.find(q => q.id === ans.questionId) ||
        session.questions[ans.questionIndex - 1];

      return {
        questionId: ans.questionId,
        questionIndex: ans.questionIndex,
        question: qTemplate
          ? qTemplate.question
          : 'Technical Interview Question',
        category: qTemplate
          ? qTemplate.category
          : 'General Technical',
        transcript: ans.transcript,
        score: ans.score,
        feedback: ans.feedback,
        idealAnswerHighlights: qTemplate
          ? qTemplate.idealSummary
          : [
              'Thorough technical explanation',
              'Clear reasoning and trade-off analysis',
            ],
      };
    });

    /*
     * Generate strengths from the actual question scores rather than
     * always returning the same hard-coded statements.
     */
    const strengths: string[] = [];
    const improvements: string[] = [];

    const strongestAnswers = [...session.answers]
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    const weakestAnswers = [...session.answers]
      .sort((a, b) => a.score - b.score)
      .slice(0, 2);

    if (technicalAvg >= 75) {
      strengths.push(
        'Demonstrated solid technical understanding across the evaluated answers.'
      );
    } else {
      improvements.push(
        'Strengthen technical accuracy and explain core concepts more precisely.'
      );
    }

    if (relevanceAvg >= 75) {
      strengths.push(
        'Answers generally stayed relevant to the questions asked.'
      );
    } else {
      improvements.push(
        'Answer the exact question first and cover the key parts before adding extra detail.'
      );
    }

    if (communicationAvg >= 75) {
      strengths.push(
        'Communicated technical ideas in a generally clear and understandable way.'
      );
    } else {
      improvements.push(
        'Use a clearer structure: define the concept, explain how it works, then give an example.'
      );
    }

    if (strongestAnswers.length > 0) {
      const bestQuestion = session.questions.find(
        q => q.id === strongestAnswers[0].questionId
      );

      if (bestQuestion) {
        strengths.push(
          `Performed particularly well on ${bestQuestion.category}.`
        );
      }
    }

    if (weakestAnswers.length > 0) {
      const weakQuestion = session.questions.find(
        q => q.id === weakestAnswers[0].questionId
      );

      if (weakQuestion) {
        improvements.push(
          `Review ${weakQuestion.category} and practice explaining its core concepts with examples.`
        );
      }
    }

    /*
     * Keep the report useful even when the answer set is small.
     */
    if (strengths.length === 0) {
      strengths.push(
        'Completed evaluated interview responses that can be used for further practice.'
      );
    }

    if (improvements.length === 0) {
      improvements.push(
        'Continue practicing deeper reasoning, examples, and real-world trade-offs.'
      );
    }

    const recommendations = [
      'Review the concepts identified as missing or weak in the question-level feedback.',
      'Practice answering technical questions aloud using a clear definition → reasoning → example structure.',
      'Repeat the mock interview after targeted practice and compare question-level scores.',
    ];

    const completedAt = new Date().toISOString();

    /*
     * Remove the in-memory session after generating the final report.
     * This prevents stale sessions from being reused accidentally.
     */
    this.sessions.delete(sessionId);

    return {
      sessionId: session.sessionId,
      overallScore: finalScore,
      technical: technicalAvg,
      relevance: relevanceAvg,
      communication: communicationAvg,
      strengths,
      improvements,
      recommendations,
      questionReviews,
      role: session.role,
      difficulty: session.difficulty,
      completedAt,
      aiDisclaimer:
        'Scores and feedback are AI-generated estimates based on the defined interview rubric. They are intended for preparation and learning, not as a hiring decision.',
    };
  }
}

export const interviewService = new InterviewService();
