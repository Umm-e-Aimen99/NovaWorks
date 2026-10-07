import React from 'react';
import { Project, Task, User } from '../types';
import {
  FolderGit2,
  CheckSquare,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface AdminDashboardProps {
  projects: Project[];
  tasks: Task[];
  team: User[];
  onOpenStudio: () => void;
  onSelectProject: (projectId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  tasks,
  team,
  onOpenStudio,
  onSelectProject,
}) => {
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Call To Action */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-zinc-900 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>THE INFINITY HACK ’26 PIPELINE</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              From Meeting to Execution in Seconds
            </h1>
            <p className="text-xs text-zinc-300 max-w-xl leading-relaxed">
              Transform unstructured meeting recordings or transcripts into verified, role-scoped project plans with zero hallucinated employees and strict deadline guarantees.
            </p>
          </div>

          <button
            onClick={onOpenStudio}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Process New Meeting Transcript</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Projects</span>
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{projects.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Across corporate portfolio</div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{tasks.length}</div>
          <div className="text-[11px] text-emerald-400/90 mt-1">
            {completedTasks} completed · {inProgressTasks} in progress
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Estimated Workload</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalHours} hrs</div>
          <div className="text-[11px] text-zinc-500 mt-1">Engineered delivery estimates</div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Verified Team</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{team.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Managers & execution agents</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            Active Projects Portfolio
          </h2>
          <span className="text-xs text-zinc-500">{projects.length} project(s) recorded</span>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center space-y-2">
            <p className="text-xs text-zinc-400">No projects currently saved in database.</p>
            <button
              onClick={onOpenStudio}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
            >
              Click here to run the meeting transcript processor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="group cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-900 hover:border-zinc-700 p-5 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                      {proj.client_name}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {proj.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-500">Deadline</div>
                    <div className="text-xs font-mono font-semibold text-amber-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      {proj.deadline}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Manager:</span>
                    <span className="text-zinc-200 font-medium">{proj.manager_name}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-indigo-300">{proj.task_count || 0} tasks</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-amber-300">{proj.total_hours || 0}h total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Tasks Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          Recent Execution Tasks
        </h2>

        {tasks.length === 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-center text-xs text-zinc-500">
            No tasks in queue.
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 text-[11px] border-b border-zinc-800 font-medium">
                  <tr>
                    <th className="p-3">Task Title</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Assignee (Agent)</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3">Est. Hours</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {tasks.slice(0, 8).map((task) => (
                    <tr key={task.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 font-medium text-zinc-200">{task.title}</td>
                      <td className="p-3 text-zinc-400">{task.project_name}</td>
                      <td className="p-3 font-mono text-zinc-300">{task.assignee_name}</td>
                      <td className="p-3 font-mono text-zinc-400">{task.deadline}</td>
                      <td className="p-3 font-mono text-indigo-300">{task.estimated_hours}h</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            task.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
