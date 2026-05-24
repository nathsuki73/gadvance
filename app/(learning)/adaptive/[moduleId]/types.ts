export type LessonProgressItem = {
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  percentage: number;
};

export type PreferenceType = "video" | "reading" | null;

export type ProgressData = {
  completed_blocks: number;
  total_blocks: number;
  percentage: number;
  completed_block_ids: string[];
  completed_quiz_lessons: string[];
  active_quiz_lesson_id: string | null;
  active_quiz_attempt_id: string | null;
  latest_activity_lesson_id: string | null;
  lessons_progress: Record<string, LessonProgressItem>;
};

export type AdaptiveRecipe = {
  status: string;
  student_context: string;
  target_bloom_tier: string;
  predicted_learning_tags: Array<{ label: string; confidence: number }>;
  recommended_blocks: any[];
  recommended_quizzes: any[];
};
