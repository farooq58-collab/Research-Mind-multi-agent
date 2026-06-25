import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useResearchStore } from '../../store/useResearchStore';
import { 
  Copy, Check, RefreshCw, AlertCircle, Quote, 
  ArrowUpRight, Award, ChevronDown, ChevronUp, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessageBubble({ message, isLast }) {
  const { isStreaming, regenerateReport } = useResearchStore();
  const [copied, setCopied] = useState(false);
  const [showCritic, setShowCritic] = useState(false);

  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col gap-3 max-w-4xl mx-auto w-full ${isUser ? 'items-end' : 'items-start'}`}
    >
      {/* Sender Profile Header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-zinc-500 font-mono">
          {isUser ? 'REQUESTOR' : 'RESEARCH ENGINE'}
        </span>
        <span className="text-zinc-700">•</span>
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Message Box */}
      <div 
        className={`w-full p-6 rounded-2xl border transition-all duration-300 ${
          isUser 
            ? 'bg-primary/5 border-primary/20 text-foreground max-w-2xl shadow-lg shadow-primary/5' 
            : 'bg-surface/50 border-surface-border text-foreground hover:border-zinc-800 shadow-md'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{message.content}</p>
        ) : (
          <div className="space-y-6">
            {/* Markdown Text rendering */}
            <div className={`prose ${message.isStreaming ? 'typing-cursor' : ''}`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw]}
              >
                {message.content || 'Synthesizing knowledge stream...'}
              </ReactMarkdown>
            </div>

            {/* Citations Footer (If present) */}
            {message.citations && message.citations.length > 0 && (
              <div className="pt-4 border-t border-surface-border/50">
                <div className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mb-2">
                  Sources Verified
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.citations.map((c, i) => (
                    <a
                      key={i}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                      <span className="text-[9px] bg-zinc-800 text-muted-foreground w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono">
                        {i + 1}
                      </span>
                      <span className="truncate max-w-[120px]">{c.title || c.url}</span>
                      <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Critique Feedback & Score section */}
            {message.criticFeedback && (
              <div className="border border-surface-border rounded-xl bg-surface/30 overflow-hidden">
                <button
                  onClick={() => setShowCritic(!showCritic)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-surface/60 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-semibold text-foreground">Critic Review & Quality Audit</span>
                    {message.score && (
                      <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded font-mono">
                        Score: {message.score}
                      </span>
                    )}
                  </div>
                  {showCritic ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                <AnimatePresence>
                  {showCritic && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-surface-border bg-background/25"
                    >
                      <div className="p-4 prose prose-sm text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {message.criticFeedback}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bubble Action Controls (for AI response) */}
      {!isUser && !message.isStreaming && (
        <div className="flex items-center gap-2 px-1">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border/50 text-[11px] text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-all duration-200"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-secondary-light" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Report</span>
              </>
            )}
          </button>
          {isLast && (
            <button
              onClick={() => regenerateReport()}
              disabled={isStreaming}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border/50 text-[11px] text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
