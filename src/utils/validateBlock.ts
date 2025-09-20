export async function hasOverlap(db, userId, startISO, endISO) {
  // overlapping condition:
  // new.start < existing.end && new.end > existing.start
  const start = new Date(startISO);
  const end = new Date(endISO);

  return await db.collection("blocks").findOne({
    userId,
    $expr: {
      $and: [
        { $lt: ["$startTimeDate", end] },   // will discuss startTimeDate below
        { $gt: ["$endTimeDate", start] }
      ]
    }
  });
}
