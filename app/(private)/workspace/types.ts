export type UserProfile = {
  id: number;

  first_name: string;
  middle_name?: string | null;
  last_name: string;

  email: string;

  age?: number | null;
  phone?: string | null;
  date_of_birth?: string | null;

  gender?: string | null;
  avatar?: string | null;

  address_line?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postal_code?: string | null;

  bio?: string | null;

  created_at: string;
  updated_at: string;

  in_progress_count?: number;
  completed_count?: number;

  // 🎯 ADD THIS BLOCK: Tells TypeScript how to parse the active module payload
  active_module?: {
    id: string;
    title: string;
    description: string;
    progress_percentage?: number;
  } | null;
};
