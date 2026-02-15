"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { user, signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(email, password, name, phone);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500 rounded-lg p-8 shadow-2xl shadow-purple-500/50">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">⚔️ JOIN CTF</h1>
            <p className="text-gray-400 text-sm font-bold tracking-widest">CREATE YOUR HACKER ACCOUNT</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-4 text-sm font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-purple-400 mb-2 tracking-wider">HACKER NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition font-bold"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-purple-400 mb-2 tracking-wider">EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition font-bold"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-purple-400 mb-2 tracking-wider">PHONE NUMBER</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition font-bold"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-purple-400 mb-2 tracking-wider">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded text-white focus:border-pink-500 focus:outline-none placeholder-gray-500 transition font-bold"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-lg rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/50"
            >
              {loading ? "⏳ CREATING..." : "⚡ CREATE ACCOUNT"}
            </button>
          </form>

          <p className="text-gray-400 text-center mt-6 text-sm">
            Already a hacker?{" "}
            <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-black transition">
              LOGIN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
