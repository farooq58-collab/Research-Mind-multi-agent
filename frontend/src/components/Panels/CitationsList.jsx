import React from 'react';
import { useResearchStore } from '../../store/useResearchStore';
import { Link, ExternalLink, Globe, BookOpen } from 'lucide-react';

export default function CitationsList() {
  const { citations } = useResearchStore();

  const getDomain = (urlStr) => {
    try {
      const url = new URL(urlStr);
      return url.hostname.replace('www.', '');
    } catch {
      return 'external';
    }
  };

  if (citations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3 select-none">
        <Globe className="w-10 h-10 text-zinc-700 animate-pulse" />
        <h5 className="text-xs font-semibold text-foreground">No citations gathered yet</h5>
        <p className="text-[11px] text-muted-foreground max-w-[200px]">
          Launch research to crawl references and scrape pages.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-surface-border pb-3">
        <h4 className="text-xs font-bold text-foreground tracking-wider uppercase flex items-center gap-1.5">
          <Globe className="w-4.5 h-4.5 text-primary" /> Citations & Sources
        </h4>
        <span className="text-[10px] bg-zinc-800 border border-surface-border text-muted-foreground px-1.5 py-0.5 rounded font-mono">
          {citations.length} FOUND
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto pr-1">
        {citations.map((c, i) => (
          <a
            key={i}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3.5 border border-surface-border hover:border-zinc-800 rounded-xl bg-surface/20 hover:bg-surface transition-all duration-300 group hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold bg-zinc-800 text-muted-foreground w-5 h-5 rounded-full flex items-center justify-center font-mono">
                {i + 1}
              </span>
              <span className="text-[9px] text-primary-light font-mono flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                {getDomain(c.url)} <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
            <h5 className="text-xs font-semibold text-foreground leading-snug group-hover:text-white transition-colors">
              {c.title || 'Search Citation Source'}
            </h5>
            <p className="text-[11px] text-muted-foreground leading-normal mt-1.5 line-clamp-3">
              {c.snippet || 'No summary available.'}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
