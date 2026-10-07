import React, { useEffect, useState } from 'react';
import { User, Project, Task } from './types';
import { api, authStorage } from './api/client';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { TranscriptStudio } from './pages/TranscriptStudio';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { AgentTasksView } from './pages/AgentTasksView';
import { TeamDirectoryView } from './pages/TeamDirectoryView';
import { ProjectDetailView } from './pages/ProjectDetailView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(authStorage.getUser());
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Check existing session
  useEffect(() => {
    async function verifySession() {
      const token = authStorage.getToken();
      if (!token) {
        setLoadingAuth(false);
        return;
      }
      try {
        const res = await api.getMe();
        setCurrentUser(res.user);
        authStorage.setAuth(token, res.user);
      } catch {
        authStorage.clearAuth();
        setCurrentUser(null);
      } finally {
        setLoadingAuth(false);
      }
    }
    verifySession();
  }, []);

  // Set default initial tab based on role
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'ADMIN') {
      setCurrentTab('dashboard');
    } else if (currentUser.role === 'MANAGER') {
      setCurrentTab('dashboard');
    } else {
      setCurrentTab('tasks');
    }
  }, [currentUser?.role]);

  // Load app data whenever currentUser changes
  const loadWorkspaceData = async () => {
    if (!currentUser) return;
    try {
      setLoadingData(true);
      const [projRes, taskRes, teamRes] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
        api.getTeam(),
      ]);
      setProjects(projRes.projects);
      setTasks(taskRes.tasks);
      setTeamMembers(teamRes.members);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadWorkspaceData();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setSelectedProjectId(null);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs font-mono">Initializing PulsePM Workspace...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased">
      {/* Top Bar with Instant Role Switcher */}
      <TopNav
        user={currentUser}
        onUserChange={(newUser) => {
          setCurrentUser(newUser);
          setSelectedProjectId(null);
        }}
        onLogout={handleLogout}
        onRefreshData={loadWorkspaceData}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={selectedProjectId ? 'projects' : currentTab}
          onTabChange={(tab) => {
            setSelectedProjectId(null);
            setCurrentTab(tab);
          }}
          role={currentUser.role}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-950/60 pb-12">
          {selectedProjectId ? (
            <ProjectDetailView
              projectId={selectedProjectId}
              currentUser={currentUser}
              onBack={() => setSelectedProjectId(null)}
              onTaskUpdated={loadWorkspaceData}
            />
          ) : (
            <>
              {/* Tab: Transcript Studio (Admin only) */}
              {currentTab === 'studio' && currentUser.role === 'ADMIN' && (
                <TranscriptStudio
                  onPlanSaved={() => {
                    loadWorkspaceData();
                    setCurrentTab('dashboard');
                  }}
                />
              )}

              {/* Tab: Dashboard / Overview */}
              {currentTab === 'dashboard' && (
                <>
                  {currentUser.role === 'ADMIN' && (
                    <AdminDashboard
                      projects={projects}
                      tasks={tasks}
                      team={teamMembers}
                      onOpenStudio={() => setCurrentTab('studio')}
                      onSelectProject={(pId) => setSelectedProjectId(pId)}
                    />
                  )}
                  {currentUser.role === 'MANAGER' && (
                    <ManagerDashboard
                      user={currentUser}
                      projects={projects}
                      tasks={tasks}
                      onSelectProject={(pId) => setSelectedProjectId(pId)}
                    />
                  )}
                  {currentUser.role === 'AGENT' && (
                    <AgentTasksView
                      user={currentUser}
                      tasks={tasks}
                      onTaskUpdated={loadWorkspaceData}
                    />
                  )}
                </>
              )}

              {/* Tab: Projects List */}
              {currentTab === 'projects' && (
                <div className="p-6 max-w-6xl mx-auto space-y-4">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {currentUser.role === 'ADMIN'
                      ? 'Global Projects Portfolio'
                      : currentUser.role === 'MANAGER'
                      ? 'My Managed Projects'
                      : 'Project Context'}
                  </h1>
                  <AdminDashboard
                    projects={projects}
                    tasks={tasks}
                    team={teamMembers}
                    onOpenStudio={() => setCurrentTab('studio')}
                    onSelectProject={(pId) => setSelectedProjectId(pId)}
                  />
                </div>
              )}

              {/* Tab: Tasks (Agent My Tasks or Global Tasks) */}
              {currentTab === 'tasks' && (
                <AgentTasksView
                  user={currentUser}
                  tasks={tasks}
                  onTaskUpdated={loadWorkspaceData}
                />
              )}

              {/* Tab: Team Directory */}
              {currentTab === 'team' && (
                <TeamDirectoryView members={teamMembers} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
