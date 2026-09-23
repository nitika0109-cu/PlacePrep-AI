import { Router, Request, Response, NextFunction } from 'express';
import { interviewService } from '../services/interviewService.js';
import { speechService } from '../services/speechService.js';
import { visionService } from '../services/visionService.js';
import {
  optionalAuth,
  requireAuth,
  AuthenticatedRequest
} from '../middleware/auth.js';
import { isSupabaseConnected } from '../config/supabase.js';
import { InterviewHistory } from '../models/InterviewHistory.js';
import { User } from '../models/User.js';

export const interviewRouter = Router();

// POST /api/interview/start
interviewRouter.post(
  '/start',
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        role = 'Software Developer',
        difficulty = 'Beginner',
        type = 'Technical',
        questions = 5
      } = req.body;

      const session = interviewService.startSession({
        role,
        difficulty,
        type,
        questions: Number(questions)
      });

      return res.json(session);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/interview/answer
interviewRouter.post(
  '/answer',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        sessionId,
        questionId,
        transcript,
        audioBase64,
        visionSignals
      } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          error: true,
          message: 'Session ID is required.'
        });
      }

      let finalTranscript = transcript;

      // Process speech transcription if transcript is not provided directly
      if (!finalTranscript && audioBase64) {
        const speechRes = await speechService.transcribeAudio(audioBase64);
        finalTranscript = speechRes.transcript;
      }

      const visionTelemetry =
        visionService.processInteractionSignals(visionSignals);

      const answerResult = await interviewService.submitAnswer({
        sessionId,
        questionId,
        transcript: finalTranscript || 'Answer submitted.',
        visionSignals
      });

      return res.json({
        ...answerResult,
        transcript: finalTranscript,
        visionNotice: visionTelemetry.notice
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/interview/finish
interviewRouter.post(
  '/finish',
  optionalAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({
          error: true,
          message: 'Session ID is required.'
        });
      }

      /*
       * IMPORTANT:
       * If this interview was already completed and saved,
       * return the saved evaluation instead of trying to finish
       * the temporary in-memory session again.
       */
      if (req.user && isSupabaseConnected()) {
        try {
          const existingReport =
            await InterviewHistory.findBySessionId(sessionId);

          if (existingReport) {
            return res.json(existingReport);
          }
        } catch (historyLookupError) {
          console.warn(
            '[Interview] Existing history lookup failed:',
            historyLookupError
          );
        }
      }

      /*
       * First completion:
       * Generate the report from the live interview session.
       */
      const report = interviewService.finishSession(sessionId);

      /*
       * Persist completed interview permanently.
       */
      if (req.user && isSupabaseConnected()) {
        try {
          const historyId = await InterviewHistory.create(
            req.user.userId,
            report
          );

          if (!historyId) {
            console.warn(
              '[Interview] Evaluation generated but history was not saved.'
            );
          } else {
            const user = await User.findById(req.user.userId);

            if (user) {
              await User.findByIdAndUpdate(req.user.userId, {
                interviewsCompleted:
                  (user.interviewsCompleted || 0) + 1,

                preparationProgress: Math.min(
                  100,
                  (user.preparationProgress || 0) + 5
                )
              });
            }
          }
        } catch (persistErr) {
          console.warn(
            '[Interview] History persistence error:',
            persistErr
          );
        }
      } else {
        console.warn(
          '[Interview] No authenticated user/Supabase connection. Evaluation cannot be stored in interview history.'
        );
      }

      return res.json(report);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/interview/history
interviewRouter.get(
  '/history',
  requireAuth,
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Unauthorized'
        });
      }

      const interviews = await InterviewHistory.findByUser(
        req.user.userId
      );

      return res.json({ interviews });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/interview/vision-notice
interviewRouter.get(
  '/vision-notice',
  (req: Request, res: Response) => {
    return res.json({
      notice: visionService.getResponsibleAiDisclaimer()
    });
  }
);
