import { MongoClient } from "mongodb";

console.log("MONGODB_URI =>", process.env.MONGODB_URI);

const client = new MongoClient(process.env.MONGODB_URI as string);
const clientPromise = client.connect();

export default clientPromise;
