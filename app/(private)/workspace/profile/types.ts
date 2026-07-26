export interface ProfileData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  age?: number | string;
  gender?: string;
  date_of_birth?: string;
  birthday?: string;
  phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  bio?: string;
  avatar?: string;
}

export interface ProfileFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  age: string;
  gender: string;
  birthday: string;
}
