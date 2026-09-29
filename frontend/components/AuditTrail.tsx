"use client";

import { Clock, CheckCircle2, AlertTriangle, FileText, UserCheck, Bot } from "lucide-react";

interface AuditLog {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

interface AuditTrailProps {
  logs: AuditLog[];
}

export default function AuditTrail({ logs }: AuditTrailProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">System Audit Trail</h3>
          <p className="text-xs text-slate-500">Traceable history of site updates & AI reconciliations</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
          {logs.length} Logged Events
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent activity logged yet.</p>
        ) : (
          logs.map((log) => {
            let Icon = Clock;
            let iconBg = "bg-slate-100 text-slate-600";
            if (log.actor.includes("AI")) {
              Icon = Bot;
              iconBg = "bg-teal-50 text-[#31AAA9]";
            } else if (log.action.includes("Approved") || log.action.includes("Created")) {
              Icon = CheckCircle2;
              iconBg = "bg-emerald-50 text-emerald-600";
            } else if (log.action.includes("Update")) {
              Icon = FileText;
              iconBg = "bg-amber-50 text-amber-600";
            }

            return (
              <div key={log.id} className="py-2.5 flex items-start gap-3 text-xs">
                <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5 font-bold`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-tight">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Actor: {log.actor}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
