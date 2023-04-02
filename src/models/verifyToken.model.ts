import mongoose from 'mongoose';
import { VerifyToken } from '../interfaces/verifyTokens';

const mainSchema = new mongoose.Schema<VerifyToken>(
  {
    csrf1: String,
    csrf2: String,

    sessionId: {
      type: String,
      default: null,
    },
    userId: {
      type: String,
      default: null,
    },
    sessionStartAt: {
      type: String,
      default: null,
    },
  
    createdAt: Date,
    returnAt: Date,
  },
  {
    collection: 'verify-tokens',
  },
);

const model = mongoose.model('verifyTokens', mainSchema);
export default model;
