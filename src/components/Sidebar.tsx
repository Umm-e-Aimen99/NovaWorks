import React from 'react';
import { Role } from '../types';
import { Sparkles, LayoutDashboard, FolderGit2, CheckSquare, Users, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  role: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, role }) => {
  interface NavLink {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }

  const adminLinks: NavLink[] = [
    { id: 'studio', label: 'Transcript Studio', icon: Sparkles, highlight: true },
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'All Projects', icon: FolderGit2 },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
    { id: 'team', label: 'Team Directory', icon: Users },
  ];

  const managerLinks: NavLink[] = [
    { id: 'dashboard', label: 'Manager Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'My Managed Projects', icon: FolderGit2 },
    { id: 'tasks', label: 'Assigned Project Tasks', icon: CheckSquare },
    { id: 'team', label: 'Team Directory', icon: Users },
  ];

  const agentLinks: NavLink[] = [
    { id: 'tasks', label: 'My Execution Tasks', icon: CheckSquare, highlight: true },
    { id: 'projects', label: 'Project Context', icon: FolderGit2 },
    { id: 'team', label: 'Team Directory', icon: Users },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'MANAGER' ? managerLinks : agentLinks;

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 px-3 mb-2 font-semibold">
            {role} WORKSPACE
          </div>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-all text-left ${
                    isActive
                      ? item.highlight
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-zinc-800 text-white'
                      : item.highlight
                      ? 'text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive && item.highlight ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-zinc-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {item.highlight && !isActive && (
                    <span className="ml-auto text-[9px] font-mono bg-indigo-950 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-800">
                      LIVE
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Security / RBAC Banner */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>Strict RBAC Active</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {role === 'ADMIN' && 'Full visibility over global portfolio, transcript ingestion, and system auditing.'}
            {role === 'MANAGER' && 'Scoped strictly to your assigned projects. Cross-manager access is blocked at API level.'}
            {role === 'AGENT' && 'Scoped strictly to tasks assigned to your employee ID. Other agent assignments are protected.'}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex justify-between items-center">
        <span>The Infinity Hack ’26</span>
        <span className="font-mono text-zinc-400">v1.0.0</span>
      </div>
    </aside>
  );
};
