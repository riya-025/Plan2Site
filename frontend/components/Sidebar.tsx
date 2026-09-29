"use client";

import Link from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderKanban, 
  CalendarRange, 
  GitCompare, 
  FileSpreadsheet, 
  LogOut, 
  ClipboardCheck, 
  Clock, 
  FileEdit
} from "lucide-react";
import { clearSession } from "@/lib/auth";

interface SidebarProps {
  role: "Project Planner" | "Site Reporter";
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const plannerLinks = [
    { name: "Dashboard", href: "/planner/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/planner/dashboard", icon: FolderKanban },
    { name: "Schedule", href: "/planner/schedule", icon: CalendarRange },
    { name: "AI Reconciliation", href: "/planner/reconciliation", icon: GitCompare },
    { name: "Reports", href: "/planner/reports", icon: FileSpreadsheet },
  ];

  const reporterLinks = [
    { name: "My Project", href: "/reporter/dashboard", icon: ClipboardCheck },
    { name: "Timeline", href: "/reporter/timeline", icon: Clock },
    { name: "Site Updates", href: "/reporter/updates", icon: FileEdit },
  ];

  const links = role === "Project Planner" ? plannerLinks : reporterLinks;

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-[calc(100vh-61px)] flex flex-col justify-between p-4 shadow-md">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {role} Workspace
          </p>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-[#31AAA9] text-white shadow-sm font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {role === "Project Planner" && (
          <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#31AAA9] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#F8E0A4]">Active Demo</span>
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              My House Project (Pune)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Residential Construction
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-[#A82020] transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
