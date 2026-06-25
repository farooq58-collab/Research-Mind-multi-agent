import React from 'react';
import { useResearchStore } from '../../store/useResearchStore';
import AgentActivity from './AgentActivity';
import CitationsList from './CitationsList';
import ConsoleLogs from './ConsoleLogs';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Link, Terminal } from 'lucide-react';

export default function RightPanel() {
  const { isRightPanelOpen, activeTab, setActiveTab } = useResearchStore();

  return (
    <AnimatePresence>
      {isRightPanelOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-screen bg-background border-l border-surface-border flex flex-col z-40 relative flex-shrink-0"
        >
          {/* Header tabs bar */}
          <div className="flex border-b border-surface-border bg-surface/30 p-2">
            {[
              { id: 'agent-trace', name: 'Agent Trace', icon: Bot },
              { id: 'citations', name: 'Sources', icon: Link },
              { id: 'logs', name: 'Dev Logs', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-surface border border-surface-border text-foreground font-semibold shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content panel */}
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="h-full flex flex-col"
              >
                {activeTab === 'agent-trace' && <AgentActivity />}
                {activeTab === 'citations' && <CitationsList />}
                {activeTab === 'logs' && <ConsoleLogs />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
