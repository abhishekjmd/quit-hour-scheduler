import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { userId, blockId } = body;
    if (!userId || !blockId) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    const client = await clientPromise;
    const db = client.db("quiet_hours");
    await db.collection("blocks").deleteOne({ _id: new ObjectId(blockId), userId });

    return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
