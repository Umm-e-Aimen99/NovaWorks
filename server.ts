import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initDatabase, generateId, resetToSeed } from './server/db.js';
import { loginUser, getUserByToken, logoutUser, authenticate, requireAdmin } from './server/auth.js';
import { processTranscriptWithAI } from './server/aiService.js';
import { validateProjectPlan, AIPlanResult } from './server/validator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB schema & demo seed
initDatabase();

const app = express();
app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------
// PUBLIC & AUTH ROUTES
// -------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = loginUser(email, password);
  if (!result) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.json(result);
});

app.get('/api/auth/me', authenticate, (req, res) => {
  return res.json({ user: req.user });
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  if (req.token) {
    logoutUser(req.token);
  }
  return res.json({ success: true });
});

// -------------------------------------------------------------
// TEAM DIRECTORY (Read-only for all authenticated roles)
// -------------------------------------------------------------

app.get('/api/team', authenticate, (req, res) => {
  const stmt = db.prepare(`
    SELECT id, name, email, role, specialization, skills, created_at
    FROM users
    ORDER BY role ASC, name ASC
  `);
  const members = stmt.all();
  return res.json({ members });
});

// -------------------------------------------------------------
// PROJECTS (Strict RBAC Enforced)
// -------------------------------------------------------------

app.get('/api/projects', authenticate, (req, res) => {
  const user = req.user!;
  let projects: any[] = [];

  if (user.role === 'ADMIN') {
    // Admin sees all projects
    const stmt = db.prepare(`
      SELECT p.*, u.name as manager_name, u.email as manager_email,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
        (SELECT COALESCE(SUM(t.estimated_hours), 0) FROM tasks t WHERE t.project_id = p.id) as total_hours
      FROM projects p
      JOIN users u ON p.manager_id = u.id
      ORDER BY p.created_at DESC
    `);
    projects = stmt.all();
  } else if (user.role === 'MANAGER') {
    // Manager sees only projects they manage
    const stmt = db.prepare(`
      SELECT p.*, u.name as manager_name, u.email as manager_email,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
        (SELECT COALESCE(SUM(t.estimated_hours), 0) FROM tasks t WHERE t.project_id = p.id) as total_hours
      FROM projects p
      JOIN users u ON p.manager_id = u.id
      WHERE p.manager_id = ?
      ORDER BY p.created_at DESC
    `);
    projects = stmt.all(user.id);
  } else {
    // Agent sees only projects where they have assigned tasks
    const stmt = db.prepare(`
      SELECT DISTINCT p.*, u.name as manager_name, u.email as manager_email,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.assignee_id = ?) as my_task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count,
        (SELECT COALESCE(SUM(t.estimated_hours), 0) FROM tasks t WHERE t.project_id = p.id AND t.assignee_id = ?) as my_hours
      FROM projects p
      JOIN users u ON p.manager_id = u.id
      JOIN tasks t ON t.project_id = p.id
      WHERE t.assignee_id = ?
      ORDER BY p.created_at DESC
    `);
    projects = stmt.all(user.id, user.id, user.id);
  }

  return res.json({ projects });
});

app.get('/api/projects/:id', authenticate, (req, res) => {
  const user = req.user!;
  const projectId = req.params.id;

  const stmt = db.prepare(`
    SELECT p.*, u.name as manager_name, u.email as manager_email
    FROM projects p
    JOIN users u ON p.manager_id = u.id
    WHERE p.id = ?
  `);
  const project = stmt.get(projectId) as any;

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Authorization check
  if (user.role === 'MANAGER' && project.manager_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden: You do not manage this project' });
  }

  if (user.role === 'AGENT') {
    const taskCheck = db.prepare('SELECT id FROM tasks WHERE project_id = ? AND assignee_id = ?').get(projectId, user.id);
    if (!taskCheck) {
      return res.status(403).json({ error: 'Forbidden: You do not have tasks in this project' });
    }
  }

  // Fetch tasks
  let tasksStmt;
  if (user.role === 'AGENT') {
    tasksStmt = db.prepare(`
      SELECT t.*, u.name as assignee_name, u.email as assignee_email
      FROM tasks t
      JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id = ? AND t.assignee_id = ?
      ORDER BY t.deadline ASC
    `);
    project.tasks = tasksStmt.all(projectId, user.id);
  } else {
    tasksStmt = db.prepare(`
      SELECT t.*, u.name as assignee_name, u.email as assignee_email
      FROM tasks t
      JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id = ?
      ORDER BY t.deadline ASC
    `);
    project.tasks = tasksStmt.all(projectId);
  }

  // Fetch decisions
  const decisionsStmt = db.prepare('SELECT * FROM decisions WHERE project_id = ? ORDER BY created_at ASC');
  project.decisions = decisionsStmt.all(projectId);

  return res.json({ project });
});

// -------------------------------------------------------------
// TASKS (Strict RBAC Enforced)
// -------------------------------------------------------------

app.get('/api/tasks', authenticate, (req, res) => {
  const user = req.user!;
  let tasks: any[] = [];

  if (user.role === 'ADMIN') {
    const stmt = db.prepare(`
      SELECT t.*, p.name as project_name, p.deadline as project_deadline,
             u.name as assignee_name, m.name as manager_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON t.assignee_id = u.id
      JOIN users m ON p.manager_id = m.id
      ORDER BY t.deadline ASC
    `);
    tasks = stmt.all();
  } else if (user.role === 'MANAGER') {
    const stmt = db.prepare(`
      SELECT t.*, p.name as project_name, p.deadline as project_deadline,
             u.name as assignee_name, m.name as manager_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON t.assignee_id = u.id
      JOIN users m ON p.manager_id = m.id
      WHERE p.manager_id = ?
      ORDER BY t.deadline ASC
    `);
    tasks = stmt.all(user.id);
  } else {
    // AGENT sees ONLY their assigned tasks!
    const stmt = db.prepare(`
      SELECT t.*, p.name as project_name, p.deadline as project_deadline,
             u.name as assignee_name, m.name as manager_name
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON t.assignee_id = u.id
      JOIN users m ON p.manager_id = m.id
      WHERE t.assignee_id = ?
      ORDER BY t.deadline ASC
    `);
    tasks = stmt.all(user.id);
  }

  return res.json({ tasks });
});

app.patch('/api/tasks/:id/status', authenticate, (req, res) => {
  const user = req.user!;
  const taskId = req.params.id;
  const { status } = req.body;

  if (!['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid task status' });
  }

  // Check task ownership
  const task = db.prepare('SELECT t.*, p.manager_id FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = ?').get(taskId) as any;
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (user.role === 'AGENT' && task.assignee_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify this task' });
  }

  if (user.role === 'MANAGER' && task.manager_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden: You do not manage the project for this task' });
  }

  const updateStmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
  updateStmt.run(status, taskId);

  return res.json({ success: true, taskId, status });
});

// -------------------------------------------------------------
// AI TRANSCRIPT PROCESSING & DETERMINISTIC VALIDATION
// -------------------------------------------------------------

app.post('/api/ai/process-transcript', authenticate, requireAdmin, async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Meeting transcript is required.' });
    }

    // Step 1: AI Processing
    const rawPlan = await processTranscriptWithAI(transcript);

    // Step 2: Deterministic Validation
    const validation = validateProjectPlan(rawPlan);

    return res.json({
      plan: rawPlan,
      validation,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error processing transcript:', error);
    return res.status(500).json({ error: error.message || 'Internal server error while processing transcript' });
  }
});

// -------------------------------------------------------------
// SAVE PROJECT PLAN (ATOMIC TRANSACTION)
// -------------------------------------------------------------

app.post('/api/projects/save-plan', authenticate, requireAdmin, (req, res) => {
  const { plan } = req.body as { plan: AIPlanResult };

  if (!plan) {
    return res.status(400).json({ error: 'No plan provided to save' });
  }

  // Re-run validation server-side to guarantee integrity before any DB write
  const validation = validateProjectPlan(plan);
  if (!validation.valid) {
    return res.status(422).json({
      error: 'Plan failed server validation checks. Transaction aborted.',
      details: validation.errors
    });
  }

  try {
    // Atomic transaction
    db.exec('BEGIN TRANSACTION;');

    const projectInsert = db.prepare(`
      INSERT INTO projects (id, name, client_name, description, manager_id, deadline)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const taskInsert = db.prepare(`
      INSERT INTO tasks (id, project_id, title, description, assignee_id, deadline, estimated_hours, assignment_reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `);

    const decisionInsert = db.prepare(`
      INSERT INTO decisions (id, project_id, topic, previous_value, final_value, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const savedProjectIds: string[] = [];

    for (const proj of plan.projects) {
      const projectId = generateId('PRJ');
      projectInsert.run(
        projectId,
        proj.name,
        proj.clientName || 'Standard Client',
        proj.description || '',
        proj.managerId,
        proj.deadline
      );
      savedProjectIds.push(projectId);

      for (const t of proj.tasks) {
        const taskId = generateId('TSK');
        taskInsert.run(
          taskId,
          projectId,
          t.title,
          t.description,
          t.assigneeId,
          t.deadline,
          t.estimatedHours,
          t.assignmentReason || null
        );
      }

      // Associate decisions
      if (Array.isArray(plan.decisions)) {
        for (const d of plan.decisions) {
          const decisionId = generateId('DEC');
          decisionInsert.run(
            decisionId,
            projectId,
            d.topic,
            d.previousValue || null,
            d.finalValue,
            d.reason
          );
        }
      }
    }

    db.exec('COMMIT;');

    return res.json({
      success: true,
      message: 'Project plan persisted atomically.',
      savedProjectIds,
      stats: validation.stats
    });
  } catch (err: any) {
    db.exec('ROLLBACK;');
    console.error('Failed to commit project plan transaction:', err);
    return res.status(500).json({ error: 'Failed to save project plan. Transaction safely rolled back.' });
  }
});

// Demo data reset endpoint
app.post('/api/reset-demo', authenticate, requireAdmin, (req, res) => {
  resetToSeed();
  return res.json({ success: true, message: 'Database reset to clean demo seed.' });
});

// -------------------------------------------------------------
// VITE DEV / STATIC PRODUCTION SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PulsePM Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to initialize server:', err);
});
