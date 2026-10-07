import React, { useEffect, useState } from 'react';
import { Project, User } from '../types';
import { api } from '../api/client';
import {
  ArrowLeft,
  Calendar,
  Clock,
  UserCheck,
  CheckSquare,
  Zap,
  HelpCircle
} from 'lucide-react';

interface ProjectDetailViewProps {
  projectId: string;
  currentUser: User;
  onBack: () => void;
  onTaskUpdated?: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  currentUser,
  onBack,
  onTaskUpdated
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<{ title: string; reason: string } | null>(null);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProject(projectId);
      setProject(res.project);
    } catch (err: any) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleStatusChange = async (taskId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      loadProject();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      alert('Status update failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </button>
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300">
          {error || 'Project not found or access denied.'}
        </div>
      </div>
    );
  }

  const tasks = project.tasks || [];
  const decisions = project.decisions || [];
  const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to projects list
      </button>

      {/* Project Overview Card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Client: {project.client_name}
            </span>
            <h1 className="text-xl font-bold text-white">{project.name}</h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <div className="text-[10px] text-zinc-500">Project Deadline</div>
              <div className="text-amber-300 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {project.deadline}
              </div>
            </div>
            <div className="text-right pl-3 border-l border-zinc-800">
              <div className="text-[10px] text-zinc-500">Total Workload</div>
              <div className="text-indigo-300 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {totalHours} hrs
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">{project.description}</p>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-400">
          <UserCheck className="w-4 h-4 text-blue-400" />
          <span>Assigned Project Manager: <strong className="text-zinc-200">{project.manager_name}</strong> ({project.manager_email})</span>
        </div>
      </div>

      {/* Detected Decisions / Revisions Log */}
      {decisions.length > 0 && (
        <div className="rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Decision Intelligence Log</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {decisions.map((dec) => (
              <div key={dec.id} className="p-3 bg-zinc-900 rounded border border-zinc-800 text-xs space-y-1">
                <div className="flex items-center justify-between font-medium text-zinc-200">
                  <span>{dec.topic}</span>
                  <span className="font-mono text-emerald-400 font-semibold">{dec.final_value}</span>
                </div>
                <p className="text-[11px] text-zinc-400">{dec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          Execution Tasks ({tasks.length})
        </h2>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 text-xs space-y-2 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-semibold text-zinc-100 text-sm">{task.title}</div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-indigo-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    {task.estimated_hours}h
                  </span>
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    {task.deadline}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{task.description}</p>

              <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
                <div>
                  Assigned Agent: <strong className="text-zinc-200">{task.assignee_name}</strong>
                  {task.assignment_reason && (
                    <button
                      onClick={() =>
                        setSelectedReason({
                          title: task.title,
                          reason: task.assignment_reason!
                        })
                      }
                      className="ml-3 text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Why this assignment?</span>
                    </button>
                  )}
                </div>

                {/* Status Toggle (if user has permission: Agent who owns it, Manager of project, or Admin) */}
                <div className="flex items-center gap-1 font-mono">
                  <button
                    onClick={() => handleStatusChange(task.id, 'PENDING')}
                    className={`px-2 py-0.5 rounded border text-[10px] ${
                      task.status === 'PENDING'
                        ? 'bg-zinc-800 text-white border-zinc-600'
                        : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                    className={`px-2 py-0.5 rounded border text-[10px] ${
                      task.status === 'IN_PROGRESS'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-amber-300'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                    className={`px-2 py-0.5 rounded border text-[10px] ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-emerald-300'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable AI Modal */}
      {selectedReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white">{selectedReason.title}</h3>
            <div className="p-3 bg-zinc-950 rounded border border-zinc-800 text-xs text-zinc-300">
              "{selectedReason.reason}"
            </div>
            <button
              onClick={() => setSelectedReason(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
