'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, CheckCircle2, AlertTriangle, Users, Smartphone, User } from 'lucide-react';
import { loadDetectionModel, detectFrame } from '../../lib/detection';
import { ViolationType } from '../../lib/violations';

interface VideoPreviewProps {
  isMicActive: boolean;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onViolation?: (type: ViolationType) => void;
  onViolationCleared?: (type: ViolationType) => void;
  onFaceCountChange?: (count: number) => void;
}

const SUSTAIN_MS = 3000;
const CHECK_INTERVAL_MS = 1000;

type CameraViolation = 'no_face' | 'multiple_faces' | 'phone_detected';

interface EpisodeTracker {
  activeSince: number | null;
  fired: boolean;
}

const freshTrackers = (): Record<CameraViolation, EpisodeTracker> => ({
  no_face: { activeSince: null, fired: false },
  multiple_faces: { activeSince: null, fired: false },
  phone_detected: { activeSince: null, fired: false },
});

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  isMicActive,
  isCameraActive,
  onToggleCamera,
  onToggleMic,
  onViolation,
  onViolationCleared,
  onFaceCountChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [personCount, setPersonCount] = useState<number | null>(null);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'failed'>('loading');

  const trackersRef = useRef<Record<CameraViolation, EpisodeTracker>>(freshTrackers());

  // Camera acquisition
  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function initCamera() {
      if (isCameraActive) {
        try {
          localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
          });
          setStream(localStream);
          setHasPermission(true);
        } catch (err) {
          console.warn('Camera access not granted or not available:', err);
          setHasPermission(false);
        }
      } else {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }

    initCamera();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive]);

  // Attach the stream to the <video> element whenever it changes.
  // This is separate from the acquisition effect above specifically so it
  // re-runs any time the ref or the stream itself becomes available,
  // regardless of render timing — this is what fixes the "have to toggle
  // camera off/on to see video" bug.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Detection loop
  useEffect(() => {
    if (!isCameraActive || !hasPermission) {
      setPersonCount(null);
      setPhoneDetected(false);
      trackersRef.current = freshTrackers();
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const evaluate = (type: CameraViolation, isTrueNow: boolean, now: number) => {
      const t = trackersRef.current[type];
      if (isTrueNow) {
        if (t.activeSince === null) t.activeSince = now;
        if (!t.fired && now - t.activeSince >= SUSTAIN_MS) {
          t.fired = true;
          onViolation?.(type);
        }
      } else if (t.activeSince !== null) {
        t.activeSince = null;
        if (t.fired) {
          t.fired = false;
          onViolationCleared?.(type);
        }
      }
    };

    loadDetectionModel()
      .then(() => {
        if (cancelled) return;
        setModelStatus('ready');
        intervalId = setInterval(async () => {
          if (!videoRef.current || cancelled) return;
          const now = Date.now();

          const { personCount: count, phoneDetected: found } = await detectFrame(videoRef.current);
          if (cancelled) return;

          setPersonCount(count);
          setPhoneDetected(found);
          onFaceCountChange?.(count);

          evaluate('no_face', count === 0, now);
          evaluate('multiple_faces', count > 1, now);
          evaluate('phone_detected', found, now);
        }, CHECK_INTERVAL_MS);
      })
      .catch(() => {
        setModelStatus('failed');
      });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraActive, hasPermission]);

  const badge = (() => {
    if (modelStatus === 'failed') return { text: 'Detection Unavailable', tone: 'neutral' as const, icon: null };
    if (personCount === null) return { text: 'Calibrating...', tone: 'neutral' as const, icon: null };
    if (phoneDetected) return { text: 'Phone Detected', tone: 'danger' as const, icon: 'phone' as const };
    if (personCount === 0) return { text: 'Not Detected', tone: 'danger' as const, icon: 'warn' as const };
    if (personCount > 1) return { text: `${personCount} People Detected`, tone: 'danger' as const, icon: 'users' as const };
    return { text: 'Framing: Centered', tone: 'ok' as const, icon: 'ok' as const };
  })();

  return (
    <div className="relative bg-[#060608] border border-white/[0.08] rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center shadow-lg">
      {isCameraActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
          {!hasPermission && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-[#060608]">
              <div className="w-20 h-20 rounded-full bg-[#0E0E14] border border-white/10 flex items-center justify-center text-neutral-400">
                <User className="w-10 h-10 text-purple-400/80" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-200">
                  {hasPermission === false ? 'Camera Access Denied' : 'Requesting camera access...'}
                </p>
                <p className="text-xs text-neutral-400">
                  {hasPermission === false ? 'Please allow camera permissions and retry.' : 'Please allow the permission prompt.'}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div className="w-20 h-20 rounded-full bg-[#0E0E14] border border-white/10 flex items-center justify-center text-neutral-400">
            <User className="w-10 h-10 text-purple-400/80" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-200">Candidate Video Feed</p>
            <p className="text-xs text-neutral-400">Camera is muted</p>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-xs">
          <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
          <span className="text-neutral-200 font-medium">
            {isCameraActive ? 'Candidate Feed' : 'Camera Off'}
          </span>
        </div>

        {isCameraActive && hasPermission && (
          <div
            className={`flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1 rounded-full border text-[11px] ${
              badge.tone === 'danger'
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-black/80 border-white/10 text-neutral-300'
            }`}
          >
            {badge.icon === 'phone' && <Smartphone className="w-3.5 h-3.5 text-red-400" />}
            {badge.icon === 'users' && <Users className="w-3.5 h-3.5 text-red-400" />}
            {badge.icon === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
            {badge.icon === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
            <span>{badge.text}</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-3">
        <button
          onClick={onToggleMic}
          type="button"
          className={`p-2.5 rounded-full border transition-all ${
            isMicActive
              ? 'bg-[#0E0E14]/90 border-white/10 text-white hover:bg-white/10'
              : 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
          }`}
          title={isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {isMicActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleCamera}
          type="button"
          className={`p-2.5 rounded-full border transition-all ${
            isCameraActive
              ? 'bg-[#0E0E14]/90 border-white/10 text-white hover:bg-white/10'
              : 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
          }`}
          title={isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};