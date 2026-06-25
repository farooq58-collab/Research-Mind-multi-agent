import React, { useState } from 'react';
import { useResearchStore } from '../../store/useResearchStore';
import { 
  Search, BookOpen, PenTool, CheckCircle, Flame, 
  Settings, FolderKanban, History, Terminal, Bot,
  MessageSquare, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const {
    isSidebarOpen,
    setSidebarOpen,
    projects,
    activeProjectId,
    setActiveProjectId,
    history,
    activeSessionId,
    loadSessionMessages,
    createNewSession,
    agents,
    isStreaming
  } = useResearchStore();

  const [showSettings, setShowSettings] = useState(false);

  // Group history by date
  const groupedHistory = history.reduce((acc, chat) => {
    const key = chat.date || 'Older';
    if (!acc[key]) acc[key] = [];
    acc[key].push(chat);
    return acc;
  }, {});

  const agentKeys = Object.keys(agents);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <Flame className="w-4.5 h-4.5 text-primary-light animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4.5 h-4.5 text-secondary-light" />;
      case 'error':
        return <span className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-zinc-600" />;
    }
  };

  return (
    <>
      {/* Sidebar toggle button when closed */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 rounded-xl glassmorphism text-muted-foreground hover:text-foreground transition-all hover:scale-105 duration-200"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      )}

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-screen bg-background border-r border-surface-border flex flex-col z-40 relative flex-shrink-0"
          >
            {/* Header */}
            <div className="p-5 flex items-center justify-between border-b border-surface-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary-light flex items-center justify-center font-bold text-white shadow-lg shadow-primary/25">
                  Ω
                </div>
                <span className="font-semibold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                  RESEARCH MIND
                </span>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-colors"
              >
                <PanelLeftClose className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-7">
              {/* Active Project Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  <span className="flex items-center gap-1.5"><FolderKanban className="w-3.5 h-3.5" /> Projects</span>
                </div>
                <div className="space-y-1">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => setActiveProjectId(proj.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                        activeProjectId === proj.id
                          ? 'bg-surface border border-surface-border text-foreground font-medium shadow-inner'
                          : 'text-muted-foreground hover:text-foreground hover:bg-surface/30'
                      }`}
                    >
                      <span className="truncate">{proj.name}</span>
                      <span className="text-[10px] bg-surface-border px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                        {proj.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Sessions History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> History</span>
                  <button 
                    onClick={() => createNewSession()}
                    className="text-[10px] text-primary hover:text-primary-light hover:underline font-mono"
                  >
                    + New
                  </button>
                </div>

                <div className="space-y-4">
                  {Object.entries(groupedHistory).map(([dateGroup, items]) => (
                    <div key={dateGroup} className="space-y-1">
                      <div className="px-2 text-[10px] font-bold text-zinc-600 tracking-wider uppercase">
                        {dateGroup}
                      </div>
                      {items.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => loadSessionMessages(chat.id, chat.title)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-all duration-200 truncate ${
                            activeSessionId === chat.id
                              ? 'bg-primary/10 border border-primary/20 text-primary-light font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-surface/30'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate text-xs">{chat.title}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Agents list and status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> Running Agents</span>
                </div>
                <div className="space-y-1.5">
                  {agentKeys.map((k) => {
                    const agent = agents[k];
                    return (
                      <div 
                        key={agent.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface/20 border border-surface-border/50 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{agent.avatar}</span>
                          <div>
                            <div className="font-semibold text-foreground">{agent.name}</div>
                            <div className="text-[10px] text-muted-foreground">{agent.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-center w-6 h-6">
                          {getStatusIcon(agent.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Footer / Settings Toggle */}
            <div className="p-4 border-t border-surface-border">
              <button 
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface/50 border border-transparent hover:border-surface-border transition-all duration-200"
              >
                <Settings className="w-4.5 h-4.5" />
                <span>Preferences</span>
              </button>
            </div>

            {/* Simple Settings Modal Overlay */}
            {showSettings && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-md bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-2xl glow-purple"
                >
                  <div className="p-5 border-b border-surface-border flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" /> Settings
                    </h3>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="text-muted-foreground hover:text-foreground text-sm font-mono"
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">API Endpoint</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="http://127.0.0.1:8000/api"
                        className="w-full bg-background border border-surface-border px-3 py-2 rounded-xl text-sm font-mono text-muted-foreground outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">WebSocket URL</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="ws://127.0.0.1:8000/api/ws/research"
                        className="w-full bg-background border border-surface-border px-3 py-2 rounded-xl text-sm font-mono text-muted-foreground outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Engine Model</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="mistral-medium-3-5"
                        className="w-full bg-background border border-surface-border px-3 py-2 rounded-xl text-sm font-mono text-muted-foreground outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
