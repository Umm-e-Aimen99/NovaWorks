import React, { useState } from 'react';
import { Task, User } from '../types';
import { api } from '../api/client';
import {
  CheckSquare,
  Clock,
  Calendar,
  Briefcase,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  PlayCircle
} from 'lucide-react';

interface AgentTasksViewProps {
  user: User;
  tasks: Task[];
  onTaskUpdated: () => void;
}

export const AgentTasksView: React.FC<AgentTasksViewProps> = ({ user, tasks, onTaskUpdated }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<{ title: string; reason: string } | null>(null);

  const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const pending = tasks.filter((t) => t.status === 'PENDING').length;

  const handleStatusChange = async (taskId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      setUpdatingId(taskId);
      await api.updateTaskStatus(taskId, newStatus);
      onTaskUpdated();
    } catch (err: any) {
      alert('Failed to update task: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Agent Banner */}
      <div className="rounded-xl border border-emerald-900/40 bg-zinc-900 p-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span>EXECUTION AGENT WORKSPACE · MY TASKS</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Hello, {user.name} ({user.specialization})
        </h1>
        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
          You are authenticated as role <strong className="text-emerald-300">AGENT</strong>. This execution dashboard is scoped strictly to tasks assigned to your employee ID (<span className="font-mono text-zinc-300">{user.id}</span>).
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Assigned Tasks</div>
          <div className="text-2xl font-bold text-white mt-1">{tasks.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Direct responsibility</div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Total Hours</div>
          <div className="text-2xl font-bold text-white mt-1">{totalHours} hrs</div>
          <div className="text-[11px] text-zinc-500 mt-1">Estimated sprint load</div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">In Progress</div>
          <div className="text-2xl font-bold text-amber-300 mt-1">{inProgress}</div>
          <div className="text-[11px] text-zinc-500 mt-1">{pending} pending</div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <div className="text-xs text-zinc-400">Completed</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{completed}</div>
          <div className="text-[11px] text-emerald-500 mt-1">
            {tasks.length > 0 ? `${Math.round((completed / tasks.length) * 100)}% progress` : '0%'}
          </div>
        </div>
      </div>

      {/* Tasks Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            My Execution Tasks ({tasks.length})
          </h2>
          <span className="text-xs text-zinc-500">Live task execution & status updates</span>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center text-xs text-zinc-400">
            No tasks currently assigned to you. Once an Admin processes a meeting transcript, tasks matching your skills or assignment will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-5 space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                        {task.project_name || 'Project'}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-xs text-zinc-400">PM: {task.manager_name}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{task.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-3xl">
                      {task.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-indigo-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {task.estimated_hours}h
                      </span>
                      <span className="text-amber-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {task.deadline}
                      </span>
                    </div>

                    {/* Status Dropdown / Action */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleStatusChange(task.id, 'PENDING')}
                        disabled={updatingId === task.id || task.status === 'PENDING'}
                        className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
                          task.status === 'PENDING'
                            ? 'bg-zinc-800 text-zinc-200 border-zinc-600 font-bold'
                            : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                        disabled={updatingId === task.id || task.status === 'IN_PROGRESS'}
                        className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
                          task.status === 'IN_PROGRESS'
                            ? 'bg-amber-950 text-amber-300 border-amber-800 font-bold'
                            : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:text-amber-300'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                        disabled={updatingId === task.id || task.status === 'COMPLETED'}
                        className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
                          task.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 font-bold'
                            : 'bg-zinc-950/60 text-zinc-500 border-zinc-800 hover:text-emerald-300'
                        }`}
                      >
                        Completed ✓
                      </button>
                    </div>
                  </div>
                </div>

                {/* Assignment Explanation */}
                {task.assignment_reason && (
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-indigo-400" />
                      <span>Assignment Rationale:</span>
                      <em className="text-zinc-300 not-italic">"{task.assignment_reason}"</em>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
