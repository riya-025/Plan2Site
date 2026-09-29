"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getProjectApi, getReportDownloadUrl } from "@/lib/api";
import { FileSpreadsheet, Download, Layers, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default function PlannerReportsPage() {
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjectApi(1)
      .then((res) => setProjectData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const metrics = projectData?.metrics || {
    total_tasks: 0,
    completed: 0,
    in_progress: 0,
    not_started: 0,
    on_time: 0,
    lagging: 0,
    overall_progress: 0
  };

  const handleDownload = () => {
    window.open(getReportDownloadUrl(1), "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="Project Planner" />

        <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#31AAA9] text-white flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Project Reports & Export</h1>
                <p className="text-xs text-slate-500">Generate and download official progress summary reports</p>
              </div>
            </div>

            {/* Download Report Button (Section 21 Requirements) */}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#31AAA9] hover:bg-[#289190] text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Report (CSV)</span>
            </button>
          </div>

          {/* Executive Summary Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
              Project Performance Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Tasks</span>
                <p className="text-2xl font-black text-slate-800">{metrics.total_tasks}</p>
              </div>
              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-center space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase">Completed</span>
                <p className="text-2xl font-black text-emerald-700">{metrics.completed}</p>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 text-center space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase">In Progress</span>
                <p className="text-2xl font-black text-amber-700">{metrics.in_progress}</p>
              </div>
              <div className="bg-red-50/60 p-4 rounded-xl border border-red-200 text-center space-y-1">
                <span className="text-xs font-bold text-[#A82020] uppercase">Lagging</span>
                <p className="text-2xl font-black text-[#A82020]">{metrics.lagging}</p>
              </div>
              <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-200 text-center space-y-1 col-span-2 md:col-span-1">
                <span className="text-xs font-bold text-[#31AAA9] uppercase">Overall Progress</span>
                <p className="text-2xl font-black text-[#31AAA9]">{metrics.overall_progress}%</p>
              </div>
            </div>

            <div className="bg-[#F8E0A4]/30 border border-[#e8cc84] rounded-xl p-4 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-[#6C1A1A]">Report Export Metadata:</p>
              <p>Project: <strong>{projectData?.project?.name || "My House Project"}</strong> • Type: {projectData?.project?.project_type || "Residential Construction"} • Location: {projectData?.project?.location || "Pune"}</p>
              <p className="text-slate-500">Baseline Plan File: {projectData?.project?.pdf_filename || "sample_house_plan.pdf"}</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
