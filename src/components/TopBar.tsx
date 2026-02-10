"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface TopBarProps {
  missionCount: number;
  approvalCount: number;
  onNewMission?: () => void;
  onBroadcast?: () => void;
  onChat?: () => void;
  onJarvis?: () => void;
  systemPaused?: boolean;
  onTogglePause?: () => void;
}

export default function TopBar({
  missionCount,
  approvalCount,
  onNewMission,
  onBroadcast,
  onChat,
  onJarvis,
  systemPaused,
  onTogglePause,
}: TopBarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className={`px-5 py-2.5 flex items-center justify-between border-b border-[#E8E5E0] shrink-0 ${
        systemPaused ? "bg-red-50" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#E8952E] flex items-center justify-center text-white font-bold">
            T
          </div>
          <div>
            <div className="font-bold text-sm text-[#1A1A1A] tracking-tight">
              TaxFolio Mission Control
            </div>
            <div className="text-[10px] text-[#6B6B6B]">
              Agent Orchestration &bull; v2
            </div>
          </div>
        </div>

        <div className="flex gap-4 ml-6 text-[11px] text-[#6B6B6B]">
          <div className="flex items-center gap-1.5">
            <span>👥</span>
            <span className="font-bold text-[#1A1A1A]">7</span> Agents
          </div>
          <div className="flex items-center gap-1.5">
            <span>📋</span>
            <span className="font-bold text-[#1A1A1A]">{missionCount}</span> Missions
          </div>
          {approvalCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              <span>⏳</span>
              <span className="font-bold text-amber-600">{approvalCount}</span>
              <span className="text-amber-600">Awaiting Approval</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onJarvis && (
          <button
            onClick={onJarvis}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors"
            title="Talk to Jarvis (J)"
          >
            🤖 Jarvis
          </button>
        )}
        {onBroadcast && (
          <button
            onClick={onBroadcast}
            className="px-3 py-1.5 text-[11px] font-semibold rounded-md text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F5F4F0] transition-colors"
          >
            📢 Broadcast
          </button>
        )}
        {onChat && (
          <button
            onClick={onChat}
            className="px-3 py-1.5 text-[11px] font-semibold rounded-md text-[#6B6B6B] hover:text-[#1A1A1A] hover:bg-[#F5F4F0] transition-colors"
          >
            💬 Chat
          </button>
        )}
        {onNewMission && (
          <button
            onClick={onNewMission}
            className="px-3 py-1.5 text-[11px] font-bold rounded-md bg-[#E8952E] text-white hover:bg-[#D4841F] transition-colors"
          >
            + New Mission
          </button>
        )}
        {onTogglePause ? (
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1.5 text-[11px] cursor-pointer"
          >
            {systemPaused ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-red-500 font-semibold">PAUSED</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500" />
                <span className="text-emerald-600 font-semibold">ACTIVE</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500" />
            <span className="text-emerald-600 font-semibold">System Online</span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="text-[11px] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
