import React, { useState, useRef, useEffect } from 'react';
import { useResearchStore } from '../../store/useResearchStore';
import { 
  Paperclip, Mic, Send, Square, X, FileText, Sparkles, MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlassInput() {
  const { isStreaming, startResearch, ws, addLog } = useResearchStore();
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea to fit content height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [topic]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!topic.trim() || isStreaming) return;

    startResearch(topic);
    setTopic('');
    setFile(null); // Clear attachment on send
  };

  const handleKeyDown = (e) => {
    // Send on Enter, newline on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile({
        name: selectedFile.name,
        size: (selectedFile.size / 1024).toFixed(1) + ' KB'
      });
      addLog('UI_UPLOAD', `Attached file: ${selectedFile.name}`);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Mock typing in mic input
      setTopic(prev => prev + (prev ? ' ' : '') + 'AI chips architecture trends in 2026');
    } else {
      setIsRecording(true);
    }
  };

  const stopExecution = () => {
    if (ws) {
      ws.close();
      addLog('System', 'Research execution cancelled by user.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-6 pb-6 pt-2 relative z-20">
      <AnimatePresence>
        {/* Attachment visual badge */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-muted-foreground shadow-xl"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span className="max-w-[150px] truncate text-foreground font-semibold">{file.name}</span>
            <span className="text-[10px] text-zinc-500">({file.size})</span>
            <button 
              onClick={() => setFile(null)}
              className="p-0.5 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}

        {/* Animated Mic waves overlay */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-6 bottom-6 top-2 rounded-2xl bg-background/95 border border-primary/20 backdrop-blur flex items-center justify-between px-6 z-30"
          >
            <div className="flex items-center gap-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-semibold text-foreground tracking-wide font-mono">
                Listening to speech dictation...
              </span>
              <div className="flex items-end gap-1 h-5 pl-4">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [6, 20, 6] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.15,
                      ease: 'easeInOut'
                    }}
                    className="w-1 bg-primary rounded"
                  />
                ))}
              </div>
            </div>
            <button
              onClick={toggleRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-all"
            >
              <MicOff className="w-4 h-4" /> Stop & Process
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative">
        {/* Glassmorphic input panel */}
        <div className="glassmorphism-input neon-border rounded-2xl flex flex-col p-2.5 shadow-2xl transition-all duration-300 focus-within:border-primary/40 focus-within:shadow-primary/5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? 'Multi-agent pipeline running...' : 'Type a research topic (e.g. quantum cryptography advances)...'}
            disabled={isStreaming}
            className="w-full bg-transparent resize-none outline-none border-0 text-foreground placeholder-zinc-500 text-sm py-2 px-3 leading-relaxed max-h-[180px] min-h-[36px]"
          />

          {/* Action buttons bar */}
          <div className="flex items-center justify-between border-t border-surface-border/50 pt-2 px-1 mt-1">
            <div className="flex items-center gap-1">
              {/* Attachment trigger */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isStreaming}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-all duration-200 disabled:opacity-40"
                title="Attach Document"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </button>

              {/* Mic trigger */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isStreaming}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface/50 transition-all duration-200 disabled:opacity-40"
                title="Voice dictation"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>

              {/* Subtle typing help info */}
              <span className="hidden sm:inline text-[10px] text-zinc-500 pl-2 font-mono">
                Press Enter to send, Shift+Enter for new line
              </span>
            </div>

            {/* Submit / Cancel trigger */}
            <div>
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopExecution}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 hover:text-red-300 text-xs font-semibold tracking-wide transition-all duration-200"
                >
                  <Square className="w-3.5 h-3.5 fill-red-400" /> Stop Research
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!topic.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-light hover:from-primary-hover hover:to-primary text-xs font-semibold text-white tracking-wide transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                >
                  <span>Research</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
