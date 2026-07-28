export interface ProfileData {
  // Personal Identity
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  age?: number | string;
  gender?: string;
  date_of_birth?: string;
  birthday?: string;

  // Contact & Location
  phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;

  // Avatar & Bio
  avatar?: string;
  bio?: string;
}

export interface BasicInfoFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  age: string;
  gender: string;
  birthday: string;
}

export interface ContactLocationFormData {
  phone: string;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface AvatarBioFormData {
  bio: string;
  avatarFile: File | null;
}
