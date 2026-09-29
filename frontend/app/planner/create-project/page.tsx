"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { createProjectApi, uploadPdfApi } from "@/lib/api";
import { Building2, Upload, FileCheck, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function CreateProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("My House Project");
  const [projectType, setProjectType] = useState("Residential Construction");
  const [location, setLocation] = useState("Pune");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"FORM" | "PROCESSING" | "SUCCESS">("FORM");
  const [error, setError] = useState("");
  const [extractedCount, setExtractedCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a valid Project Plan PDF file.");
      return;
    }

    try {
      setLoading(true);
      setStep("PROCESSING");

      // Step 1: Create Project record
      const projRes = await createProjectApi({
        name,
        project_type: projectType,
        location,
        start_date: startDate
      });

      const projectId = projRes.project_id;

      // Step 2: Upload PDF & extract tasks via PyMuPDF + RAG / AI Engine
      const pdfRes = await uploadPdfApi(projectId, file);
      setExtractedCount(pdfRes.extracted_tasks_count || 0);

      setStep("SUCCESS");
      setTimeout(() => {
        router.push("/planner/dashboard");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Failed to create project or extract PDF schedule.");
      setStep("FORM");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="Project Planner" />

        <main className="flex-1 p-6 max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#31AAA9] text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Create New Project</h1>
                <p className="text-xs text-slate-500">Upload baseline PDF to automatically extract timeline tasks</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-[#A82020] text-xs font-semibold p-3.5 rounded-xl">
                {error}
              </div>
            )}

            {step === "PROCESSING" && (
              <div className="py-12 text-center space-y-4">
                <div className="inline-block w-10 h-10 border-4 border-[#31AAA9] border-t-transparent rounded-full animate-spin"></div>
                <h3 className="font-bold text-slate-800 text-base">Processing Master Plan PDF...</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  1. Extracting text using PyMuPDF <br/>
                  2. Splitting into RAG embedding chunks <br/>
                  3. AI generating baseline construction tasks & Gantt timeline
                </p>
              </div>
            )}

            {step === "SUCCESS" && (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Project Created Successfully!</h3>
                <p className="text-xs text-slate-600">
                  Extracted <strong className="text-[#31AAA9]">{extractedCount} planned tasks</strong> from PDF schedule.
                </p>
                <p className="text-xs text-slate-400">Redirecting to Dashboard...</p>
              </div>
            )}

            {step === "FORM" && (
              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#31AAA9] focus:outline-none"
                      placeholder="e.g. My House Project"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Project Type
                    </label>
                    <input
                      type="text"
                      required
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#31AAA9] focus:outline-none"
                      placeholder="e.g. Residential Construction"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#31AAA9] focus:outline-none"
                      placeholder="e.g. Pune"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#31AAA9] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Upload Plan PDF (Section 4 Requirements) */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Upload Project Plan PDF (.pdf)
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    The PDF becomes the primary source of truth for the AI/RAG engine.
                  </p>

                  <div className="border-2 border-dashed border-slate-300 hover:border-[#31AAA9] bg-slate-50 p-6 rounded-xl text-center cursor-pointer transition">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer block space-y-2">
                      <div className="w-10 h-10 rounded-full bg-teal-50 text-[#31AAA9] flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      {file ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs">
                          <FileCheck className="w-4 h-4" />
                          <span>Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-slate-800">Click to upload Master Plan PDF</p>
                          <p className="text-[11px] text-slate-400">PDF documents up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/planner/dashboard")}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#31AAA9] hover:bg-[#289190] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Tasks & Schedule</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
