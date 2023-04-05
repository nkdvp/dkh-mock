import mongoose from 'mongoose';
import { Users } from '../interfaces/users';

const mainSchema = new mongoose.Schema<Users>(
  {
    username: String,
    password: String,
  },
  {
    collection: 'users',
    _id: false,
  },
);
mainSchema.index({ username: 1 }, { unique: true });
mainSchema.index({ username: 1, password: 1 });

const model = mongoose.model('users', mainSchema);
export default model;
