import React from 'react';
import { useResearchStore } from '../../store/useResearchStore';
import { 
  Compass, ShieldAlert, Cpu, ToggleLeft, ToggleRight, 
  PanelRight, PanelRightClose, RefreshCw, User, HelpCircle
} from 'lucide-react';

export default function Navbar() {
  const {
    selectedModel,
    setSelectedModel,
    selectedMode,
    setSelectedMode,
    isRightPanelOpen,
    setRightPanelOpen,
    currentTopic,
    isStreaming
  } = useResearchStore();

  const models = [
    { id: 'mistral-medium-3-5', name: 'Mistral Medium 3.5', description: 'Default fast reasoning model' },
    { id: 'mistral-large-latest', name: 'Mistral Large 2', description: 'Deep analytical report generation' },
    { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', description: 'Long context multi-modal parsing' },
  ];

  const modes = [
    { id: 'quick', name: 'Quick Search', description: 'Fast summary of query' },
    { id: 'deep', name: 'Deep Dive', description: 'Scrape multiple sites' },
    { id: 'comprehensive', name: 'Comprehensive', description: 'Full report + Critic evaluation' },
  ];

  return (
    <div className="h-16 border-b border-surface-border bg-background/50 backdrop-blur-md px-6 flex items-center justify-between z-30">
      {/* Left side: Current research topic context */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border border-surface-border px-2 py-1 rounded-lg bg-surface/30 font-mono">
          <Compass className="w-3.5 h-3.5" /> Workspace
        </div>
        {currentTopic && (
          <span className="text-sm font-semibold text-foreground truncate max-w-[200px] md:max-w-xs">
            {currentTopic}
          </span>
        )}
      </div>

      {/* Center/Right selectors */}
      <div className="flex items-center gap-4">
        {/* Model Selector */}
        <div className="relative group">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="appearance-none bg-surface border border-surface-border text-xs px-3.5 py-1.5 pr-8 rounded-xl font-medium text-foreground outline-none cursor-pointer hover:border-zinc-700 transition-colors"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
            <Cpu className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Research Mode Selector */}
        <div className="hidden md:flex bg-surface/60 border border-surface-border p-1 rounded-xl items-center gap-1">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                selectedMode === mode.id
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>

        {/* Small screen select fallback for research mode */}
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value)}
          className="md:hidden bg-surface border border-surface-border text-xs px-3 py-1.5 rounded-xl text-foreground outline-none"
        >
          {modes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* Right Panel Toggle */}
        <button
          onClick={() => setRightPanelOpen(!isRightPanelOpen)}
          className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
            isRightPanelOpen 
              ? 'bg-primary/10 border-primary/20 text-primary-light' 
              : 'bg-surface/50 border-surface-border text-muted-foreground hover:text-foreground'
          }`}
          title="Toggle Right Panel"
        >
          {isRightPanelOpen ? (
            <PanelRightClose className="w-4.5 h-4.5" />
          ) : (
            <PanelRight className="w-4.5 h-4.5" />
          )}
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-surface-border flex items-center justify-center text-zinc-300 font-bold overflow-hidden cursor-pointer hover:border-zinc-500 transition-colors shadow">
          <User className="w-4.5 h-4.5" />
        </div>
      </div>
    </div>
  );
}
