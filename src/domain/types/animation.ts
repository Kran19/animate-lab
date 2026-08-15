export type AnimationType =
  | 'scroll_triggered'
  | 'hover'
  | 'mouse_follow'
  | 'timeline'
  | 'canvas_loop'
  | 'shader'
  | 'svg_morph'
  | 'text_reveal'
  | 'parallax';

export type AnimationLibrary =
  | 'gsap'
  | 'scrolltrigger'
  | 'framer_motion'
  | 'css_animations'
  | 'web_animations_api'
  | 'lottie'
  | 'three_js'
  | 'anime_js'
  | 'lenis'
  | 'custom';

export interface AnimationEvidence {
  runtimeEvidence: string;
  domEvidence: string;
  scriptEvidence: string;
  networkEvidence?: string;
  confidence: number;
}

export interface Animation {
  id: string;
  websiteId: string;
  websiteName: string;
  pageId: string;
  pagePath: string;
  sectionId?: string;
  componentCandidateId?: string;
  name: string;
  type: AnimationType;
  library: AnimationLibrary;
  affectedElements: string;
  durationMs: number;
  delayMs: number;
  easing: string;
  trigger: string; // e.g. "Viewport entry", "Scroll distance 200px", "Mouse hover"
  animatedProperties: string[];
  evidence: AnimationEvidence;
  codeSnippet: string;
  createdAt: string;
}
