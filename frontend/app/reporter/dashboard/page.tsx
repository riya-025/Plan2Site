"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TimelineGantt from "@/components/TimelineGantt";
import { getProjectApi, getTasksApi, getNotificationsApi, acknowledgeNotificationApi } from "@/lib/api";
import { ClipboardCheck, FileEdit, BellRing, Check, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ReporterDashboard() {
  const router = useRouter();
  const [projectData, setProjectData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ackMessage, setAckMessage] = useState("");

  const loadReporterData = async () => {
    try {
      setLoading(true);
      const [proj, t, notifs] = await Promise.all([
        getProjectApi(1),
        getTasksApi(1),
        getNotificationsApi(1)
      ]);
      setProjectData(proj);
      setTasks(t.tasks || []);
      setNotifications(notifs.notifications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReporterData();
  }, []);

  const handleAcknowledge = async (notifId: number, taskId: number) => {
    try {
      await acknowledgeNotificationApi(notifId, "Acknowledged lagging schedule alert. Updating site status.");
      setAckMessage("Notification acknowledged. Redirecting to update form...");
      setTimeout(() => {
        setAckMessage("");
        router.push(`/reporter/updates?task_id=${taskId}`);
      }, 1500);
      loadReporterData();
    } catch (err: any) {
      alert(err.message || "Failed to acknowledge notification.");
    }
  };

  const unreadNotifs = notifications.filter(n => n.status === "UNREAD");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="Site Reporter" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#31AAA9] text-white flex items-center justify-center font-bold">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Site Reporter Portal</h1>
                <p className="text-xs text-slate-500">Monitor physical site progress & record real-time updates</p>
              </div>
            </div>

            <Link
              href="/reporter/updates"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#31AAA9] hover:bg-[#289190] text-white font-bold text-xs rounded-xl shadow-sm transition"
            >
              <FileEdit className="w-4 h-4" />
              <span>+ Submit Site Update</span>
            </Link>
          </div>

          {ackMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{ackMessage}</span>
            </div>
          )}

          {/* PLANNER NOTIFICATIONS & LAGGING TASK ALERTS BANNER */}
          {notifications.length > 0 && (
            <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-[#A82020]" />
                  <h3 className="font-bold text-slate-900 text-sm">Planner Lagging Task Notifications</h3>
                </div>
                <span className="text-xs bg-red-100 text-[#A82020] font-bold px-2.5 py-0.5 rounded-full">
                  {unreadNotifs.length} Unread Alert{unreadNotifs.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      notif.status === 'UNREAD' 
                        ? 'bg-red-50/50 border-red-200' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Task: {notif.task_name}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          notif.status === 'UNREAD' ? 'bg-[#A82020] text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {notif.status}
                        </span>
                        <span className="text-[10px] text-slate-400">{notif.created_at}</span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">"{notif.message}"</p>
                      {notif.ack_notes && (
                        <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                          ✔ Acknowledged Notes: {notif.ack_notes} ({notif.acknowledged_at})
                        </p>
                      )}
                    </div>

                    {notif.status === "UNREAD" ? (
                      <button
                        onClick={() => handleAcknowledge(notif.id, notif.task_id)}
                        className="shrink-0 px-4 py-2 bg-[#31AAA9] hover:bg-[#289190] text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acknowledge & Update</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-bold shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Visualization */}
          <TimelineGantt tasks={tasks} />

          {/* Task Status List Cards (Section 7 Requirements) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Assigned Tasks & Baseline Timeline</h3>
              <span className="text-xs text-slate-500">{tasks.length} Active Tasks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => {
                let statusBg = "bg-slate-100 text-slate-700";
                if (task.status === "COMPLETED") statusBg = "bg-emerald-100 text-emerald-800";
                if (task.status === "IN PROGRESS") statusBg = "bg-[#F8E0A4] text-[#6C1A1A]";

                return (
                  <div key={task.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {task.sequence}. {task.name}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${statusBg}`}>
                        {task.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>Days {task.planned_start_day} - {task.planned_end_day}</span>
                      <span className="font-bold text-slate-800">Progress: {task.current_progress.toFixed(0)}%</span>
                    </div>

                    <Link
                      href={`/reporter/updates?task_id=${task.id}`}
                      className="block w-full text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg transition border border-slate-200"
                    >
                      Update This Task Status
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
