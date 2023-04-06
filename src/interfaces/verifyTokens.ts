export interface VerifyToken {
  csrf1: string;
  csrf2: string;

  sessionId?: string;
  userId?: string;
  sessionExpiredAt?: string;

  createdAt: Date;
  returnAt: Date;
}
