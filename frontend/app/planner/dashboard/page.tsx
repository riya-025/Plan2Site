"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TimelineGantt from "@/components/TimelineGantt";
import AuditTrail from "@/components/AuditTrail";
import { 
  getProjectApi, 
  getTasksApi, 
  getAuditTrailApi, 
  getReconciliationsApi,
  sendNotificationApi,
  getNotificationsApi
} from "@/lib/api";
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Layers, 
  ArrowUpRight, 
  GitCompare,
  Building2,
  BellRing,
  Filter,
  Check,
  Send,
  X
} from "lucide-react";
import Link from "next/link";

export default function PlannerDashboard() {
  const [projectData, setProjectData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Card Filter State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Notification Modal State
  const [notifyModalTask, setNotifyModalTask] = useState<any>(null);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifySuccess, setNotifySuccess] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const proj = await getProjectApi(1);
      const t = await getTasksApi(1);
      const logs = await getAuditTrailApi(1);
      const recs = await getReconciliationsApi(1);
      const notifs = await getNotificationsApi(1);

      setProjectData(proj);
      setTasks(t.tasks || []);
      setAuditLogs(logs.audit_trail || []);
      setReconciliations(recs.reconciliations || []);
      setNotifications(notifs.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const metrics = projectData?.metrics || {
    overall_progress: 0,
    total_tasks: 0,
    completed: 0,
    in_progress: 0,
    not_started: 0,
    on_time: 0,
    lagging: 0
  };

  // Filter tasks based on clicked status card
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "COMPLETED") return t.status === "COMPLETED";
    if (statusFilter === "IN PROGRESS") return t.status === "IN PROGRESS";
    if (statusFilter === "NOT STARTED") return t.status === "NOT STARTED";
    if (statusFilter === "ON TIME") return t.schedule_status === "ON TIME";
    if (statusFilter === "LAGGING") return t.schedule_status === "LAGGING";
    return true;
  });

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyModalTask) return;

    try {
      await sendNotificationApi(1, notifyModalTask.id, notifyMessage);
      setNotifySuccess(`Lagging alert sent to Site Reporter for '${notifyModalTask.name}'.`);
      setNotifyModalTask(null);
      setNotifyMessage("");
      setTimeout(() => setNotifySuccess(""), 4000);
      loadDashboardData();
    } catch (err: any) {
      alert(err.message || "Failed to send notification.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="Project Planner" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          
          {/* Header Banner & + Create Project Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#31AAA9]"></span>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Planner Command Center</h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Real-time schedule awareness & AI reconciliation overview
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/planner/create-project"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#31AAA9] hover:bg-[#289190] text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Project</span>
              </Link>
            </div>
          </div>

          {notifySuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
              <BellRing className="w-4 h-4 text-emerald-600" />
              <span>{notifySuccess}</span>
            </div>
          )}

          {/* DYNAMIC CLICKABLE METRIC CARDS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Project Metrics (Click any card to filter tasks below)
              </p>
              {statusFilter !== "ALL" && (
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className="text-xs font-bold text-[#31AAA9] hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              
              {/* Overall Progress / All Tasks */}
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`text-left p-4 rounded-xl border transition shadow-xs space-y-2 col-span-2 sm:col-span-1 ${
                  statusFilter === "ALL"
                    ? "bg-[#31AAA9]/10 border-[#31AAA9] ring-2 ring-[#31AAA9]/30"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Progress</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-[#31AAA9]">{metrics.overall_progress}%</span>
                  <span className="text-[10px] bg-teal-50 text-[#31AAA9] font-bold px-1.5 py-0.5 rounded">Avg</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#31AAA9] rounded-full transition-all duration-500" 
                    style={{ width: `${metrics.overall_progress}%` }}
                  ></div>
                </div>
              </button>

              {/* Total Tasks */}
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`text-left p-4 rounded-xl border transition shadow-xs space-y-1 ${
                  statusFilter === "ALL"
                    ? "bg-slate-100 border-slate-400 ring-2 ring-slate-300"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Tasks</span>
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-2xl font-black text-slate-800">{metrics.total_tasks}</p>
                <p className="text-[10px] text-slate-400">Click to view all</p>
              </button>

              {/* Completed */}
              <button
                type="button"
                onClick={() => setStatusFilter("COMPLETED")}
                className={`text-left p-4 rounded-xl border transition shadow-xs space-y-1 ${
                  statusFilter === "COMPLETED"
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300"
                    : "bg-white border-slate-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Completed</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <p className="text-2xl font-black text-emerald-600">{metrics.completed}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Click to filter</p>
              </button>

              {/* In Progress */}
              <button
                type="button"
                onClick={() => setStatusFilter("IN PROGRESS")}
                className={`text-left p-4 rounded-xl border transition shadow-xs space-y-1 ${
                  statusFilter === "IN PROGRESS"
                    ? "bg-amber-50 border-amber-500 ring-2 ring-amber-300"
                    : "bg-white border-slate-200 hover:border-amber-300"
                }`}
              >
                <div className="flex items-center justify-between text-amber-600">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">In Progress</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <p className="text-2xl font-black text-amber-600">{metrics.in_progress}</p>
                <p className="text-[10px] text-amber-600 font-medium">Click to filter</p>
              </button>

              {/* Not Started */}
              <button
                type="button"
                onClick={() => setStatusFilter("NOT STARTED")}
                className={`text-left p-4 rounded-xl border transition shadow-xs space-y-1 ${
                  statusFilter === "NOT STARTED"
                    ? "bg-slate-200 border-slate-400 ring-2 ring-slate-300"
                    : "bg-white border-slate-200 hover:border-slate-400"
                }`}
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Not Started</span>
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <p className="text-2xl font-black text-slate-600">{metrics.not_started}</p>
                <p className="text-[10px] text-slate-500 font-medium">Click to filter</p>
              </button>

              {/* On Time */}
              <button
                type="button"
                onClick={() => setStatusFilter("ON TIME")}
                className={`text-left p-4 rounded-xl border transition shadow-xs space-y-1 ${
                  statusFilter === "ON TIME"
                    ? "bg-teal-50 border-[#31AAA9] ring-2 ring-teal-300"
                    : "bg-white border-slate-200 hover:border-teal-300"
                }`}
              >
                <div className="flex items-center justify-between text-teal-600">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">On Time</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <p className="text-2xl font-black text-[#31AAA9]">{metrics.on_time}</p>
                <p className="text-[10px] text-teal-600 font-medium">Click to filter</p>
              </button>

              {/* Lagging */}
              <button
                type="button"
                onClick={() => setStatusFilter("LAGGING")}
                className={`text-left p-4 rounded-xl border transition shadow-xs space-y-1 ${
                  statusFilter === "LAGGING"
                    ? "bg-red-100 border-[#A82020] ring-2 ring-red-400"
                    : "bg-red-50/60 border-red-200 hover:border-red-300"
                }`}
              >
                <div className="flex items-center justify-between text-[#A82020]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A82020]">Lagging</span>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <p className="text-2xl font-black text-[#A82020]">{metrics.lagging}</p>
                <p className="text-[10px] text-[#A82020] font-bold">Click to filter</p>
              </button>

            </div>
          </div>

          {/* Active Project Card & Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F8E0A4]/50 border border-[#e8cc84] flex items-center justify-center text-[#6C1A1A] font-bold shrink-0">
                <Building2 className="w-6 h-6 text-[#6C1A1A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-base">
                    {projectData?.project?.name || "My House Project"}
                  </h2>
                  <span className="text-xs bg-teal-50 text-[#31AAA9] font-semibold px-2 py-0.5 rounded border border-teal-200">
                    {projectData?.project?.project_type || "Residential Construction"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Location: <span className="font-medium text-slate-700">{projectData?.project?.location || "Pune"}</span> • Baseline PDF: <span className="font-medium text-slate-700">{projectData?.project?.pdf_filename || "sample_house_plan.pdf"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Link
                href="/planner/reconciliation"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>AI Reconciliation ({reconciliations.filter(r => r.approval_status === 'PENDING').length} Pending)</span>
              </Link>
            </div>
          </div>

          {/* FILTERED TASKS SECTION (Clicking metric cards filters this view!) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#31AAA9]" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {statusFilter === "ALL" ? "All Project Activities" : `Tasks Filtered by: ${statusFilter}`}
                </h3>
                <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                  {filteredTasks.length} Tasks
                </span>
              </div>
              {statusFilter !== "ALL" && (
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className="text-xs font-bold text-[#31AAA9] hover:underline"
                >
                  Show All ({tasks.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 rounded-xl border transition space-y-3 ${
                    task.schedule_status === 'LAGGING' 
                      ? 'bg-red-50/40 border-red-200' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {task.sequence}. {task.name}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0 ${
                      task.schedule_status === 'LAGGING' 
                        ? 'bg-[#A82020] text-white' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {task.schedule_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Days {task.planned_start_day} - {task.planned_end_day} ({task.duration_days}d)</span>
                    <span className="font-bold text-slate-800">Progress: {task.current_progress.toFixed(0)}%</span>
                  </div>

                  {task.schedule_status === 'LAGGING' && (
                    <div className="space-y-2 pt-1">
                      {task.lagging_reason && (
                        <div className="text-[11px] text-[#A82020] bg-red-100/60 p-2 rounded-lg font-medium flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{task.lagging_reason}</span>
                        </div>
                      )}

                      {/* PLANNER TO REPORTER NOTIFICATION BUTTON */}
                      <button
                        onClick={() => {
                          setNotifyModalTask(task);
                          setNotifyMessage(`URGENT ALERT: Activity '${task.name}' is currently LAGGING behind planned schedule (${task.current_progress.toFixed(0)}% completion). Please expedite execution.`);
                        }}
                        className="w-full py-1.5 px-3 bg-[#A82020] hover:bg-[#8f1b1b] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Send Alert to Site Reporter</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Gantt Chart Visualization */}
          <TimelineGantt tasks={tasks} />

          {/* Grid Layout: Recent Field Reconciliations & Audit Trail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent AI Reconciliations Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Recent AI Reconciliations</h3>
                  <p className="text-xs text-slate-500">Field update status vs planned baseline</p>
                </div>
                <Link
                  href="/planner/reconciliation"
                  className="text-xs font-bold text-[#31AAA9] hover:underline flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {reconciliations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">
                        Task: {rec.matched_task_name || "Unidentified Task"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          rec.match_confidence === 'MATCH' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rec.match_confidence}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          rec.schedule_status === 'LAGGING' ? 'bg-red-100 text-[#A82020]' : 'bg-teal-100 text-[#31AAA9]'
                        }`}>
                          {rec.schedule_status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{rec.reporter_comment}"</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <span>Progress: <strong className="text-slate-800">{rec.progress.toFixed(0)}%</strong></span>
                      <span className="font-medium text-[#6C1A1A]">Status: {rec.approval_status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <AuditTrail logs={auditLogs} />

          </div>

        </main>
      </div>

      {/* NOTIFY REPORTER MODAL */}
      {notifyModalTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-[#A82020]" />
                <h3 className="font-bold text-slate-900 text-base">Send Lagging Task Alert</h3>
              </div>
              <button
                onClick={() => setNotifyModalTask(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">
                  Target Activity: <strong className="text-slate-900">{notifyModalTask.name}</strong>
                </p>
                <p className="text-xs text-slate-500 mb-3">
                  Recipient: <strong className="text-slate-700">reporter@plan2site.demo</strong> (Site Reporter)
                </p>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notification Alert Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-[#A82020] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNotifyModalTask(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A82020] hover:bg-[#8f1b1b] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Alert Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
