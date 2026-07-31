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

  // PSGC Database Columns
  region_name?: string;
  region_code?: string;
  province_name?: string;
  province_code?: string;
  mun_city_name?: string;
  mun_city_code?: string;
  barangay_name?: string;
  barangay_code?: string;

  // Avatar & Bio
  avatar?: string;
  bio?: string;

  // Nested Profile Relations (for API responses)
  profile?: ProfileData;
  user_profile?: ProfileData;
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
  region_name?: string;
  region_code?: string;
  province_name?: string;
  province_code?: string;
  mun_city_name?: string;
  mun_city_code?: string;
  barangay_name?: string;
  barangay_code?: string;
}

export interface AvatarBioFormData {
  bio: string;
  avatarFile: File | null;
}