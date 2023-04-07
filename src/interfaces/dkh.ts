export interface Subjects {
  subject_name: string;
  subject_code: number;
  subject_lecture: string;
  subject_schedule: string;

  slot_left: number;
  slot_limit: number;
}

export interface StudentSubjects {
  userId: string;
  subject_code: number;
  to_remove: boolean;
}

export interface StudentSelection {
  userId: string;
  subject_code: number;
}
