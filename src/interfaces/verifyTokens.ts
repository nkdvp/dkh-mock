export interface VerifyToken {
  csrf1: string;
  csrf2: string;

  sessionId?: string;
  userId?: string;
  sessionStartAt?: string;

  createdAt: Date;
  returnAt: Date;
}
