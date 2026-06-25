import React, { useState } from 'react';
import { useResearchStore } from '../../store/useResearchStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Flame, CheckCircle, ChevronDown, ChevronUp, AlertCircle, Bot
} from 'lucide-react';

export default function AgentActivity() {
  const { agents } = useResearchStore();
  const [expandedAgent, setExpandedAgent] = useState('search_agent');

  const agentKeys = Object.keys(agents);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'running':
        return {
          bg: 'bg-primary/10 border-primary/30',
          text: 'text-primary-light',
          badge: 'bg-primary/20 border-primary-light/30 text-primary-light',
          pulse: 'animate-pulse glow-purple'
        };
      case 'completed':
        return {
          bg: 'bg-secondary/10 border-secondary/30',
          text: 'text-secondary-light',
          badge: 'bg-secondary/20 border-secondary-light/30 text-secondary-light',
          pulse: ''
        };
      case 'error':
        return {
          bg: 'bg-red-500/10 border-red-500/30',
          text: 'text-red-400',
          badge: 'bg-red-500/20 border-red-400/30 text-red-400',
          pulse: ''
        };
      default:
        return {
          bg: 'bg-zinc-800/40 border-zinc-700/50',
          text: 'text-muted-foreground',
          badge: 'bg-zinc-800 border-zinc-700 text-muted-foreground',
          pulse: ''
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 select-none">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <h4 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-1.5">
          <Bot className="w-4.5 h-4.5 text-primary" /> Orchestrator Timeline
        </h4>
        <span className="text-[10px] bg-zinc-800 border border-surface-border text-muted-foreground px-1.5 py-0.5 rounded font-mono">
          PARALLEL COLLAB
        </span>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* Continuous vertical connector line */}
        <div className="absolute left-2.5 top-2 bottom-6 w-0.5 bg-gradient-to-b from-primary via-secondary to-zinc-800" />

        {agentKeys.map((key, index) => {
          const agent = agents[key];
          const styles = getStatusStyle(agent.status);
          const isExpanded = expandedAgent === key;

          return (
            <div key={agent.id} className="relative group">
              {/* Timeline Connector Indicator Dot */}
              <div 
                className={`absolute -left-[27.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-background transition-all duration-300 z-10 flex items-center justify-center ${
                  agent.status === 'running' 
                    ? 'border-primary shadow-lg shadow-primary/40' 
                    : agent.status === 'completed' 
                    ? 'border-secondary' 
                    : 'border-zinc-800'
                }`}
              >
                {agent.status === 'running' && (
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                )}
              </div>

              {/* Agent card container */}
              <div className={`border rounded-xl transition-all duration-300 ${styles.bg} ${styles.pulse}`}>
                <button
                  onClick={() => setExpandedAgent(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between p-3.5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl p-1.5 bg-background border border-surface-border/50 rounded-lg">
                      {agent.avatar}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                        {agent.name}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${styles.badge} font-mono tracking-wide uppercase`}>
                          {agent.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{agent.role}</div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </button>

                {/* Expandable Trace logs */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-surface-border/50 bg-background/30 rounded-b-xl"
                    >
                      <div className="p-3">
                        <div className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase mb-1.5">
                          Running Trace
                        </div>
                        <div className="bg-background border border-surface-border p-2.5 rounded-lg text-[10px] font-mono text-zinc-400 break-words leading-relaxed">
                          {agent.log || 'Agent initialized. Waiting to trigger...'}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
