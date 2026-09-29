"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ScenarioPresets from "@/components/ScenarioPresets";
import { getTasksApi, submitFieldUpdateApi } from "@/lib/api";
import { FileEdit, Send, Sparkles, ArrowRight } from "lucide-react";

function UpdatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTaskId = searchParams.get("task_id");

  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(initialTaskId ? parseInt(initialTaskId) : null);
  const [status, setStatus] = useState<"NOT STARTED" | "IN PROGRESS" | "COMPLETED">("IN PROGRESS");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTasksApi(1)
      .then((res) => {
        const list = res.tasks || [];
        setTasks(list);
        if (!selectedTaskId && list.length > 0) {
          setSelectedTaskId(list[2]?.id || list[0]?.id);
        }
      })
      .catch(console.error);
  }, []);

  const handleSelectScenario = (tId: number | null, st: string, cm: string) => {
    setSelectedTaskId(tId);
    setStatus(st as any);
    setComment(cm);
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!comment.trim() && status !== "NOT STARTED") {
      setError("Please enter a short description of actual site progress.");
      return;
    }

    try {
      setLoading(true);
      const res = await submitFieldUpdateApi({
        project_id: 1,
        task_id: selectedTaskId,
        reporter_email: "reporter@plan2site.demo",
        new_status: status,
        reporter_comment: comment
      });

      setResult(res.ai_recommendation);
    } catch (err: any) {
      setError(err.message || "Failed to submit field update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#31AAA9] text-white flex items-center justify-center font-bold">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Record Field Site Update</h1>
            <p className="text-xs text-slate-500">Report physical construction progress for AI reconciliation</p>
          </div>
        </div>
      </div>

      {/* Preset Scenario Buttons */}
      <ScenarioPresets onSelectScenario={handleSelectScenario} tasks={tasks} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-[#A82020] text-xs font-semibold p-3.5 rounded-xl">
          {error}
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Construction Activity (Optional if AI matching)
            </label>
            <select
              value={selectedTaskId || ""}
              onChange={(e) => setSelectedTaskId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#31AAA9] focus:outline-none"
            >
              <option value="">-- Let AI Auto-Detect Task from Comment --</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.sequence}. {t.name} (Planned: Day {t.planned_start_day}-{t.planned_end_day})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Current Task Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "NOT STARTED", color: "peer-checked:bg-slate-700 peer-checked:text-white" },
                { label: "IN PROGRESS", color: "peer-checked:bg-[#31AAA9] peer-checked:text-white" },
                { label: "COMPLETED", color: "peer-checked:bg-emerald-600 peer-checked:text-white" }
              ].map((opt) => (
                <label key={opt.label} className="cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={opt.label}
                    checked={status === opt.label}
                    onChange={() => setStatus(opt.label as any)}
                    className="hidden peer"
                  />
                  <div className={`py-3 px-2 text-center rounded-xl border border-slate-200 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 ${opt.color}`}>
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {status === "COMPLETED" ? "Completion Note" : (status === "IN PROGRESS" ? "Current Site Update" : "Additional Notes")}
            </label>
            <textarea
              rows={3}
              required={status !== "NOT STARTED"}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#31AAA9] focus:outline-none"
              placeholder={
                status === "COMPLETED"
                  ? "e.g. Foundation work completed successfully."
                  : "e.g. Foundation reinforcement is finished but concrete pouring is still remaining."
              }
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#31AAA9] hover:bg-[#289190] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              {loading ? (
                <span>Running AI Reconciliation...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Field Report</span>
                </>
              )}
            </button>
          </div>

        </form>

        {result && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 bg-slate-50/80 p-5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#31AAA9]" />
              <h3 className="font-bold text-slate-900 text-sm">AI Reconciliation Output</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Matched Planned Task</span>
                <p className="text-sm font-black text-slate-800">{result.matched_task_name}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Confidence</span>
                <p className={`text-sm font-black ${
                  result.match_confidence === 'MATCH' ? 'text-emerald-600' : 'text-amber-600'
                }`}>{result.match_confidence}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Schedule Status</span>
                <p className={`text-sm font-black ${
                  result.schedule_status === 'LAGGING' ? 'text-[#A82020]' : 'text-[#31AAA9]'
                }`}>{result.schedule_status} ({result.progress.toFixed(0)}%)</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700">
              <strong className="text-slate-800">AI Explanation:</strong> {result.reason}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => router.push("/reporter/dashboard")}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
              >
                <span>View Updated Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ReporterUpdatesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="Site Reporter" />
        <main className="flex-1 p-6 max-w-4xl mx-auto">
          <Suspense fallback={<div className="p-6 text-xs text-slate-400">Loading update form...</div>}>
            <UpdatesContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
