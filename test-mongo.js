import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
console.log("Testing URI:", uri);

const client = new MongoClient(uri);
try {
  await client.connect();
  console.log("✅ Connected successfully");
  await client.db("quiet_hours").command({ ping: 1 });
  console.log("✅ Ping worked");
} catch (err) {
  console.error("❌ Connection failed:", err);
} finally {
  await client.close();
}
