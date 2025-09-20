import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface DeleteBlockBody {
  userId: string;
  blockId: string;
} 

export async function DELETE(req:Request):Promise<Response> {
  try {
    const body:DeleteBlockBody = await req.json();
    const { userId, blockId } = body;
    if (!userId || !blockId) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

    const client = await clientPromise;
    const db = client.db("quiet_hours");
    await db.collection("blocks").deleteOne({ _id: new ObjectId(blockId), userId });

    return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
  }  catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
