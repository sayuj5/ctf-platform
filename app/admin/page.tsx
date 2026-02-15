"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AdminStats = {
  totalUsers: number;
  totalSubmissions: number;
  totalFlags: number;
  flagsWithSubmissions: number;
};

type UserSubmissions = {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  flag_count: number;
  total_points: number;
  submission_details: {
    flag_name: string;
    points: number;
  }[];
};

type UserRecord = {
  id: string;
  email: string;
  name: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
};

export default function AdminPanel() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [submissions, setSubmissions] = useState<UserSubmissions[]>([]);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "submissions" | "users">("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && user && !user.is_admin) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.is_admin) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      // Get stats
      const { count: userCount } = await supabase
        .from("users")
        .select("id", { count: "exact", head: true });

      const { count: submissionCount } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true });

      const { count: flagCount } = await supabase
        .from("flags")
        .select("id", { count: "exact", head: true });

      const { data: flagsWithSubs } = await supabase
        .from("flags")
        .select("id, submissions(id)");

      setStats({
        totalUsers: userCount || 0,
        totalSubmissions: submissionCount || 0,
        totalFlags: flagCount || 0,
        flagsWithSubmissions: flagsWithSubs?.filter((f) => (f.submissions as any[])?.length > 0).length || 0,
      });

      // Get detailed submissions
      const { data: usersData } = await supabase
        .from("users")
        .select("id, name, email, phone");

      if (!usersData) return;

      const submissionData = await Promise.all(
        usersData.map(async (userRecord) => {
          const { data: subs } = await supabase
            .from("submissions")
            .select("flags(flag_name, points)")
            .eq("user_id", userRecord.id);

          const total = subs?.reduce((sum: number, item: any) => {
            return sum + (item.flags?.points || 0);
          }, 0) || 0;

          return {
            user_id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            phone: userRecord.phone,
            flag_count: subs?.length || 0,
            total_points: total,
            submission_details: subs?.map((s: any) => ({
              flag_name: s.flags?.flag_name,
              points: s.flags?.points,
            })) || [],
          };
        })
      );

      const filteredSubmissions = submissionData
        .filter((s) => s.flag_count > 0)
        .sort((a, b) => b.total_points - a.total_points);

      setSubmissions(filteredSubmissions);

      // Load all users
      const { data: allUsersData } = await supabase
        .from("users")
        .select("id, email, name, phone, is_admin, created_at")
        .order("created_at", { ascending: false });

      setAllUsers(allUsersData || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setAllUsers(
        allUsers.map((u) =>
          u.id === userId ? { ...u, is_admin: !currentStatus } : u
        )
      );

      console.log(`User ${userId} admin status toggled to ${!currentStatus}`);
    } catch (err) {
      console.error("Failed to toggle admin status:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-yellow-400 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-black animate-pulse">⏳ INITIALIZING ADMIN PANEL...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-black border-b-2 border-red-500 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">🔐 ADMIN CONTROL</h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black rounded-lg transition transform hover:scale-105 shadow-lg"
          >
            ⬅️ LOGOUT
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900 p-2 rounded-lg inline-flex border-2 border-gray-700">
          <button
            onClick={() => setTab("overview")}
            className={`px-6 py-2 font-black rounded-lg transition transform ${
              tab === "overview"
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg scale-105"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📊 OVERVIEW
          </button>
          <button
            onClick={() => setTab("submissions")}
            className={`px-6 py-2 font-black rounded-lg transition transform ${
              tab === "submissions"
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg scale-105"
                : "text-gray-400 hover:text-white"
            }`}
          >
            📝 SUBMISSIONS
          </button>
          <button
            onClick={() => setTab("users")}
            className={`px-6 py-2 font-black rounded-lg transition transform ${
              tab === "users"
                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg scale-105"
                : "text-gray-400 hover:text-white"
            }`}
          >
            👥 USERS
          </button>
        </div>

        {/* Overview Tab */}
        {tab === "overview" && stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-red-500 rounded-lg p-6 shadow-xl transform hover:scale-105 transition">
              <p className="text-gray-400 text-sm font-bold mb-2">👥 TOTAL USERS</p>
              <p className="text-4xl font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">{stats.totalUsers}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-purple-500 rounded-lg p-6 shadow-xl transform hover:scale-105 transition">
              <p className="text-gray-400 text-sm font-bold mb-2">🚩 TOTAL FLAGS</p>
              <p className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{stats.totalFlags}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-500 rounded-lg p-6 shadow-xl transform hover:scale-105 transition">
              <p className="text-gray-400 text-sm font-bold mb-2">⚡ TOTAL SUBMISSIONS</p>
              <p className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stats.totalSubmissions}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-green-500 rounded-lg p-6 shadow-xl transform hover:scale-105 transition">
              <p className="text-gray-400 text-sm font-bold mb-2">✅ FLAGS CLAIMED</p>
              <p className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{stats.flagsWithSubmissions}</p>
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {tab === "submissions" && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-red-500 rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
              <h2 className="text-2xl font-black text-white">📋 USER SUBMISSIONS & LEADERBOARD</h2>
            </div>

            {submissions.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-lg">
                <p>🔍 No submissions recorded yet.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 border-b-2 border-red-500">
                      <tr>
                        <th className="px-6 py-4 text-left text-red-400 font-black">RANK</th>
                        <th className="px-6 py-4 text-left text-red-400 font-black">NAME</th>
                        <th className="px-6 py-4 text-left text-red-400 font-black">EMAIL</th>
                        <th className="px-6 py-4 text-left text-red-400 font-black">PHONE</th>
                        <th className="px-6 py-4 text-center text-red-400 font-black">FLAGS</th>
                        <th className="px-6 py-4 text-right text-red-400 font-black">POINTS</th>
                        <th className="px-6 py-4 text-left text-red-400 font-black">SUBMISSIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((entry, index) => (
                        <tr
                          key={entry.user_id}
                          className="border-b border-gray-700 hover:bg-gray-800 transition"
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
                          <td className="px-6 py-4 font-black text-lg">{entry.name}</td>
                          <td className="px-6 py-4 text-gray-300">{entry.email}</td>
                          <td className="px-6 py-4 text-gray-300">{entry.phone}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-green-400 font-black text-lg bg-gray-800 px-3 py-1 rounded-lg">{entry.flag_count}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-yellow-400 font-black text-2xl">{entry.total_points}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {entry.submission_details
                              .map((s) => `${s.flag_name} (+${s.points})`)
                              .join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500 rounded-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
              <h2 className="text-2xl font-black text-white">👥 ALL REGISTERED USERS</h2>
            </div>

            {allUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-lg">
                <p>🔍 No users registered yet.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 border-b-2 border-blue-500">
                      <tr>
                        <th className="px-6 py-4 text-left text-blue-400 font-black">NAME</th>
                        <th className="px-6 py-4 text-left text-blue-400 font-black">EMAIL</th>
                        <th className="px-6 py-4 text-left text-blue-400 font-black">PHONE</th>
                        <th className="px-6 py-4 text-center text-blue-400 font-black">ADMIN</th>
                        <th className="px-6 py-4 text-left text-blue-400 font-black">JOINED</th>
                        <th className="px-6 py-4 text-center text-blue-400 font-black">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((userRecord) => (
                        <tr
                          key={userRecord.id}
                          className="border-b border-gray-700 hover:bg-gray-800 transition"
                        >
                          <td className="px-6 py-4 font-black text-lg">{userRecord.name}</td>
                          <td className="px-6 py-4 text-gray-300">{userRecord.email}</td>
                          <td className="px-6 py-4 text-gray-300">{userRecord.phone}</td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-lg font-black ${
                                userRecord.is_admin
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {userRecord.is_admin ? "✅ YES" : "❌ NO"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300 text-sm">
                            {new Date(userRecord.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() =>
                                toggleAdminStatus(userRecord.id, userRecord.is_admin)
                              }
                              className={`px-4 py-2 rounded-lg font-black transition transform hover:scale-105 ${
                                userRecord.is_admin
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                            >
                              {userRecord.is_admin ? "⬇️ REVOKE" : "⬆️ PROMOTE"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
