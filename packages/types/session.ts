import { Timestamp } from './index';

export enum SessionExpiredPlan {
  // hours
  min6 = 0.1,
  min12 = 0.2,
  hour1 = 1,
  hour3 = 3,
  hour12 = 12,
  hour24 = 24,
  always = 'Infinity',
}
export type SessionInfo = {
  createTime: Timestamp;
  expiredPlan: SessionExpiredPlan;
  expiredTime: Timestamp;
  signature: string;
};
