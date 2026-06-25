import React, { useRef, useEffect } from 'react';
import { useResearchStore } from '../../store/useResearchStore';
import { Terminal, Trash2 } from 'lucide-react';

export default function ConsoleLogs() {
  const { logs } = useResearchStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = () => {
    useResearchStore.setState({ logs: [] });
  };

  const getLogColor = (source) => {
    switch (source) {
      case 'WS_RECV':
        return 'text-cyan-400';
      case 'System':
        return 'text-primary-light';
      case 'ERROR':
        return 'text-red-400';
      case 'UI_UPLOAD':
        return 'text-amber-400';
      default:
        return 'text-zinc-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full select-text">
      {/* Header with clear button */}
      <div className="flex items-center justify-between border-b border-surface-border pb-3 mb-3">
        <h4 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-1.5">
          <Terminal className="w-4.5 h-4.5 text-primary" /> Execution Console
        </h4>
        <button
          onClick={clearLogs}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
          title="Clear console"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Terminal logs list */}
      <div className="flex-1 bg-surface border border-surface-border rounded-xl p-3.5 font-mono text-[10px] leading-relaxed overflow-y-auto space-y-2 h-72">
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic">Console idle. Trigger actions to inspect payload details.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="border-b border-zinc-900/50 pb-1.5 last:border-0 last:pb-0 break-words">
              <span className="text-zinc-600 mr-2">[{log.timestamp}]</span>
              <span className={`font-semibold mr-1.5 ${getLogColor(log.source)}`}>
                {log.source}:
              </span>
              <span className="text-zinc-300 select-text">{log.content}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
