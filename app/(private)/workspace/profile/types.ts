export interface ProfileFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  age: string;
  gender: string;
  birthday: string;
}

export type ProfileApiData = {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  age?: number | string | null;
  gender?: string | null;
  birthday?: string | null;
  date_of_birth?: string | null;
};