"use client";
import { useState } from "react";
import { supaBase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [err, setErr] = useState("");

  const handleAuth = async () => {
    setErr("");
    try {
      if (isLogin) {
        const { error } = await supaBase.auth.signInWithPassword({ email, password });
        if (error) { setErr(error.message); return; }
        router.push("/dashboard");
      } else {
        const { error } = await supaBase.auth.signUp({ email, password });
        if (error) { setErr(error.message); return; }
        alert("Signed up — confirm via email if required. Now login.");
        setIsLogin(true);
      }
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl mb-4">Quiet Hours Scheduler</h1>

      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border px-3 py-2 mb-2" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="border px-3 py-2 mb-2" />

      {err && <div className="text-red-600 mb-2">{err}</div>}

      <button onClick={handleAuth} className="bg-blue-600 text-white px-4 py-2 rounded">
        {isLogin ? "Login" : "Register"}
      </button>

      <p className="text-blue-500 mt-4 cursor-pointer" onClick={() => setIsLogin(v => !v)}>
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
      </p>
    </div>
  );
}
