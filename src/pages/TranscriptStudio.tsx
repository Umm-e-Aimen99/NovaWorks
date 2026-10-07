import React, { useState } from 'react';
import { api } from '../api/client';
import { AIPlanResult, ValidationReport } from '../types';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  HelpCircle,
  Save,
  Check,
  FileText,
  RotateCcw,
  Zap,
  ShieldCheck,
  Ban
} from 'lucide-react';

interface TranscriptStudioProps {
  onPlanSaved: () => void;
}

export const TranscriptStudio: React.FC<TranscriptStudioProps> = ({ onPlanSaved }) => {
  // Official Hackathon Transcript
  const standardTranscript = `Meeting: UrbanCart E-Commerce Q4 Rollout
Participants: Ayesha Khan (Lead PM), Ali Raza (Frontend), Sana Tariq (UI/UX), Usman Farooq (Backend), Hira Malik (QA)
Date: October 7, 2026

Ayesha: Alright team, let's lock in the execution plan for the UrbanCart storefront rollout.
Client is UrbanCart Retail. The initial proposed launch was October 18, but after discussing with the stakeholders this morning, we have agreed to a revised final delivery deadline of October 20, 2026. Let's make sure all sprint tracks align with October 20.

Ali: Sounds good Ayesha. For my track, I will handle the Product Catalog UI and search filtering. It requires setting up the responsive grid and faceted category filters. I estimate that will take 6 hours, and I'll wrap it up by October 12.

Sana: I will take the Product Detail Page and cart state management. It needs image galleries, variant dropdowns, and responsive drawer state. That will be 8 hours, target completion by October 13.

Usman: For backend, I am taking the Stripe Payment Gateway and webhook integrations. We need idempotent order charging, security hashing, and transactional database storage. That will take 12 hours, finishing by October 16.

Ali: Hey, what about adding an Augmented Reality virtual fitting room or crypto checkout?
Ayesha: No, we specifically discussed that with the client. The AR fitting room and crypto payments are completely out of scope and rejected for this release. We cannot risk the deadline. Do not build any AR or crypto features.

Hira: Got it. Once Usman and frontend deliver, I will run the mobile integration and cross-browser regression testing on iOS and Android devices. My estimate is 10 hours, and I will have all testing finished by October 19.

Ayesha: Perfect. Let's review:
- Project: UrbanCart E-Commerce Platform
- Client: UrbanCart Retail
- Lead Manager: Ayesha Khan
- Project Deadline: October 20, 2026
- Catalog UI: Ali, 6 hours, Oct 12
- Detail & Cart: Sana, 8 hours, Oct 13
- Payments & Webhooks: Usman, 12 hours, Oct 16
- Mobile Testing: Hira, 10 hours, Oct 19
- AR Fitting Room: REJECTED

Let's execute!`;

  // Judge Mutation Verification Transcript (Specifically tests 12 hrs / Oct 23 on mobile integration)
  const judgeTestTranscript = `Meeting: UrbanCart E-Commerce Q4 Rollout - Scope Revision
Participants: Ayesha Khan (Lead PM), Ali Raza (Frontend), Sana Tariq (UI/UX), Usman Farooq (Backend), Hira Malik (QA)
Date: October 7, 2026

Ayesha: Team, we have an updated scope discussion for UrbanCart Retail.
The overall final project deadline is shifted to October 23, 2026.

Ali: Product Catalog UI and faceted search is still 6 hours, deadline October 12.
Sana: Product Detail Page & cart integration remains 8 hours, deadline October 13.
Usman: Stripe payment gateway and webhooks remains 12 hours, deadline October 16.

Hira: Regarding mobile integration and testing: due to extensive tablet matrix and payment edge cases, I need to revise my estimate.
Mobile integration and testing is updated to 12 hours, and my completion deadline is now October 23.

Ayesha: Approved. Mobile integration and testing is confirmed at 12 hours, deadline October 23. The AR virtual fitting room remains rejected. All other assignments remain intact.`;

  const [transcript, setTranscript] = useState(standardTranscript);
  const [activePreset, setActivePreset] = useState<'standard' | 'judge'>('standard');
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [planResult, setPlanResult] = useState<AIPlanResult | null>(null);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTaskReason, setSelectedTaskReason] = useState<{ title: string; reason: string; assignee: string } | null>(null);

  const handleProcessTranscript = async () => {
    try {
      setProcessing(true);
      setError(null);
      setSuccessMessage(null);
      setStep(2); // Analysis

      const res = await api.processTranscript(transcript);
      setPlanResult(res.plan);
      setValidation(res.validation);
      setStep(3); // Review
    } catch (err: any) {
      setError(err.message || 'AI processing encountered an error. Please try again.');
      setStep(1);
    } finally {
      setProcessing(false);
    }
  };

  const handleSavePlan = async () => {
    if (!planResult) return;
    try {
      setSaving(true);
      setError(null);
      const res = await api.savePlan(planResult);
      setStep(4); // Committed
      setSuccessMessage(`Success! ${res.stats.totalProjects} project(s) and ${res.stats.totalTasks} task(s) committed atomically.`);
      setTimeout(() => {
        onPlanSaved();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save project plan to database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">AI Transcript Studio</h1>
            <span className="text-xs font-mono bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded">
              Engineered for Infinity ’26
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Convert raw multispeaker meeting conversations into deterministic, role-verified execution plans in seconds.
          </p>
        </div>

        {/* Preset Selection Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTranscript(standardTranscript);
              setActivePreset('standard');
              setPlanResult(null);
              setStep(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              activePreset === 'standard'
                ? 'bg-zinc-800 text-white border-zinc-600'
                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200'
            }`}
          >
            Standard Meeting
          </button>
          <button
            onClick={() => {
              setTranscript(judgeTestTranscript);
              setActivePreset('judge');
              setPlanResult(null);
              setStep(1);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              activePreset === 'judge'
                ? 'bg-amber-950/80 text-amber-200 border-amber-700/80'
                : 'bg-zinc-900/60 text-amber-400/80 border-zinc-800 hover:text-amber-300'
            }`}
            title="Tests genuine AI dynamic extraction (changes Mobile testing to 12 hrs / Oct 23)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Judge Verification Test (12h / Oct 23)</span>
          </button>
        </div>
      </div>

      {/* Progress Stage Pipeline */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div
          className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 ${
            step >= 1 ? 'border-indigo-600/60 bg-indigo-950/30 text-indigo-200' : 'border-zinc-800 text-zinc-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono flex items-center justify-center font-bold">1</span>
          <span className="font-medium">Transcript Ingestion</span>
        </div>
        <div
          className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 ${
            step >= 2 ? 'border-indigo-600/60 bg-indigo-950/30 text-indigo-200' : 'border-zinc-800 text-zinc-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono flex items-center justify-center font-bold">2</span>
          <span className="font-medium">Gemini Reasoning & Filter</span>
        </div>
        <div
          className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 ${
            step >= 3 ? 'border-indigo-600/60 bg-indigo-950/30 text-indigo-200' : 'border-zinc-800 text-zinc-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono flex items-center justify-center font-bold">3</span>
          <span className="font-medium">Validation & Review</span>
        </div>
        <div
          className={`p-2.5 rounded-lg border flex items-center justify-center gap-2 ${
            step >= 4 ? 'border-emerald-600/60 bg-emerald-950/30 text-emerald-200' : 'border-zinc-800 text-zinc-500'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-mono flex items-center justify-center font-bold">4</span>
          <span className="font-medium">Atomic Commit</span>
        </div>
      </div>

      {/* Transcript Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Raw Meeting Conversation
            </span>
            <span className="text-[11px] text-zinc-500">Edit or paste custom transcript</span>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={processing || saving}
            rows={18}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/90 p-4 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed resize-none selection:bg-indigo-600 selection:text-white"
            placeholder="Paste your meeting transcript here..."
          />

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-zinc-500">
              {transcript.trim().split(/\s+/).length} words · Chronological decision resolver enabled
            </div>
            <button
              onClick={handleProcessTranscript}
              disabled={processing || !transcript.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {processing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Process With AI</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-md text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Validation / Processing Error:</span> {error}
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-md text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* AI Output & Validation Preview Workspace */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-medium text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Structured Execution Plan & Validation
            </span>
            {validation && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded font-mono font-semibold ${
                  validation.valid
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {validation.valid ? 'All 6 Checks Passed ✓' : 'Validation Failed ✗'}
              </span>
            )}
          </div>

          {!planResult && !processing && (
            <div className="h-[460px] rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-medium text-zinc-300">Ready for AI Processing</h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                Click "Process With AI" to extract projects, match verified employee IDs, filter rejected features, and check deadline hierarchy.
              </p>
            </div>
          )}

          {processing && (
            <div className="h-[460px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Processing Meeting Conversation</h4>
                <div className="mt-3 space-y-1.5 text-left text-xs text-zinc-400">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Check className="w-3.5 h-3.5 text-indigo-400" /> Ingesting multispeaker transcript
                  </div>
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Check className="w-3.5 h-3.5 text-indigo-400" /> Detecting chronological revisions (Oct 18 → Oct 20)
                  </div>
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Check className="w-3.5 h-3.5 text-indigo-400" /> Filtering out rejected proposals (AR Fitting Room)
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <div className="w-3 h-3 rounded-full border border-indigo-400 border-t-transparent animate-spin" />
                    Executing deterministic role validation
                  </div>
                </div>
              </div>
            </div>
          )}

          {planResult && !processing && (
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {/* Decision Intelligence Changelog Badge */}
              {planResult.decisions && planResult.decisions.length > 0 && (
                <div className="rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                      Detected Decisions & Revisions ({planResult.decisions.length})
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Decision Intelligence</span>
                  </div>
                  <div className="space-y-1.5">
                    {planResult.decisions.map((dec, dIdx) => (
                      <div key={dIdx} className="bg-zinc-900/90 rounded border border-zinc-800/80 p-2 text-xs">
                        <div className="flex items-center justify-between font-medium text-zinc-200">
                          <span>{dec.topic}</span>
                          <span className="font-mono text-emerald-400 text-[11px] font-semibold">{dec.finalValue}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{dec.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Card */}
              {planResult.projects.map((proj, pIdx) => (
                <div key={pIdx} className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                        {proj.clientName}
                      </span>
                      <h3 className="text-sm font-bold text-white">{proj.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400">Project Deadline</div>
                      <div className="text-xs font-mono font-semibold text-amber-300 flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {proj.deadline}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">{proj.description}</p>

                  {/* Tasks List */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold">
                      <span>Confirmed Tasks ({proj.tasks.length})</span>
                      <span className="text-zinc-500 text-[11px]">
                        Total Est: {proj.tasks.reduce((sum, t) => sum + t.estimatedHours, 0)} hrs
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {proj.tasks.map((task, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-zinc-950/80 rounded border border-zinc-800/80 p-2.5 text-xs space-y-1.5 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-200">{task.title}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-indigo-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-indigo-400" />
                                {task.estimatedHours}h
                              </span>
                              <span className="font-mono text-zinc-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-zinc-500" />
                                {task.deadline}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <User className="w-3 h-3 text-emerald-400" />
                              <span>Assignee:</span>
                              <span className="text-zinc-200 font-mono font-semibold">{task.assigneeId}</span>
                            </div>

                            {task.assignmentReason && (
                              <button
                                onClick={() =>
                                  setSelectedTaskReason({
                                    title: task.title,
                                    reason: task.assignmentReason!,
                                    assignee: task.assigneeId
                                  })
                                }
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium hover:underline"
                              >
                                <HelpCircle className="w-3 h-3" />
                                <span>Why this person?</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Action Bar: Commit & Save */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    setPlanResult(null);
                    setStep(1);
                  }}
                  className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 rounded-md border border-zinc-800 hover:bg-zinc-900 transition-colors"
                >
                  Clear Preview
                </button>

                <button
                  onClick={handleSavePlan}
                  disabled={saving || (validation ? !validation.valid : false)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Committing Transaction...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Commit & Save Execution Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explainable AI Modal */}
      {selectedTaskReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                  Explainable AI (XAI)
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedTaskReason.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTaskReason(null)}
                className="text-zinc-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-zinc-950/80 rounded border border-zinc-800 text-xs space-y-1.5">
              <div className="text-[11px] text-zinc-400">
                Matched Employee ID: <span className="font-mono text-zinc-200 font-semibold">{selectedTaskReason.assignee}</span>
              </div>
              <div className="text-xs text-zinc-300 leading-relaxed font-sans">
                "{selectedTaskReason.reason}"
              </div>
            </div>

            <p className="text-[11px] text-zinc-500">
              The AI verifies technical skills and explicit statements in the transcript against the verified team directory.
            </p>

            <button
              onClick={() => setSelectedTaskReason(null)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
