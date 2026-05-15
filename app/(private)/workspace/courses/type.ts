export type Course = {
  id: string;
  title: string;
  about?: string;
  image?: string | null;
  category?: string;
  enrolled?: number;
};
