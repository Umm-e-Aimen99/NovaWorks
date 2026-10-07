import React from 'react';
import { User } from '../types';
import { Users, Shield, ShieldCheck, Code, Award, Info } from 'lucide-react';

interface TeamDirectoryViewProps {
  members: User[];
}

export const TeamDirectoryView: React.FC<TeamDirectoryViewProps> = ({ members }) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-950 text-purple-300 border border-purple-800';
      case 'MANAGER':
        return 'bg-blue-950 text-blue-300 border border-blue-800';
      case 'AGENT':
        return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Verified Team Directory</h1>
            <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
              {members.length} Members
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Authoritative corporate roster referenced by the AI processing engine to eliminate employee hallucinations.
          </p>
        </div>
      </div>

      {/* Info Callout */}
      <div className="rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-4 text-xs text-zinc-300 flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-indigo-200">Zero Hallucination Guarantee:</strong> During AI transcript extraction, the Gemini model is explicitly primed with this exact team list. The server-side deterministic validator subsequently checks every generated <code className="text-indigo-300 font-mono">managerId</code> and <code className="text-indigo-300 font-mono">assigneeId</code> against this database table before committing any records.
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{member.name}</h3>
                <div className="text-xs text-zinc-400 mt-0.5">{member.email}</div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${getRoleBadge(member.role)}`}>
                {member.role}
              </span>
            </div>

            <div className="text-xs space-y-1">
              <div className="text-zinc-500 text-[11px]">Specialization:</div>
              <div className="text-zinc-200 font-medium">{member.specialization}</div>
            </div>

            <div className="space-y-1 pt-1 border-t border-zinc-800/80">
              <div className="text-zinc-500 text-[11px]">Matched Skills:</div>
              <div className="flex flex-wrap gap-1">
                {member.skills.split(',').map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[10px] bg-zinc-950 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-800"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-zinc-500">
              ID: {member.id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
