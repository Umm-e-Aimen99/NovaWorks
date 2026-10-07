import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'infinity_pm.db');
export const db = new DatabaseSync(DB_PATH);

// Helper for hashing password with salt
export function hashPassword(password: string): string {
  const salt = 'infinity_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
}

// Initialize tables with proper foreign keys and constraints
export function initDatabase() {
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'MANAGER', 'AGENT')),
      specialization TEXT NOT NULL,
      skills TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      client_name TEXT NOT NULL,
      description TEXT NOT NULL,
      manager_id TEXT NOT NULL,
      deadline TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      assignee_id TEXT NOT NULL,
      deadline TEXT NOT NULL,
      estimated_hours REAL NOT NULL CHECK(estimated_hours > 0),
      assignment_reason TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      topic TEXT NOT NULL,
      previous_value TEXT,
      final_value TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seedDemoUsers();
}

// Idempotent seeding for demo accounts
export function seedDemoUsers() {
  const demoUsers = [
    {
      id: 'USR_ADMIN_01',
      name: 'Executive Admin',
      email: 'admin@infinityhack.io',
      role: 'ADMIN',
      specialization: 'Operations & Strategy',
      skills: 'Project Governance, Resource Allocation, Meeting Ingestion'
    },
    {
      id: 'USR_MGR_01',
      name: 'Ayesha Khan',
      email: 'ayesha@infinityhack.io',
      role: 'MANAGER',
      specialization: 'Lead Project Manager',
      skills: 'Agile Delivery, E-commerce, Scope Verification, Client Management'
    },
    {
      id: 'USR_MGR_02',
      name: 'Bilal Ahmed',
      email: 'bilal@infinityhack.io',
      role: 'MANAGER',
      specialization: 'Technical Project Manager',
      skills: 'Systems Architecture, Cloud Infra, Sprint Planning'
    },
    {
      id: 'USR_DEV_01',
      name: 'Ali Raza',
      email: 'ali@infinityhack.io',
      role: 'AGENT',
      specialization: 'Frontend Specialist',
      skills: 'React, Tailwind CSS, Component Architecture, UI/UX Implementation'
    },
    {
      id: 'USR_DEV_02',
      name: 'Sana Tariq',
      email: 'sana@infinityhack.io',
      role: 'AGENT',
      specialization: 'UI/UX & Frontend Engineer',
      skills: 'React, Design Systems, State Management, Responsive Design'
    },
    {
      id: 'USR_DEV_03',
      name: 'Usman Farooq',
      email: 'usman@infinityhack.io',
      role: 'AGENT',
      specialization: 'Backend & API Engineer',
      skills: 'Node.js, Express, PostgreSQL, Payment Gateways, Webhooks'
    },
    {
      id: 'USR_DEV_04',
      name: 'Hira Malik',
      email: 'hira@infinityhack.io',
      role: 'AGENT',
      specialization: 'QA & Mobile Integration',
      skills: 'Mobile Responsive Testing, End-to-End Testing, Regression, Cypress'
    },
    {
      id: 'USR_DEV_05',
      name: 'Zain Siddiqui',
      email: 'zain@infinityhack.io',
      role: 'AGENT',
      specialization: 'DevOps & Cloud Engineer',
      skills: 'Docker, CI/CD Pipelines, Cloud Infrastructure, Monitoring'
    }
  ];

  const defaultPassword = 'infinity2026';
  const hashedPassword = hashPassword(defaultPassword);

  const checkStmt = db.prepare('SELECT id FROM users WHERE id = ?');
  const insertStmt = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, specialization, skills)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const user of demoUsers) {
    const existing = checkStmt.get(user.id);
    if (!existing) {
      insertStmt.run(
        user.id,
        user.name,
        user.email,
        hashedPassword,
        user.role,
        user.specialization,
        user.skills
      );
    }
  }
}

// Reset data helper
export function resetToSeed() {
  db.exec(`
    DELETE FROM tasks;
    DELETE FROM decisions;
    DELETE FROM projects;
  `);
}
