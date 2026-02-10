"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface TopBarProps {
  missionCount: number;
  approvalCount: number;
  onNewMission?: () => void;
}

export default function TopBar({ missionCount, approvalCount, onNewMission }: TopBarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="bg-slate-800 px-5 py-2.5 flex items-center justify-between border-b border-slate-700 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold">
            T
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 tracking-tight">
              TaxFolio Mission Control
            </div>
            <div className="text-[10px] text-slate-500">
              Agent Orchestration &bull; v2
            </div>
          </div>
        </div>

        <div className="flex gap-4 ml-6 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>👥</span>
            <span className="font-bold text-slate-100">7</span> Agents
          </div>
          <div className="flex items-center gap-1.5">
            <span>📋</span>
            <span className="font-bold text-slate-100">{missionCount}</span> Missions
          </div>
          {approvalCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
              <span>⏳</span>
              <span className="font-bold text-amber-400">{approvalCount}</span>
              <span className="text-amber-400">Awaiting Approval</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onNewMission && (
          <button
            onClick={onNewMission}
            className="px-3 py-1.5 text-[11px] font-bold rounded-md bg-violet-600 text-white hover:bg-violet-500 transition-colors"
          >
            + New Mission
          </button>
        )}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500" />
          <span className="text-emerald-500 font-semibold">System Online</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
