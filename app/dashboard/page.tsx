"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Flag = {
  id: string;
  flag_name: string;
  description: string;
  points: number;
};

type Submission = {
  flag_id: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [flagInput, setFlagInput] = useState("");
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadFlags();
      loadSubmissions();
    }
  }, [user]);

  const loadFlags = async () => {
    try {
      const { data, error } = await supabase.from("flags").select("*");
      if (error) throw error;
      setFlags(data || []);
    } catch (err) {
      console.error("Failed to load flags:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      if (!user) return;
      const { data, error } = await supabase
        .from("submissions")
        .select("flag_id")
        .eq("user_id", user.id);
      if (error) throw error;
      setSubmissions(data || []);
      
      // Calculate total points
      const pointsData = await supabase
        .from("submissions")
        .select("flags(points)")
        .eq("user_id", user.id);
      
      if (pointsData.data) {
        const total = pointsData.data.reduce((sum: number, item: any) => {
          return sum + (item.flags?.points || 0);
        }, 0);
        setTotalPoints(total);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    }
  };

  const handleFlagSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlagId || !flagInput.trim()) return;

    setSubmitting(true);
    setMessage("");

    try {
      if (!user) throw new Error("User not found");

      // Get the flag value from the selected flag ID to verify
      const { data: flagData } = await supabase
        .from("flags")
        .select("flag_value")
        .eq("id", selectedFlagId)
        .single();

      if (flagData?.flag_value !== flagInput.trim()) {
        setMessage("❌ Incorrect flag!");
        setSubmitting(false);
        return;
      }

      // Check if already submitted
      const { data: existingSubmission } = await supabase
        .from("submissions")
        .select("id")
        .eq("user_id", user.id)
        .eq("flag_id", selectedFlagId)
        .single();

      if (existingSubmission) {
        setMessage("⚠️ You already submitted this flag!");
        setSubmitting(false);
        return;
      }

      // Submit the flag
      const { error } = await supabase.from("submissions").insert({
        user_id: user.id,
        flag_id: selectedFlagId,
      });

      if (error) throw error;

      setMessage("✅ Flag submitted successfully!");
      setFlagInput("");
      setSelectedFlagId(null);
      loadSubmissions();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!user) throw new Error("User not found");

      const { error } = await supabase.from("downloads").insert({
        user_id: user.id,
      });

      if (error && error.code !== "23505") throw error; // 23505 is unique constraint violation

      setDownloaded(true);
      setMessage("✅ Download link generated! (Check your email or click below)");
      
      // Simulate download - in production, this would be a real download link
      const link = document.createElement("a");
      link.href = process.env.NEXT_DOWNLOAD_LINK || '';
      link.download = "vulnerable-machine.iso";
      link.click();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Download failed");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.is_admin;
  const submittedFlagIds = submissions.map((s) => s.flag_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-black border-b-2 border-cyan-500 shadow-2xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-6">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">⚔️ CTF ARENA</h1>
            <p className="text-cyan-300 font-bold text-lg">{user.name}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center bg-gray-800 border border-cyan-500 rounded-lg p-4 shadow-lg">
              <p className="text-gray-400 text-sm">TOTAL POINTS</p>
              <p className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-yellow-400 bg-clip-text text-transparent">{totalPoints}</p>
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg"
              >
                🔐 ADMIN
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {message && (
          <div
            className={`p-4 rounded-lg border-2 font-bold text-lg animate-pulse ${
              message.includes("✅")
                ? "bg-green-900/50 border-green-500 text-green-300"
                : message.includes("❌")
                ? "bg-red-900/50 border-red-500 text-red-300"
                : "bg-yellow-900/50 border-yellow-500 text-yellow-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Vulnerable Image Download Section */}
        <section className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-500 rounded-lg p-8 shadow-2xl transform hover:scale-105 transition">
          <h2 className="text-2xl font-black text-cyan-400 mb-4">💾 VULNERABLE MACHINE</h2>
          <p className="text-gray-300 mb-6 text-lg">Download the target system to begin your exploitation challenges.</p>
          <button
            onClick={handleDownload}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-black rounded-lg transition transform hover:scale-110 shadow-lg text-lg"
          >
            📥 DOWNLOAD MACHINE
          </button>
        </section>

        {/* Flags Section */}
        <section className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-500 rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-green-400 mb-8">🚩 FLAGS TO CAPTURE</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className={`border-2 rounded-lg p-6 cursor-pointer transition transform hover:scale-105 ${
                  submittedFlagIds.includes(flag.id)
                    ? "bg-gradient-to-br from-green-900 to-green-800 border-green-400 shadow-lg shadow-green-500/50"
                    : "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50"
                }`}
                onClick={() => setSelectedFlagId(flag.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-black text-white">{flag.flag_name}</h3>
                  <span className={`font-black text-lg ${submittedFlagIds.includes(flag.id) ? 'text-green-300' : 'text-yellow-400'}`}>
                    {flag.points} pts
                  </span>
                </div>
                {submittedFlagIds.includes(flag.id) && (
                  <p className="text-green-300 text-sm font-bold">✅ CAPTURED</p>
                )}
              </div>
            ))}
          </div>

          {/* Flag Input Form */}
          {selectedFlagId && (
            <form onSubmit={handleFlagSubmission} className="bg-gradient-to-br from-gray-900 to-black border-2 border-cyan-500 rounded-lg p-6 shadow-xl">
              <p className="text-cyan-300 mb-4 font-bold text-lg">
                ENTER FLAG VALUE:
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  placeholder="Flag value here..."
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-cyan-500 rounded text-white focus:border-green-400 focus:outline-none focus:shadow-lg focus:shadow-green-500/50 font-mono"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-black rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {submitting ? "⏳ SUBMITTING..." : "✓ SUBMIT FLAG"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFlagId(null);
                      setFlagInput("");
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-black rounded-lg transition transform hover:scale-105"
                  >
                    ✕ CANCEL
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>

        {/* Leaderboard Link */}
        <div className="text-center">
          <Link
            href="/leaderboard"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black rounded-lg transition transform hover:scale-110 shadow-xl text-lg"
          >
            🏆 VIEW LEADERBOARD
          </Link>
        </div>
      </main>
    </div>
  );
}
