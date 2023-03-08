export interface Subjects {
  subject_name: string;
  subject_code: string;
  subject_lecture: string;
  subject_schedule: string;

  registered_count: number;
  limit_count: number;
}

export interface StudentSubjects {
  student_id: string;
  subject_code: string;
}

export interface StudentSelection {
  student_id: string;
  subject_code: string;
}
