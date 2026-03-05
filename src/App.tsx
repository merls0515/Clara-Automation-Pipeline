import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  FileText, 
  History, 
  Settings, 
  ChevronRight, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  LayoutDashboard,
  Box,
  Terminal,
  Github
} from "lucide-react";
import Markdown from "react-markdown";

interface Account {
  id: string;
  versions: string[];
}

interface VersionData {
  memo: any;
  spec: any;
  changelog?: string;
}

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [log, setLog] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionData = async (id: string, version: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts/${id}/${version}`);
      const data = await res.json();
      setVersionData(data);
      setSelectedAccount(id);
      setSelectedVersion(version);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async () => {
    setProcessing(true);
    setLog(null);
    try {
      const res = await fetch("/api/run-pipeline", { method: "POST" });
      const data = await res.json();
      setLog(data.log || data.message);
      fetchAccounts();
    } catch (err: any) {
      setLog(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Clara <span className="text-emerald-500">Factory</span></h1>
            <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              Automation Pipeline
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={runPipeline}
              disabled={processing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                processing 
                  ? "bg-white/5 text-zinc-500 cursor-not-allowed" 
                  : "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20"
              }`}
            >
              {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              {processing ? "Processing..." : "Run Pipeline"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        {/* Sidebar: Accounts */}
        <div className="col-span-3 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Database className="w-3 h-3" />
                Accounts
              </h2>
              <button onClick={fetchAccounts} className="text-zinc-500 hover:text-emerald-500 transition-colors">
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-2">
              {accounts.length === 0 ? (
                <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-center">
                  <p className="text-xs text-zinc-500">No accounts found. Run the pipeline to generate outputs.</p>
                </div>
              ) : (
                accounts.map((acc, accIdx) => (
                  <div key={`${acc.id}-${accIdx}`} className="space-y-1">
                    <div className="px-3 py-2 text-sm font-medium text-zinc-400 flex items-center gap-2">
                      <Box className="w-4 h-4 text-emerald-500/50" />
                      {acc.id}
                    </div>
                    <div className="pl-6 space-y-1">
                      {acc.versions.map((v, vIdx) => (
                        <button
                          key={`${acc.id}-${v}-${vIdx}`}
                          onClick={() => fetchVersionData(acc.id, v)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between group ${
                            selectedAccount === acc.id && selectedVersion === v
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <History className="w-3 h-3 opacity-50" />
                            {v}
                          </span>
                          <ChevronRight className={`w-3 h-3 transition-transform group-hover:translate-x-0.5 ${
                            selectedAccount === acc.id && selectedVersion === v ? "opacity-100" : "opacity-0"
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content: Details */}
        <div className="col-span-9 space-y-8">
          <AnimatePresence mode="wait">
            {log && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 font-mono text-xs text-emerald-400/80 overflow-auto max-h-48"
              >
                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold uppercase tracking-widest">
                  <Terminal className="w-3 h-3" />
                  Pipeline Log
                </div>
                <pre className="whitespace-pre-wrap">{log}</pre>
              </motion.div>
            )}

            {versionData ? (
              <motion.div
                key={`${selectedAccount}-${selectedVersion}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Header Info */}
                <div className="flex items-end justify-between border-b border-white/5 pb-6">
                  <div>
                    <div className="text-xs font-mono text-emerald-500 mb-1 uppercase tracking-widest">
                      {selectedVersion} Configuration
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                      {versionData.memo.company_name}
                    </h2>
                    <p className="text-zinc-500 mt-1 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Account ID: {selectedAccount}
                    </p>
                  </div>
                  {versionData.changelog && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                      <RefreshCw className="w-3 h-3" />
                      Onboarding Update
                    </div>
                  )}
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 gap-8">
                  {/* Account Memo */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Account Memo (JSON Artifact)
                    </h3>
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <Stat label="Business Hours" value={versionData.memo.business_hours} />
                        <Stat label="Office Address" value={versionData.memo.office_address} />
                      </div>
                      <Stat label="Services Supported" value={versionData.memo.services_supported} />
                      <Stat label="Emergency Definition" value={versionData.memo.emergency_definition} />
                      <Stat label="Emergency Routing" value={versionData.memo.emergency_routing_rules} />
                      <div className="pt-4 border-t border-white/5">
                        <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Questions or Unknowns</h4>
                        <p className="text-sm text-amber-400/80 italic">{versionData.memo.questions_or_unknowns || "None"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Retell Spec */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Retell Agent Spec
                    </h3>
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] space-y-6">
                      <Stat label="Agent Name" value={versionData.spec.agent_name} />
                      <Stat label="Voice" value={versionData.spec.voice || "Default"} />
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">System Prompt</h4>
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-zinc-400 leading-relaxed max-h-64 overflow-auto">
                          {versionData.spec.system_prompt}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Changelog */}
                {versionData.changelog && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Changelog (v1 → v2)
                    </h3>
                    <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] prose prose-invert prose-emerald max-w-none prose-sm">
                      <Markdown>{versionData.changelog}</Markdown>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                  <LayoutDashboard className="w-8 h-8 text-zinc-700" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-white">No Account Selected</h2>
                  <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                    Select an account and version from the sidebar to view the extracted configurations and changelogs.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: any }) {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</h4>
      <p className="text-sm text-zinc-200 font-medium">{value || "—"}</p>
    </div>
  );
}
