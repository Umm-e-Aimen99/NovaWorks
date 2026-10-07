export type Role = 'ADMIN' | 'MANAGER' | 'AGENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialization: string;
  skills: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  assignee_id: string;
  assignee_name?: string;
  assignee_email?: string;
  deadline: string;
  estimated_hours: number;
  assignment_reason?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  project_name?: string;
  manager_name?: string;
}

export interface Decision {
  id: string;
  project_id?: string;
  topic: string;
  previous_value?: string;
  final_value: string;
  reason: string;
}

export interface Project {
  id: string;
  name: string;
  client_name: string;
  description: string;
  manager_id: string;
  manager_name?: string;
  manager_email?: string;
  deadline: string;
  task_count?: number;
  total_hours?: number;
  my_task_count?: number;
  my_hours?: number;
  tasks?: Task[];
  decisions?: Decision[];
}

export interface ExtractedTask {
  title: string;
  description: string;
  assigneeId: string;
  deadline: string;
  estimatedHours: number;
  assignmentReason?: string;
}

export interface ExtractedProject {
  name: string;
  clientName: string;
  description: string;
  managerId: string;
  deadline: string;
  tasks: ExtractedTask[];
}

export interface ExtractedDecision {
  topic: string;
  previousValue: string;
  finalValue: string;
  reason: string;
}

export interface AIPlanResult {
  projects: ExtractedProject[];
  decisions: ExtractedDecision[];
}

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalProjects: number;
    totalTasks: number;
    totalHours: number;
    assignedMembers: number;
  };
}
