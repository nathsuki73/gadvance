export interface ProfileData {
  // Personal Identity
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  age?: number | string;
  gender?: string;
  date_of_birth?: string;
  birthday?: string;

  // Academic Profile
  college?: string;
  program?: string;
  yearLevel?: string;
  year_level?: string;
}

export interface ProfileFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  age: string;
  gender: string;
  birthday: string;
}

export interface AcademicFormData {
  college: string;
  program: string;
  yearLevel: string;
}
