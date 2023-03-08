import mongoose from 'mongoose';
import { StudentSubjects } from '../interfaces/dkh';

const studentSubjectSchema = new mongoose.Schema<StudentSubjects>(
  {
    student_id: 'string',
    subject_code: 'string',
  },
  { collection: 'subjects' },
);
studentSubjectSchema.index({ subject_code: 1 }, { unique: true });

const model = mongoose.model('subjects', studentSubjectSchema);
export default model;
