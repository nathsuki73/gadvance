export type Course = {
  id: string;
  title: string;
  description?: string;
  image?: string | null;
  category?: string;
  enrolled?: number;
  duration?: number;
};
