export interface Lesson {
  id: string;
  title: string;
  description: string;
}

export interface LaravelLessonResponse {
  success: boolean;
  data: Lesson[];
}
