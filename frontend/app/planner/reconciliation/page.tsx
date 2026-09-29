"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getReconciliationsApi, approveReconciliationApi } from "@/lib/api";
import { GitCompare, Check, X, AlertTriangle, CheckCircle2, HelpCircle, ShieldCheck } from "lucide-react";

export default function PlannerReconciliationPage() {
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getReconciliationsApi(1);
      setReconciliations(res.reconciliations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (reconciliationId: number, action: "APPROVE" | "REJECT") => {
    try {
      await approveReconciliationApi(reconciliationId, action);
      setActionMessage(`Recommendation successfully ${action.toLowerCase()}d.`);
      setTimeout(() => setActionMessage(""), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || "Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="Project Planner" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#31AAA9] text-white flex items-center justify-center font-bold">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">AI Reconciliation Center</h1>
                <p className="text-xs text-slate-500">
                  Semantic matching of field site updates against baseline planned tasks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full border border-amber-200">
                {reconciliations.filter(r => r.approval_status === 'PENDING').length} Pending Human Governance
              </span>
            </div>
          </div>

          {actionMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Reconciliations Table / Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Site Report Reconciliation Queue</h3>
              <span className="text-xs text-slate-500">Human-in-the-loop Governance</span>
            </div>

            <div className="divide-y divide-slate-200">
              {reconciliations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No site updates recorded yet. Switch to Site Reporter to submit a field update.
                </div>
              ) : (
                reconciliations.map((rec) => {
                  let confBadge = "bg-emerald-100 text-emerald-800 border-emerald-200";
                  if (rec.match_confidence === "REVIEW") confBadge = "bg-amber-100 text-amber-800 border-amber-200";
                  if (rec.match_confidence === "NO MATCH") confBadge = "bg-red-100 text-[#A82020] border-red-200";

                  return (
                    <div key={rec.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Field Report Info */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">Reporter Update:</span>
                            <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              Reported Status: {rec.reported_status}
                            </span>
                            <span className="text-[11px] text-slate-400">{rec.created_at}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 italic">
                            "{rec.reporter_comment}"
                          </p>
                        </div>

                        {/* AI Match Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-md border ${confBadge}`}>
                            {rec.match_confidence}
                          </span>
                          <span className={`text-xs font-black px-2.5 py-1 rounded-md ${
                            rec.schedule_status === 'LAGGING' 
                              ? 'bg-red-100 text-[#A82020]' 
                              : 'bg-teal-100 text-[#31AAA9]'
                          }`}>
                            {rec.schedule_status}
                          </span>
                        </div>

                      </div>

                      {/* AI Reasoning Box */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#6C1A1A]">
                            AI Matched Task: <strong className="text-slate-900">{rec.matched_task_name || "Unidentified Task"}</strong>
                          </span>
                          <span className="font-bold text-[#31AAA9]">
                            Estimated Progress: {rec.progress.toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">
                          <strong className="text-slate-700">AI Explanation:</strong> {rec.reason}
                        </p>
                      </div>

                      {/* Human in the Loop Action Buttons (Section 15 Requirements) */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-500">
                          Approval Status: <strong className={`ml-1 ${
                            rec.approval_status === 'APPROVED' ? 'text-emerald-600' : (rec.approval_status === 'REJECTED' ? 'text-[#A82020]' : 'text-amber-600')
                          }`}>{rec.approval_status}</strong>
                        </span>

                        {rec.approval_status === "PENDING" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction(rec.id, "REJECT")}
                              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-[#A82020] font-bold text-xs rounded-lg transition border border-red-200 flex items-center gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleAction(rec.id, "APPROVE")}
                              className="px-4 py-1.5 bg-[#31AAA9] hover:bg-[#289190] text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Governance complete</span>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
