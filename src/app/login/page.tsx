"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#E8952E] flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            T
          </div>
          <h1 className="text-lg font-bold text-[#1A1A1A] tracking-tight">
            TaxFolio Mission Control
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            Agent Orchestration Dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-xl p-6 border border-[#E8E5E0] shadow-sm">
          <div className="mb-4">
            <label htmlFor="email" className="block text-[11px] font-semibold text-[#6B6B6B] mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E] focus:ring-1 focus:ring-[#E8952E] transition-colors"
              placeholder="rob@taxfolio.io"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-[11px] font-semibold text-[#6B6B6B] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E] focus:ring-1 focus:ring-[#E8952E] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#E8952E] text-white text-sm font-bold rounded-lg hover:bg-[#D4841F] disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[10px] text-[#9CA3AF] mt-6">
          Internal access only
        </p>
      </div>
    </div>
  );
}
