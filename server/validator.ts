import { db } from './db.js';

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

export function validateProjectPlan(plan: AIPlanResult): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const assignedMemberSet = new Set<string>();
  let totalHours = 0;
  let totalTasks = 0;

  if (!plan || !Array.isArray(plan.projects) || plan.projects.length === 0) {
    return {
      valid: false,
      errors: ['No projects were identified in the plan.'],
      warnings: [],
      stats: { totalProjects: 0, totalTasks: 0, totalHours: 0, assignedMembers: 0 },
    };
  }

  // Pre-load all users from DB
  const usersStmt = db.prepare('SELECT id, name, role FROM users');
  const allUsers = usersStmt.all() as { id: string; name: string; role: string }[];
  const userMap = new Map<string, { name: string; role: string }>();
  for (const u of allUsers) {
    userMap.set(u.id, { name: u.name, role: u.role });
  }

  for (let pIdx = 0; pIdx < plan.projects.length; pIdx++) {
    const project = plan.projects[pIdx];
    const pLabel = project.name || `Project #${pIdx + 1}`;

    if (!project.name || project.name.trim().length === 0) {
      errors.push(`Project #${pIdx + 1} is missing a valid project name.`);
    }

    if (!project.clientName || project.clientName.trim().length === 0) {
      warnings.push(`Project "${pLabel}" does not specify a distinct client name.`);
    }

    // Validate Manager
    if (!project.managerId) {
      errors.push(`Project "${pLabel}" does not have a designated manager.`);
    } else {
      const manager = userMap.get(project.managerId);
      if (!manager) {
        errors.push(`Project "${pLabel}" manager ID "${project.managerId}" was not found in team directory.`);
      } else if (manager.role !== 'MANAGER' && manager.role !== 'ADMIN') {
        errors.push(`Project "${pLabel}" manager "${manager.name}" has role "${manager.role}", which cannot manage projects (must be MANAGER).`);
      } else {
        assignedMemberSet.add(project.managerId);
      }
    }

    // Validate Project Deadline
    const projectDeadline = new Date(project.deadline);
    if (isNaN(projectDeadline.getTime())) {
      errors.push(`Project "${pLabel}" has an invalid deadline format ("${project.deadline}").`);
    }

    // Validate Tasks
    if (!Array.isArray(project.tasks) || project.tasks.length === 0) {
      errors.push(`Project "${pLabel}" has no tasks assigned.`);
      continue;
    }

    for (let tIdx = 0; tIdx < project.tasks.length; tIdx++) {
      const task = project.tasks[tIdx];
      const tLabel = task.title || `Task #${tIdx + 1}`;
      totalTasks++;

      if (!task.title || task.title.trim().length === 0) {
        errors.push(`Task #${tIdx + 1} in "${pLabel}" is missing a title.`);
      }

      // Check for rejected features accidentally included
      const lowerTitle = (task.title + ' ' + (task.description || '')).toLowerCase();
      if (lowerTitle.includes('virtual fitting') || lowerTitle.includes('crypto checkout') || lowerTitle.includes('augmented reality')) {
        errors.push(`Task "${tLabel}" appears to be a rejected feature (AR / Crypto checkout) that was dismissed in the meeting.`);
      }

      // Validate Assignee
      if (!task.assigneeId) {
        errors.push(`Task "${tLabel}" in "${pLabel}" has no assigned agent.`);
      } else {
        const assignee = userMap.get(task.assigneeId);
        if (!assignee) {
          errors.push(`Task "${tLabel}" was assigned to ID "${task.assigneeId}", but this person does not exist in the team directory.`);
        } else if (assignee.role !== 'AGENT') {
          errors.push(`Task "${tLabel}" was assigned to "${assignee.name}" (${assignee.role}), but tasks must only be assigned to AGENTs.`);
        } else {
          assignedMemberSet.add(task.assigneeId);
        }
      }

      // Validate Task Deadline <= Project Deadline
      const taskDeadline = new Date(task.deadline);
      if (isNaN(taskDeadline.getTime())) {
        errors.push(`Task "${tLabel}" has an invalid deadline date ("${task.deadline}").`);
      } else if (!isNaN(projectDeadline.getTime()) && taskDeadline.getTime() > projectDeadline.getTime()) {
        errors.push(`Task "${tLabel}" deadline (${task.deadline}) exceeds project deadline (${project.deadline}).`);
      }

      // Validate Estimated Hours
      if (typeof task.estimatedHours !== 'number' || task.estimatedHours <= 0) {
        errors.push(`Task "${tLabel}" has invalid estimated hours (${task.estimatedHours}). Must be a positive number.`);
      } else {
        totalHours += task.estimatedHours;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalProjects: plan.projects.length,
      totalTasks,
      totalHours,
      assignedMembers: assignedMemberSet.size,
    },
  };
}
