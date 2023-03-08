export interface Subjects {
  subject_name: string;
  subject_code: number;
  subject_lecture: string;
  subject_schedule: string;

  registered_count: number;
  limit_student: number;
}

export interface StudentSubjects {
  student_id: string;
  subject_code: number;
}

export interface StudentSelection {
  student_id: string;
  subject_code: number;
}
