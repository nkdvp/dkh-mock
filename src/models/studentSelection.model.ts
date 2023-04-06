import mongoose from 'mongoose';
import { StudentSubjects } from '../interfaces/dkh';

const studentSubjectSelectionSchema = new mongoose.Schema<StudentSubjects>(
  {
    userId: 'string',
    subject_code: 'number',
  },
  { collection: 'student-subjects-selection' },
);
studentSubjectSelectionSchema.index({ userId: 1, subject_code: 1 }, { unique: true });

const model = mongoose.model('student-subjects-selection', studentSubjectSelectionSchema);
export default model;
