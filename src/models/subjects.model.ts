import mongoose from 'mongoose';
import { Subjects } from '../interfaces/dkh';

const subjectsSchema = new mongoose.Schema<Subjects>(
  {
    subject_name: 'string',
    subject_code: 'string',
    subject_lecture: 'string',
    subject_schedule: 'string',
    registered_count: {
      type: Number,
      default: 0,
    },
    limit_count: {
      type: Number,
      default: 30,
    },
  },
  { collection: 'subjects' },
);

subjectsSchema.index({ subject_code: 1 });

const model = mongoose.model('subjects', subjectsSchema);
export default model;
