import clientPromise from "@/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return new Response(JSON.stringify([]), { status: 200 });

    const client = await clientPromise;
    const db = client.db("quiet_hours");
    const blocks = await db.collection("blocks").find({ userId }).sort({ startTime: 1 }).toArray();

    return new Response(JSON.stringify(blocks), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
