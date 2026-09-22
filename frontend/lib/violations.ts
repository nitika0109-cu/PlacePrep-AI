export type ViolationType =
  | 'no_face'
  | 'multiple_faces'
  | 'phone_detected'
  | 'tab_switch'
  | 'dev_tools'
  | 'copy_paste'
  | 'right_click';

// no_face and multiple_faces get a 5-second grace countdown on the 2nd offense.
// Everything else cancels immediately on the 2nd offense.
export const GRACE_COUNTDOWN_TYPES: ViolationType[] = ['no_face', 'multiple_faces'];

export const VIOLATION_COPY: Record<ViolationType, { warning: string; cancelTitle: string; cancelBody: string; terminated: string }> = {
  no_face: {
    warning: "You moved out of frame. This is your one warning — a second violation will end the interview.",
    cancelTitle: 'Return to Frame',
    cancelBody: "You've moved out of frame again. The interview will be cancelled in:",
    terminated: 'This session was ended because you were out of frame for too long, more than once.',
  },
  multiple_faces: {
    warning: 'Multiple people detected in frame. This is your one warning — a second violation will end the interview.',
    cancelTitle: 'Multiple People Detected',
    cancelBody: 'Only the candidate should be visible on camera. The interview will be cancelled in:',
    terminated: 'This session was ended because multiple people were detected on camera, more than once.',
  },
  phone_detected: {
    warning: 'A phone was detected in your camera frame. This is your one warning — a second detection will end the interview immediately.',
    cancelTitle: '',
    cancelBody: '',
    terminated: 'This session was ended because a phone was detected in your camera frame a second time.',
  },
  tab_switch: {
    warning: "Switching tabs or windows isn't allowed during the interview. This is your one warning — doing it again will end the interview immediately.",
    cancelTitle: '',
    cancelBody: '',
    terminated: 'This session was ended because you switched away from the interview tab or window a second time.',
  },
  dev_tools: {
    warning: 'Browser developer tools were detected. This is your one warning — opening them again will end the interview immediately.',
    cancelTitle: '',
    cancelBody: '',
    terminated: 'This session was ended because developer tools were opened a second time.',
  },
  copy_paste: {
    warning: "Pasting text isn't allowed during the interview. This is your one warning — doing it again will end the interview immediately.",
    cancelTitle: '',
    cancelBody: '',
    terminated: 'This session was ended because pasted text was submitted a second time.',
  },
  right_click: {
    warning: 'Right-click is disabled during the interview. This is your one warning — doing it again will end the interview immediately.',
    cancelTitle: '',
    cancelBody: '',
    terminated: 'This session was ended because right-click was used a second time.',
  },
};