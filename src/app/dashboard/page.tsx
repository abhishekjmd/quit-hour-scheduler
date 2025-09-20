"use client";
import { useEffect, useState } from "react";
import { supaBase } from "@/lib/supabaseClient";
import BlockForm from "@/components/BlockForm";
import BlockList from "@/components/BlockList";

export default function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data } = await supaBase.auth.getUser();
      if (data?.user) setUserId(data.user.id);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="mt-10 text-center">Loading...</div>;
  if (!userId) return <div className="mt-10 text-center">Not logged in</div>;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl mb-4">Your Study Blocks</h1>
      <BlockForm userId={userId} onCreated={() => window.location.reload()} />
      <BlockList userId={userId} />
    </div>
  );
}
