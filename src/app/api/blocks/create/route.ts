import clientPromise from "@/lib/mongodb";
import { BlockDocument, createBlockDocument } from "@/lib/models/Block";

interface CreateBlockBody {
  userId: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export async function POST(req:Request):Promise<Response> {
  try {
    const body = await req.json();
    const { userId, startTime, endTime } = body;

    if (!userId || !startTime || !endTime) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return new Response(JSON.stringify({ error: "Invalid dates" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("quiet_hours");
    const coll = db.collection<BlockDocument>("blocks");

    // Prevent overlap: check if any existing block overlaps
    // overlap condition: new.start < existing.end && new.end > existing.start
    const overlap = await coll.findOne({
      userId,
      $and: [
        { startTime: { $lt: end.toISOString() } },
        { endTime: { $gt: start.toISOString() } },
      ],
    });

    if (overlap) {
      return new Response(JSON.stringify({ error: "Overlapping block exists" }), { status: 400 });
    }

    const doc = createBlockDocument({ userId, startTime: start.toISOString(), endTime: end.toISOString() });
    const result = await coll.insertOne(doc);

    return new Response(JSON.stringify({ message: "Block created", id: result.insertedId }), { status: 200 });
  }  catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
