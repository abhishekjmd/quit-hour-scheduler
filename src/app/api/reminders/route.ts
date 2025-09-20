import clientPromise from "@/lib/mongodb";
import { transporter } from "@/utils/email";
import { supabaseServer } from "@/lib/supabaseServer";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("quiet_hours");
    const coll = db.collection("blocks");

    const now = new Date();
    // want blocks starting about 10 minutes from now.
    // We'll select blocks where startTime is between now+10min and now+11min to capture the run.
    const lower = new Date(now.getTime() + 10 * 60000);
    const upper = new Date(now.getTime() + 11 * 60000);

    // find blocks that haven't had reminders sent
    const blocks = await coll.find({
      reminderSent: false,
      startTime: { $gte: lower.toISOString(), $lt: upper.toISOString() },
    }).toArray();

    if (!blocks.length) {
      return new Response(JSON.stringify({ message: "No reminders" }), { status: 200 });
    }

    // group by userId
    const byUser = blocks.reduce((acc, b) => {
      (acc[b.userId] ||= []).push(b);
      return acc;
    }, {});

    for (const userId of Object.keys(byUser)) {
      const userBlocks = byUser[userId];

      // fetch user's email from Supabase (server-side)
      const { data, error } = await supabaseServer.auth.admin.getUserById(userId);
      if (error || !data?.user?.email) {
        console.error("Could not fetch user email for", userId, error);
        // optionally mark as failed or skip marking so future runs can try again
        continue;
      }
      const email = data.user.email;

      // build message: list block times
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

        // mark all blocks as reminderSent: true
        const ids = userBlocks.map(b => new ObjectId(b._id));
        await coll.updateMany({ _id: { $in: ids } }, { $set: { reminderSent: true } });
      } catch (sendErr) {
        console.error("Failed to send mail to", email, sendErr);
        // don't mark sent so next cron attempt can retry
      }
    }

    return new Response(JSON.stringify({ message: "Processed reminders" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
