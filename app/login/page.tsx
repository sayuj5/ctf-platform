"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting login with email:", email);
      await login(email, password);
      console.log("Login successful");
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      console.error("Login error:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 rounded-lg p-8 shadow-2xl shadow-yellow-500/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">⚔️ CTF ARENA</h1>
            <p className="text-gray-400 text-sm font-bold tracking-widest">HACKER LOGIN</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-4 text-sm font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-yellow-400 mb-2 tracking-wider">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white focus:border-cyan-500 focus:outline-none placeholder-gray-500 transition font-bold"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-yellow-400 mb-2 tracking-wider">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white focus:border-cyan-500 focus:outline-none placeholder-gray-500 transition font-bold"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-lg rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/50"
            >
              {loading ? "⏳ LOGGING IN..." : "⚡ LOGIN"}
            </button>
          </form>

          <p className="text-gray-400 text-center mt-6 text-sm">
            New hacker?{" "}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-black transition">
              CREATE ACCOUNT
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
