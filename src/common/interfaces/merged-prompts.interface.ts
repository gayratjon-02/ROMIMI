export interface PromptCamera {
  focal_length_mm: number;
  aperture: number;
  focus: string;
  angle?: string;
}

export interface PromptBackground {
  wall: string;
  floor: string;
}

export interface ProductDetailsInPrompt {
  type: string;
  color: string;
  piping?: string;
  zip?: string;
  logos?: string;
  [key: string]: any;
}

export interface DAElementsInPrompt {
  background: string;
  props: string;
  mood: string;
  composition?: string;
  [key: string]: any;
}

export interface PromptOutput {
  resolution: string;
  aspect_ratio: string;
}

export interface MergedPromptObject {
  visual_id: string;      // "visual_2_solo_adult"
  shot_type: string;     // "solo", "duo"
  model_type: string;    // "adult", "kid"
  gemini_prompt: string; // The main prompt
  negative_prompt: string;
  output: PromptOutput;

  // Legacy/Helper fields (kept for internal logic if needed, but output must prioritize above)
  display_name?: string;
  editable?: boolean;
  last_edited_at?: string | null;
  // Deprecated but might be needed until full cleanup
  prompt?: string; // @deprecated use gemini_prompt
  camera?: PromptCamera;
  background?: PromptBackground;
  product_details?: ProductDetailsInPrompt;
  da_elements?: DAElementsInPrompt;
}

export interface MergedPrompts {
  duo: MergedPromptObject;
  solo: MergedPromptObject;
  flatlay_front: MergedPromptObject;
  flatlay_back: MergedPromptObject;
  closeup_front: MergedPromptObject;
  closeup_back: MergedPromptObject;
}
