interface CreateBlockInput {
  userId: string;
  startTime: string | Date; // can be ISO string or Date
  endTime: string | Date;
}

export interface BlockDocument {
  userId: string;
  startTime: string;  // stored as ISO string
  endTime: string;    // stored as ISO string
  createdAt: string;  // ISO string
  reminderSent: boolean;
}

export function createBlockDocument({ userId, startTime, endTime }:CreateBlockInput):BlockDocument {
  // store as ISO strings to avoid SSR locale mismatches
  return {
    userId,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    createdAt: new Date().toISOString(),
    reminderSent: false, // track if reminder was already sent
  };
}