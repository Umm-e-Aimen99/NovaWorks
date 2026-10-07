import { User, Project, Task, AIPlanResult, ValidationReport } from '../types';

const TOKEN_KEY = 'infinity_pm_token';
const USER_KEY = 'infinity_pm_user';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setAuth: (token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const data = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authStorage.setAuth(data.token, data.user);
    return data;
  },
  getMe: async (): Promise<{ user: User }> => {
    return apiFetch<{ user: User }>('/api/auth/me');
  },
  logout: async (): Promise<void> => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      authStorage.clearAuth();
    }
  },

  // Team
  getTeam: async (): Promise<{ members: User[] }> => {
    return apiFetch<{ members: User[] }>('/api/team');
  },

  // Projects
  getProjects: async (): Promise<{ projects: Project[] }> => {
    return apiFetch<{ projects: Project[] }>('/api/projects');
  },
  getProject: async (id: string): Promise<{ project: Project }> => {
    return apiFetch<{ project: Project }>(`/api/projects/${id}`);
  },

  // Tasks
  getTasks: async (): Promise<{ tasks: Task[] }> => {
    return apiFetch<{ tasks: Task[] }>('/api/tasks');
  },
  updateTaskStatus: async (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // AI Transcript Processing
  processTranscript: async (transcript: string): Promise<{
    plan: AIPlanResult;
    validation: ValidationReport;
    timestamp: string;
  }> => {
    return apiFetch('/api/ai/process-transcript', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
  },

  // Save Plan
  savePlan: async (plan: AIPlanResult): Promise<{
    success: boolean;
    message: string;
    savedProjectIds: string[];
    stats: any;
  }> => {
    return apiFetch('/api/projects/save-plan', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  // Reset Demo
  resetDemo: async (): Promise<{ success: boolean; message: string }> => {
    return apiFetch('/api/reset-demo', {
      method: 'POST',
    });
  }
};
