"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginApi } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { HardHat, User, ShieldCheck, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("planner@plan2site.demo");
  const [password, setPassword] = useState("demo123");
  const [selectedRole, setSelectedRole] = useState<"Project Planner" | "Site Reporter">("Project Planner");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginApi(email, password);
      saveSession(res.user);
      
      if (res.user.role === "Project Planner") {
        router.push("/planner/dashboard");
      } else {
        router.push("/reporter/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please use demo credentials.");
    } finally {
      setLoading(false);
    }
  };

  const setPlannerQuickLogin = () => {
    setEmail("planner@plan2site.demo");
    setPassword("demo123");
    setSelectedRole("Project Planner");
  };

  const setReporterQuickLogin = () => {
    setEmail("reporter@plan2site.demo");
    setPassword("demo123");
    setSelectedRole("Site Reporter");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#31AAA9_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-max-md text-center space-y-3 z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#31AAA9] text-white shadow-lg mb-1">
          <HardHat className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Plan2Site AI</h1>
        <p className="text-sm text-[#F8E0A4] font-medium max-w-sm mx-auto">
          Bridging the gap between planned work and actual site progress.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700/30">
          
          {/* Quick Demo Role Toggle */}
          <div className="mb-6 bg-slate-100 p-1.5 rounded-xl flex gap-1 border border-slate-200">
            <button
              type="button"
              onClick={setPlannerQuickLogin}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedRole === "Project Planner"
                  ? "bg-[#31AAA9] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Project Planner</span>
            </button>
            <button
              type="button"
              onClick={setReporterQuickLogin}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedRole === "Site Reporter"
                  ? "bg-[#31AAA9] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Site Reporter</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-[#A82020] text-xs font-semibold p-3 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Demo Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#31AAA9] focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#31AAA9] focus:outline-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#31AAA9] hover:bg-[#289190] text-white font-bold text-sm rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Preset Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#6C1A1A]">
              <Sparkles className="w-3.5 h-3.5 text-[#31AAA9]" />
              <span>Demo Credentials</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Planner:</span>
                <code className="bg-white px-1.5 py-0.5 rounded border text-slate-700">planner@plan2site.demo</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Reporter:</span>
                <code className="bg-white px-1.5 py-0.5 rounded border text-slate-700">reporter@plan2site.demo</code>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="font-semibold text-slate-800">Password:</span>
                <code className="bg-white px-1.5 py-0.5 rounded border text-slate-700">demo123</code>
              </div>
            </div>
          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-400 font-medium">
          SIH26122 Intelligent Data Capture Layer • Smart Automation • Team CodeNova
        </p>
      </div>
    </div>
  );
}
