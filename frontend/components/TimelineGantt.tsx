"use client";

interface TaskItem {
  id: number;
  name: string;
  description?: string;
  planned_start_day: number;
  planned_end_day: number;
  duration_days: number;
  sequence: number;
  status: string;
  current_progress: number;
  schedule_status: string;
  lagging_reason?: string;
}

interface TimelineGanttProps {
  tasks: TaskItem[];
}

export default function TimelineGantt({ tasks }: TimelineGanttProps) {
  const maxDay = 50; // Demo span

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Project Gantt Schedule</h3>
          <p className="text-xs text-slate-500">Planned timeline vs actual site progress</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#31AAA9]"></span> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#F8E0A4] border border-[#e8cc84]"></span> In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-[#A82020]"></span> Lagging
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-slate-200"></span> Not Started
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header Day Scale */}
          <div className="grid grid-cols-12 gap-1 text-[11px] font-semibold text-slate-500 pb-2 border-b border-slate-200">
            <div className="col-span-4 pl-2">Task Details</div>
            <div className="col-span-8 flex justify-between px-2 text-slate-400">
              <span>Day 1</span>
              <span>Day 10</span>
              <span>Day 20</span>
              <span>Day 30</span>
              <span>Day 40</span>
              <span>Day 50</span>
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const startPct = Math.max(0, ((task.planned_start_day - 1) / maxDay) * 100);
              const widthPct = Math.min(100 - startPct, (task.duration_days / maxDay) * 100);

              let barColor = "bg-slate-300";
              if (task.status === "COMPLETED") barColor = "bg-[#31AAA9]";
              else if (task.schedule_status === "LAGGING") barColor = "bg-[#A82020]";
              else if (task.status === "IN PROGRESS") barColor = "bg-[#31AAA9]/80";

              return (
                <div key={task.id} className="grid grid-cols-12 gap-1 py-3 items-center hover:bg-slate-50/80 transition rounded-lg px-2">
                  <div className="col-span-4 pr-2">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-slate-800 truncate" title={task.name}>
                        {task.sequence}. {task.name}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        task.schedule_status === 'LAGGING' 
                          ? 'bg-red-100 text-[#A82020]' 
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {task.schedule_status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Day {task.planned_start_day} - Day {task.planned_end_day} ({task.duration_days}d)</span>
                      <span className="font-medium text-slate-700">{task.current_progress.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Gantt Bar Track */}
                  <div className="col-span-8 relative h-7 bg-slate-100/90 rounded-md overflow-hidden border border-slate-200/60">
                    <div
                      className={`absolute top-1 bottom-1 rounded-sm ${barColor} shadow-sm flex items-center justify-end px-1.5 transition-all duration-300`}
                      style={{
                        left: `${startPct}%`,
                        width: `${Math.max(widthPct, 2)}%`,
                      }}
                    >
                      {widthPct > 5 && (
                        <span className="text-[10px] font-bold text-white drop-shadow-sm">
                          {task.current_progress.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
