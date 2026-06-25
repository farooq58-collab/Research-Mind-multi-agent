import React, { useRef, useEffect } from 'react';
import { useResearchStore } from '../../store/useResearchStore';
import MessageBubble from './MessageBubble';
import { Sparkles, Terminal, ShieldAlert, Cpu, Search, HelpCircle } from 'lucide-react';

export default function ChatArea() {
  const { messages, startResearch, isStreaming } = useResearchStore();
  const bottomRef = useRef(null);

  const starters = [
    { title: 'Mistral Large LLM Architecture', desc: 'Investigate layer configurations, parameter sizes, and structural changes.', icon: '🧠' },
    { title: 'Solid State Battery Advancements', desc: 'Assess commercial viability, anode materials, and charge rates in 2026.', icon: '🔋' },
    { title: 'CRISPR Gene Therapy Regulation', desc: 'Summarize clinical trial timelines and regulatory milestones in EMEA.', icon: '🧬' },
    { title: 'Superconductor Breakthrough Claims', desc: 'Analyze replication reviews and molecular pressure data from labs.', icon: '⚛️' }
  ];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center justify-center relative">
        {/* Glow grid details */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl w-full space-y-8 text-center z-10 relative">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary-light glow-purple">
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} /> Multi-Agent Collaborative System
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
              Agentic Research Workspace
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Launch multiple agents in parallel to crawl the web, extract content, compile detailed reports, and audit data quality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            {starters.map((item, idx) => (
              <button
                key={idx}
                onClick={() => startResearch(item.title)}
                disabled={isStreaming}
                className="p-5 text-left rounded-2xl bg-surface/40 hover:bg-surface border border-surface-border hover:border-zinc-800 transition-all duration-300 group hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[10px] bg-zinc-800 border border-surface-border text-muted-foreground px-1.5 py-0.5 rounded font-mono group-hover:text-primary-light transition-colors">
                    INVESTIGATE
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground group-hover:text-white transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 relative">
      {messages.map((msg, index) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isLast={index === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} className="h-10" />
    </div>
  );
}
