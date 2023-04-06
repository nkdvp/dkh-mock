import mongoose from 'mongoose';
import { Users } from '../interfaces/users';

const mainSchema = new mongoose.Schema<Users>(
  {
    userId: String,
    username: String,
    password: String,
    meta: Object,
  },
  {
    collection: 'users',
    _id: false,
  },
);
mainSchema.index({ userId: 1 }, { unique: true });
mainSchema.index({ userId: 1, password: 1 });

const model = mongoose.model('users', mainSchema);
export default model;
