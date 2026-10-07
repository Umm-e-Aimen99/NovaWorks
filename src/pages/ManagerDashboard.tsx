import React from 'react';
import { Project, Task, User } from '../types';
import {
  FolderGit2,
  CheckSquare,
  Clock,
  Calendar,
  ShieldCheck,
  UserCheck,
  ChevronRight
} from 'lucide-react';

interface ManagerDashboardProps {
  user: User;
  projects: Project[];
  tasks: Task[];
  onSelectProject: (projectId: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  user,
  projects,
  tasks,
  onSelectProject,
}) => {
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Manager Welcome Banner */}
      <div className="rounded-xl border border-blue-900/40 bg-zinc-900 p-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>MANAGER WORKSPACE · ISOLATED SCOPE</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Welcome back, {user.name}
        </h1>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          You are authenticated as <span className="text-zinc-200 font-semibold">{user.role}</span>. Backend RBAC ensures you only have access to projects where you are designated as the Project Manager.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">My Managed Projects</div>
          <div className="text-2xl font-bold text-white mt-1">{projects.length}</div>
          <div className="text-[11px] text-blue-400 mt-1">Lead responsibility</div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Assigned Tasks</div>
          <div className="text-2xl font-bold text-white mt-1">{tasks.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">{completedTasks} completed</div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Total Sprint Effort</div>
          <div className="text-2xl font-bold text-white mt-1">{totalHours} hrs</div>
          <div className="text-[11px] text-zinc-500 mt-1">Across assigned team</div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Active Workstreams</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">{inProgressTasks}</div>
          <div className="text-[11px] text-zinc-500 mt-1">{pendingTasks} pending kickoff</div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-blue-400" />
          My Assigned Projects ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center text-xs text-zinc-400">
            No projects currently assigned to your manager ID. Run the transcript processor from an Admin account to assign work.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="cursor-pointer rounded-lg border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-900 hover:border-zinc-700 p-5 space-y-3 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold">
                      Client: {proj.client_name}
                    </span>
                    <h3 className="text-base font-bold text-white hover:text-blue-200 transition-colors">
                      {proj.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500">Project Deadline</div>
                      <div className="text-xs font-mono font-semibold text-amber-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {proj.deadline}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{proj.description}</p>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Designated Manager: <strong className="text-zinc-200">{proj.manager_name}</strong></span>
                  </div>

                  <div className="font-mono text-[11px] text-zinc-300">
                    {proj.task_count || 0} tasks · {proj.total_hours || 0} hrs estimated
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks breakdown for this manager */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          Project Tasks & Assigned Agents
        </h2>

        {tasks.length === 0 ? (
          <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-500 text-center">
            No tasks found.
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 text-[11px] border-b border-zinc-800 font-medium">
                  <tr>
                    <th className="p-3">Task Title</th>
                    <th className="p-3">Assigned Agent</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3">Est. Hours</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 font-medium text-zinc-200">{task.title}</td>
                      <td className="p-3 font-mono text-zinc-300">{task.assignee_name}</td>
                      <td className="p-3 font-mono text-zinc-400">{task.deadline}</td>
                      <td className="p-3 font-mono text-blue-300">{task.estimated_hours}h</td>
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
