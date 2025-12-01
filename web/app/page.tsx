"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/lib/types";

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("audience");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    // Store user info in localStorage
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);

    // Navigate to session
    router.push("/session");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20 animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-2">CrowdJam Live</h1>
          <p className="text-white/90 text-lg mb-2">Real-Time Collective Music Creation</p>
          <p className="text-white/70 text-sm">Join the crowd, create the sound</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-white/90 mb-2 font-medium">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-white/90 mb-3 font-medium">Role</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRole("audience")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  role === "audience"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Audience
              </button>
              <button
                type="button"
                onClick={() => setRole("producer")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                  role === "producer"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Producer
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Join Session →
          </button>
        </form>
      </div>
    </div>
  );
}

