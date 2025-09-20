"use client";
import { useEffect, useState } from "react";

export default function BlockList({ userId }) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/blocks/list?userId=${userId}`);
    const data = await res.json();
    setBlocks(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await fetch("/api/blocks/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, blockId: id }),
    });
    load();
  };

  if (loading) return <div>Loading blocks...</div>;
  if (!blocks.length) return <div>No blocks yet.</div>;

  return (
    <ul className="space-y-3">
      {blocks.map(b => (
        <li key={b._id} className="flex justify-between items-center border p-3">
          <div>
            <div className="font-medium">{new Date(b.startTime).toLocaleString()}</div>
            <div className="text-sm text-gray-500">{new Date(b.endTime).toLocaleString()}</div>
            <div className="text-xs mt-1">{b.reminderSent ? "Reminder sent" : "Reminder pending"}</div>
          </div>
          <div>
            <button onClick={() => handleDelete(b._id)} className="text-red-600">Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
