export function createBlockDocument({ userId, startTime, endTime }) {
  // store as ISO strings to avoid SSR locale mismatches
  return {
    userId,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    createdAt: new Date().toISOString(),
    reminderSent: false, // track if reminder was already sent
  };
}