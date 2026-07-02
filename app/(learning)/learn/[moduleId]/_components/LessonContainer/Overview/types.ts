export interface Lesson {
  description: string;
}

export interface LaravelLessonResponse {
  success: boolean;
  data: Lesson[];
}
