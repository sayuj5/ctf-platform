"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type LeaderboardEntry = {
  user_id: string;
  name: string;
  total_points: number;
  flag_count: number;
  email: string;
};

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && !user.is_admin) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadLeaderboard();
    }
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      // Get all users with their submission count and points
      const { data: usersData } = await supabase
        .from("users")
        .select("id, name, email");

      if (!usersData) return;

      const leaderboardData = await Promise.all(
        usersData.map(async (userRecord) => {
          // Get submission count
          const { data: submissionsData, count } = await supabase
            .from("submissions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userRecord.id);

          // Get total points
          const { data: pointsData } = await supabase
            .from("submissions")
            .select("flags(points)")
            .eq("user_id", userRecord.id);

          const totalPoints = pointsData?.reduce((sum: number, item: any) => {
            return sum + (item.flags?.points || 0);
          }, 0) || 0;

          return {
            user_id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            flag_count: count || 0,
            total_points: totalPoints,
          };
        })
      );

      // Sort by points and then by flag count
      const sorted = leaderboardData
        .sort((a, b) => {
          if (b.total_points !== a.total_points) {
            return b.total_points - a.total_points;
          }
          return b.flag_count - a.flag_count;
        })
        .filter((entry) => entry.flag_count > 0);

      setLeaderboard(sorted);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-yellow-400 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black animate-pulse">⏳ LOADING LEADERBOARD...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-black border-b-2 border-yellow-500 shadow-2xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-6">
          <Link href="/dashboard" className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent hover:scale-110 transition">
            ← CTF ARENA
          </Link>
          <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent">🏆 LEADERBOARD</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-yellow-500 rounded-lg overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-yellow-600 to-red-600 p-6">
            <h2 className="text-2xl font-black text-white">⚡ TOP HACKERS</h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-lg">
              <p>🔍 No submissions yet. Be the first to capture a flag!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 border-b-2 border-yellow-500">
                  <tr>
                    <th className="px-6 py-4 text-left text-yellow-400 font-black">RANK</th>
                    <th className="px-6 py-4 text-left text-yellow-400 font-black">PLAYER</th>
                    <th className="px-6 py-4 text-left text-yellow-400 font-black">EMAIL</th>
                    <th className="px-6 py-4 text-center text-yellow-400 font-black">FLAGS</th>
                    <th className="px-6 py-4 text-right text-yellow-400 font-black">POINTS</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry.user_id}
                      className={`border-b border-gray-700 hover:bg-gray-800 transition ${
                        entry.user_id === user.id ? "bg-cyan-900/50 border-l-4 border-l-cyan-500" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block w-12 h-12 rounded-full font-black text-center leading-12 text-lg ${
                            index === 0
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/50"
                              : index === 1
                              ? "bg-gradient-to-br from-gray-300 to-gray-400 text-black shadow-lg shadow-gray-400/50"
                              : index === 2
                              ? "bg-gradient-to-br from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/50"
                              : "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-black text-lg">
                          {entry.name}
                          {entry.user_id === user.id && " 👤"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{entry.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-400 font-black text-lg bg-gray-800 px-3 py-1 rounded-lg">{entry.flag_count}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-yellow-400 font-black text-2xl">{entry.total_points}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-500 rounded-lg p-6 text-center shadow-xl transform hover:scale-105 transition">
            <p className="text-gray-400 text-sm font-bold mb-2">TOTAL PARTICIPANTS</p>
            <p className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{leaderboard.length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500 rounded-lg p-6 text-center shadow-xl transform hover:scale-105 transition">
            <p className="text-gray-400 text-sm font-bold mb-2">YOUR RANK</p>
            <p className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {leaderboard.findIndex((e) => e.user_id === user.id) + 1 || "—"}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-orange-500 rounded-lg p-6 text-center shadow-xl transform hover:scale-105 transition">
            <p className="text-gray-400 text-sm font-bold mb-2">TOP SCORE</p>
            <p className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              {leaderboard[0]?.total_points || 0}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
