import mongoose from 'mongoose';
import { VerifyToken } from '../interfaces/verifyTokens';

const mainSchema = new mongoose.Schema<VerifyToken>(
  {
    csrf1: String,
    csrf2: String,

    createdAt: Date,
  },
  {
    collection: 'verify-tokens',
  },
);

const model = mongoose.model('verifyTokens', mainSchema);
export default model;
