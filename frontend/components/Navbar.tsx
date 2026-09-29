"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession, UserSession } from "@/lib/auth";
import { HardHat, LogOut, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#31AAA9] flex items-center justify-center text-white font-bold shadow-sm">
          <HardHat className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-[#6C1A1A] tracking-tight">Plan2Site AI</span>
            <span className="text-xs bg-[#F8E0A4] text-[#6C1A1A] font-semibold px-2 py-0.5 rounded-full border border-[#e8cc84]">
              Team CodeNova
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Bridging planned work & actual site progress
          </p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">{user.name}</p>
            <p className="text-[11px] text-slate-500 font-medium">
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${user.role === 'Project Planner' ? 'bg-[#31AAA9]' : 'bg-[#F8E0A4]'}`}></span>
              {user.role} ({user.email})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-[#A82020] hover:bg-red-50 rounded-md transition border border-slate-200"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
