"use client";
import { useState } from "react";

export default function BlockForm({ userId, onCreated }) {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    return new Date(`${date}T${time}:00`);
  };

  const handle = async (e) => {
    e?.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const start = combineDateTime(startDate, startTime);
      const end = combineDateTime(endDate, endTime);

      if (!start || !end) throw new Error("Please select date and time");

      const res = await fetch("/api/blocks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");

      // reset
      setStartDate(""); setStartTime("");
      setEndDate(""); setEndTime("");
      onCreated?.();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4 mb-6">
      <div>
        <label className="block mb-1 font-medium">Start</label>
        <div className="flex gap-2">
          <input
            required
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded w-1/2 bg-white text-black"
          />
          <input
            required
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-2 rounded w-1/2 bg-white text-black"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 font-medium">End</label>
        <div className="flex gap-2">
          <input
            required
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded w-1/2 bg-white text-black"
          />
          <input
            required
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border p-2 rounded w-1/2 bg-white text-black"
          />
        </div>
      </div>

      {err && <div className="text-red-600">{err}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Saving..." : "Add Block"}
      </button>
    </form>
  );
}
