"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TimelineGantt from "@/components/TimelineGantt";
import { getTasksApi } from "@/lib/api";
import { CalendarRange, Layers, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export default function PlannerSchedulePage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasksApi(1)
      .then((data) => setTasks(data.tasks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="Project Planner" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#31AAA9] text-white flex items-center justify-center font-bold">
                <CalendarRange className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Project Master Schedule</h1>
                <p className="text-xs text-slate-500">Extracted baseline activities & Gantt timeline from PDF plan</p>
              </div>
            </div>
            <span className="text-xs bg-teal-50 text-[#31AAA9] font-bold px-3 py-1 rounded-full border border-teal-200">
              {tasks.length} Extracted Activities
            </span>
          </div>

          {/* Visual Gantt Chart Component */}
          <TimelineGantt tasks={tasks} />

          {/* Detailed Task Cards Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Detailed Activity Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`p-4 rounded-xl border transition space-y-2.5 ${
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
                    <span className="font-bold text-slate-800">{task.current_progress.toFixed(0)}%</span>
                  </div>

                  {task.lagging_reason && (
                    <div className="text-[11px] text-[#A82020] bg-red-100/60 p-2 rounded-lg font-medium flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{task.lagging_reason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
