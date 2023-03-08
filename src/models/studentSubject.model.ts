import mongoose from 'mongoose';
import { StudentSubjects } from '../interfaces/dkh';

const studentSubjectSchema = new mongoose.Schema<StudentSubjects>(
  {
    student_id: 'string',
    subject_code: 'number',
  },
  { collection: 'student-subjects' },
);
studentSubjectSchema.index({ student_id: 1, subject_code: 1, }, { unique: true });

const model = mongoose.model('student-subjects', studentSubjectSchema);
export default model;
