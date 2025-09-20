import clientPromise from "@/lib/mongodb";
import { transporter } from "@/utils/email";
import { supabaseServer } from "@/lib/supabaseServer";
import { ObjectId } from "mongodb";
import type { BlockDocument } from "@/lib/models/Block";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("quiet_hours");
    const coll = db.collection<BlockDocument>("blocks");

    const now = new Date();
    const lower = new Date(now.getTime() + 10 * 60000);
    const upper = new Date(now.getTime() + 11 * 60000);

    const blocks = await coll.find({
      reminderSent: false,
      startTime: { $gte: lower.toISOString(), $lt: upper.toISOString() },
    }).toArray();

    if (!blocks.length) {
      return new Response(JSON.stringify({ message: "No reminders" }), { status: 200 });
    }

    const byUser: Record<string, BlockDocument[]> = blocks.reduce((acc, b) => {
      (acc[b.userId] ||= []).push(b);
      return acc;
    }, {} as Record<string, BlockDocument[]>);

    for (const userId of Object.keys(byUser)) {
      const userBlocks = byUser[userId];

      const { data, error } = await supabaseServer.auth.admin.getUserById(userId);
      if (error || !data?.user?.email) {
        console.error("Could not fetch user email for", userId, error);
        continue;
      }
      const email = data.user.email;

      const lines = userBlocks.map(b => {
        const start = new Date(b.startTime).toLocaleString();
        const end = new Date(b.endTime).toLocaleString();
        return `• ${start} → ${end}`;
      }).join("\n");

      const text = `Reminder: You have the following silent-study block(s) starting in ~10 minutes:\n\n${lines}\n\nGood luck! — Quiet Hours Scheduler`;

      try {
        await transporter.sendMail({
          from: `"Quiet Hours" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Quiet Hours — upcoming study block",
          text,
        });

        // ✅ Mark blocks as sent using _id, not userId
        const ids = userBlocks.map(b => new ObjectId(b._id));
        await coll.updateMany({ _id: { $in: ids } }, { $set: { reminderSent: true } });
      } catch (sendErr) {
        console.error("Failed to send mail to", email, sendErr);
      }
    }

    return new Response(JSON.stringify({ message: "Processed reminders" }), { status: 200 });
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    console.error(err);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
