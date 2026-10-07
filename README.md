# PulsePM — AI Project Manager: From Meeting to Execution

> **The Infinity Hack ’26 Submission**  
> Challenge: *AI Project Manager — Meeting to Execution*  
> Tagline: *Transform unstructured meeting conversations into verified, role-scoped execution plans in seconds.*

---

## ⚡ Executive Summary

Engineering teams waste hours transcribing meeting recordings into Jira/Linear, often making manual errors, confusing initial proposals with final decisions, assigning tasks to the wrong people, or missing critical scope exclusions.

**PulsePM** solves this through a deterministic two-stage pipeline:
1. **Google Gemini Natural Language Understanding**: Extracts projects, client details, managers, tasks, deadlines, and detected decision revisions.
2. **Deterministic Anti-Hallucination & Validation Engine**: Verifies that every assignee exists in the corporate roster, validates role constraints (`MANAGER` leads projects; `AGENT` receives tasks), guarantees deadline hierarchy (`task.deadline <= project.deadline`), and asserts positive estimated hours.
3. **Atomic Transactional Persistence**: Commits plans into an ACID relational database (`DatabaseSync` SQLite) so no partial or corrupted records are ever saved.
4. **Strict Role-Based Access Control (RBAC)**: Enforces data scoping on the backend. Managers only see their assigned projects; execution agents only see their personal assigned tasks.

---

## 👥 Pre-Seeded Demo Accounts & Roles

*Password for all accounts:* `infinity2026`

| Name | Role | Email | Scope & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Executive Admin** | `ADMIN` | `admin@infinityhack.io` | Global portfolio oversight, Meeting Ingestion, Team Management |
| **Ayesha Khan** | `MANAGER` | `ayesha@infinityhack.io` | Lead PM for UrbanCart E-Commerce Platform |
| **Bilal Ahmed** | `MANAGER` | `bilal@infinityhack.io` | Technical Project Manager (Systems Infra) |
| **Ali Raza** | `AGENT` | `ali@infinityhack.io` | Frontend Specialist (React, Product Catalog UI) |
| **Sana Tariq** | `AGENT` | `sana@infinityhack.io` | UI/UX & Frontend Engineer (Cart & Detail Page) |
| **Usman Farooq** | `AGENT` | `usman@infinityhack.io` | Backend Engineer (Stripe Gateway, Webhooks, APIs) |
| **Hira Malik** | `AGENT` | `hira@infinityhack.io` | QA & Mobile Specialist (Cross-browser regression) |
| **Zain Siddiqui** | `AGENT` | `zain@infinityhack.io` | DevOps & Cloud Architect (CI/CD, Docker) |

---

## 🚀 Live Demo Script for Judges (3-4 Minutes)

1. **Sign in as Admin** (`admin@infinityhack.io` or click the 1-Click quick button).
2. Click **Process New Meeting Transcript** or navigate to **Transcript Studio**.
3. **Run Standard Hackathon Meeting**:
   - Notice how the initial deadline (Oct 18) is automatically resolved to the final agreed deadline (**Oct 20**).
   - Notice how the proposed AR Virtual Fitting Room and Crypto checkout are identified and **cleanly discarded** (zero tasks generated).
   - Review the **Validation Report**: 6 deterministic checks passed with green badges.
   - Click **Why this person?** on any task to see Explainable AI citations.
4. Click **Commit & Save Execution Plan**:
   - The plan is atomically persisted to the relational database.
5. **Demonstrate Strict RBAC**:
   - Open the **Role Switcher** in the top bar.
   - Switch to **Ayesha Khan (Manager)**: Notice she sees *only* UrbanCart Platform and its assigned tasks.
   - Switch to **Ali Raza (Agent)**: Notice he sees *only* his assigned *Product Catalog UI* task with interactive status controls (`Pending` $\rightarrow$ `In Progress` $\rightarrow$ `Completed`).
6. **The Non-Hardcoded Verification Test**:
   - Switch back to Admin, click **Transcript Studio**.
   - Click the preset button: **Judge Verification Test (12h / Oct 23)**.
   - Process the transcript: notice that Mobile Testing dynamically updates from 10h to **12 hours**, with the deadline moving to **October 23**, while all other tasks remain unchanged.

---

## 🏛️ System Architecture

```
[Browser: Vite + React 19 + Tailwind CSS]
                   │
                   ▼  HTTP REST (/api/*) + Bearer Token
[Express Backend Server (server.ts)]
   ├── [Auth & RBAC Middleware (auth.ts)]
   │     └── Admin, Manager, Agent token verification
   │
   ├── [AI Service Layer (aiService.ts)]
   │     ├── Injects verified Team Directory into prompt
   │     └── Calls Google Gemini (gemini-3.8-flash) via @google/genai
   │
   ├── [Deterministic Validation Layer (validator.ts)]
   │     ├── Anti-hallucination user checks
   │     ├── Manager/Agent role compatibility
   │     └── Deadline hierarchy: task.deadline <= project.deadline
   │
   └── [ACID Relational Storage (db.ts)]
         └── SQLite DatabaseSync with Foreign Keys & Transactions
```

---

## 💡 Viva Questions & Technical Explanations

1. **Why did you put the Gemini API call on the backend instead of calling it directly in React?**
   - *Answer:* Calling the AI provider on the backend protects the API key from browser exposure, prevents client tampering, and ensures that the server can inject the authoritative team directory and enforce deterministic validation before the client can touch the database.

2. **How does your system prevent employee hallucinations?**
   - *Answer:* A two-tier defense: First, the system prompt is injected with the exact list of available employee IDs, roles, and specializations. Second, the server runs a deterministic validation check after extraction that queries the database; if any ID is not present in the `users` table or has the wrong role (e.g. an agent assigned as project manager), the entire transaction is rejected.

3. **How do you handle conflicting statements or deadline revisions?**
   - *Answer:* The AI is instructed via chronological decision resolution to prioritize the latest confirmed agreement in the dialogue. Furthermore, our Decision Intelligence engine logs both the previous value and final value for transparency.

4. **Why is the database commit atomic?**
   - *Answer:* We wrap project creation and task inserts in a `BEGIN TRANSACTION` / `COMMIT` block. If any task insertion fails, the database automatically rolls back (`ROLLBACK`), preventing half-created, orphaned project records.
