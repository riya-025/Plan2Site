"use client";

import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

interface ScenarioPresetsProps {
  onSelectScenario: (taskId: number | null, status: string, comment: string) => void;
  tasks: Array<{ id: number; name: string }>;
}

export default function ScenarioPresets({ onSelectScenario, tasks }: ScenarioPresetsProps) {
  const foundationTask = tasks.find(t => t.name.toLowerCase().includes("foundation")) || tasks[2] || tasks[0];
  const brickworkTask = tasks.find(t => t.name.toLowerCase().includes("brick")) || tasks[4] || tasks[0];

  const scenarios = [
    {
      title: "Scenario 1: Clear Match",
      subtitle: "100% Progress / On Time",
      badge: "MATCH",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: CheckCircle2,
      taskId: foundationTask ? foundationTask.id : null,
      status: "COMPLETED",
      comment: "Foundation work completed successfully."
    },
    {
      title: "Scenario 2: Lagging Work",
      subtitle: "50% Progress / Behind Schedule",
      badge: "MATCH (LAGGING)",
      badgeColor: "bg-red-100 text-[#A82020] border-red-200",
      icon: AlertTriangle,
      taskId: brickworkTask ? brickworkTask.id : null,
      status: "IN PROGRESS",
      comment: "Brickwork is around 50% complete and work is behind because material arrived late."
    },
    {
      title: "Scenario 3: Unclear Update",
      subtitle: "Vague report requiring review",
      badge: "REVIEW",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      icon: HelpCircle,
      taskId: null,
      status: "IN PROGRESS",
      comment: "Some work was done near the back side of the house."
    }
  ];

  return (
    <div className="bg-[#F8E0A4]/30 border border-[#e8cc84] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#6C1A1A]" />
        <h4 className="font-bold text-[#6C1A1A] text-xs uppercase tracking-wider">
          Demo Quick-Test Scenarios
        </h4>
      </div>
      <p className="text-xs text-slate-600">
        Click any scenario below to auto-fill the report form and test the AI Reconciliation engine:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {scenarios.map((sc, i) => {
          const Icon = sc.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectScenario(sc.taskId, sc.status, sc.comment)}
              className="text-left bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-3 transition shadow-xs group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 group-hover:text-[#31AAA9]">
                  <Icon className="w-3.5 h-3.5 text-[#31AAA9]" />
                  <span>{sc.title}</span>
                </div>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">{sc.subtitle}</p>
              <p className="text-[10px] text-slate-400 italic mt-1 line-clamp-1">"{sc.comment}"</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
